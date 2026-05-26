import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { redis, cacheSet } from '../services/redis';
import { generatePaper } from '../services/ai';
import { notifyClients } from '../services/websocket';
import Assignment from '../models/Assignment';
import { GenerationJobData } from '../queues/assignmentQueue';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
    console.log('[Worker] MongoDB connected');
  }
}

async function processJob(job: Job<GenerationJobData>) {
  const { assignmentId } = job.data;
  console.log(`[Worker] Processing job for assignment: ${assignmentId}`);

  await connectDB();

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

  assignment.status = 'processing';
  await assignment.save();

  await job.updateProgress(10);
  await notifyClients(assignmentId, {
    type: 'job_update',
    assignmentId,
    status: 'processing',
    progress: 10,
  });

  const dto = {
    title: assignment.title,
    subject: assignment.subject,
    className: assignment.className,
    schoolName: assignment.schoolName,
    dueDate: assignment.dueDate.toISOString(),
    questionTypes: assignment.questionTypes,
    additionalInstructions: assignment.additionalInstructions,
    timeAllowed: assignment.timeAllowed,
  };

  await job.updateProgress(30);
  await notifyClients(assignmentId, {
    type: 'job_update',
    assignmentId,
    status: 'processing',
    progress: 30,
  });

  const generatedPaper = await generatePaper(dto, assignment.uploadedFileText);

  await job.updateProgress(80);
  await notifyClients(assignmentId, {
    type: 'job_update',
    assignmentId,
    status: 'processing',
    progress: 80,
  });

  assignment.status = 'completed';
  assignment.generatedPaper = generatedPaper;
  await assignment.save();

  await cacheSet(`paper:${assignmentId}`, generatedPaper, 86400);

  await job.updateProgress(100);
  await notifyClients(assignmentId, {
    type: 'job_completed',
    assignmentId,
    status: 'completed',
    progress: 100,
    data: generatedPaper,
  });

  console.log(`[Worker] Completed assignment: ${assignmentId}`);
  return generatedPaper;
}

/** Start the BullMQ worker. Call this after the DB is already connected. */
export async function startWorker() {
  const worker = new Worker<GenerationJobData>('assignment-generation', processJob, {
    connection: redis,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    if (job?.data.assignmentId) {
      try {
        await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
        await notifyClients(job.data.assignmentId, {
          type: 'job_failed',
          assignmentId: job.data.assignmentId,
          status: 'failed',
          error: err.message,
        });
      } catch (dbErr) {
        console.error('[Worker] Failed to update assignment status:', dbErr);
      }
    }
  });

  worker.on('error', (err) => console.error('[Worker] Error:', err));

  console.log('[Worker] Generation worker started');

  process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
  });

  return worker;
}

// Allow running as a standalone process: `npm run worker`
if (require.main === module) {
  connectDB().then(() => startWorker()).catch(console.error);
}
