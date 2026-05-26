import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Assignment from '../models/Assignment';
import { enqueueGeneration } from '../queues/assignmentQueue';
import { CreateAssignmentDTO } from '../types';
import { cacheGet, cacheSet, cacheDel } from '../services/redis';

const router = Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// GET /api/assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const cached = await cacheGet<unknown[]>('assignments:list');
    if (cached) {
      res.json({ success: true, data: cached, cached: true });
      return;
    }

    const assignments = await Assignment.find()
      .select('-generatedPaper -uploadedFileText')
      .sort({ createdAt: -1 });

    await cacheSet('assignments:list', assignments, 60);
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cacheKey = `assignment:${req.params.id}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached, cached: true });
      return;
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    await cacheSet(cacheKey, assignment, 300);
    res.json({ success: true, data: assignment });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
});

// POST /api/assignments
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const body: CreateAssignmentDTO = JSON.parse(
      typeof req.body.data === 'string' ? req.body.data : JSON.stringify(req.body)
    );

    // Validation
    if (!body.title?.trim()) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }
    if (!body.subject?.trim()) {
      res.status(400).json({ success: false, error: 'Subject is required' });
      return;
    }
    if (!body.dueDate) {
      res.status(400).json({ success: false, error: 'Due date is required' });
      return;
    }
    if (!body.questionTypes?.length) {
      res.status(400).json({ success: false, error: 'At least one question type is required' });
      return;
    }
    for (const qt of body.questionTypes) {
      if (!qt.count || qt.count < 1) {
        res.status(400).json({ success: false, error: `Invalid question count for ${qt.type}` });
        return;
      }
      if (!qt.marksPerQuestion || qt.marksPerQuestion < 1) {
        res.status(400).json({ success: false, error: `Invalid marks for ${qt.type}` });
        return;
      }
    }

    // Handle file upload
    let uploadedFileText: string | undefined;
    let uploadedFilePath: string | undefined;
    if (req.file) {
      uploadedFilePath = req.file.path;
      if (req.file.mimetype === 'text/plain') {
        uploadedFileText = fs.readFileSync(req.file.path, 'utf-8');
      } else if (req.file.mimetype === 'application/pdf') {
        try {
          // Dynamic import to avoid issues if pdf-parse fails
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require('pdf-parse');
          const dataBuffer = fs.readFileSync(req.file.path);
          const pdfData = await pdfParse(dataBuffer);
          uploadedFileText = pdfData.text;
        } catch {
          console.warn('[Routes] PDF parsing failed, continuing without text extraction');
        }
      }
    }

    const assignment = await Assignment.create({
      ...body,
      uploadedFilePath,
      uploadedFileText,
      status: 'pending',
    });

    // Enqueue generation job
    const jobId = await enqueueGeneration(assignment._id.toString());
    assignment.jobId = jobId;
    await assignment.save();

    // Invalidate list cache
    await cacheDel('assignments:list');

    res.status(201).json({
      success: true,
      data: {
        _id: assignment._id,
        title: assignment.title,
        status: assignment.status,
        jobId: assignment.jobId,
      },
    });
  } catch (err) {
    console.error('[Routes] Create assignment error:', err);
    res.status(500).json({ success: false, error: 'Failed to create assignment' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }
    await cacheDel(`assignment:${req.params.id}`);
    await cacheDel('assignments:list');
    res.json({ success: true, message: 'Assignment deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete assignment' });
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    assignment.status = 'pending';
    assignment.generatedPaper = undefined;
    const jobId = await enqueueGeneration(assignment._id.toString());
    assignment.jobId = jobId;
    await assignment.save();

    await cacheDel(`assignment:${req.params.id}`);
    await cacheDel(`paper:${req.params.id}`);

    res.json({ success: true, message: 'Regeneration started', jobId });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to regenerate' });
  }
});

export default router;
