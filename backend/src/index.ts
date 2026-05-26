import 'dotenv/config';
import dns from 'dns';
// Force Node.js to use Google DNS which supports SRV records (fixes ECONNREFUSED on mongodb+srv://)
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import { initWebSocket } from './services/websocket';
import assignmentRoutes from './routes/assignments';
import transcribeRoutes from './routes/transcribe';
import { startWorker } from './workers/generationWorker';

const app = express();
const server = http.createServer(app);

// Middleware
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps, etc.)
    if (!origin) return cb(null, true);
    // Allow exact matches from FRONTEND_URL
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Allow all Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    // Allow localhost in development
    if (origin.startsWith('http://localhost')) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/transcribe', transcribeRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket
initWebSocket(server);

// MongoDB + Worker (worker starts after DB is ready)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('[DB] MongoDB connected');
    await startWorker();
  })
  .catch((err) => console.error('[DB] MongoDB connection error:', err));

// Uploads directory
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[WS] WebSocket ready on ws://localhost:${PORT}/ws`);
});

export default app;
