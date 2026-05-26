import { Router, Request, Response } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';

const router = Router();

// Keep audio in memory — no disk writes needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB (Groq limit)
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/transcribe
router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No audio file provided' });
    return;
  }

  try {
    // Convert Buffer to Uint8Array so File accepts a BlobPart in TS.
    const audioBytes = new Uint8Array(req.file.buffer);
    const audioFile = new File([audioBytes], 'recording.webm', {
      type: req.file.mimetype || 'audio/webm',
    });

    const result = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'json',
    });

    res.json({ success: true, text: result.text.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    console.error('[Transcribe] Error:', message);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
