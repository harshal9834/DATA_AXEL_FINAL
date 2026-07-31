console.log('[DEBUG] Server Started');

// ─── CRITICAL: Load .env FIRST — before ANY other import ──────────────────────
// This must be the very first executable statement so all modules that read
// process.env at import time (lazy singletons, etc.) see the correct values.
import dotenv from 'dotenv';
import { resolve } from 'path';

// Force-load .env relative to this file, overriding any stale process.env values
const envResult = dotenv.config({
  path: resolve(__dirname, '../.env'),
  override: true,
});
if (envResult.error) {
  console.error('[FATAL] Failed to load .env file:', envResult.error.message);
} else {
  const loaded = Object.keys(envResult.parsed || {});
  console.log(`[ENV] Loaded ${loaded.length} variables from .env:`, loaded.join(', '));
}

// Verify critical keys immediately
const REQUIRED_ENV = ['OPENROUTER_API_KEY', 'FIREBASE_PROJECT_ID'];
for (const key of REQUIRED_ENV) {
  if (process.env[key]) {
    console.log(`[ENV] ✅ ${key} = ${process.env[key]!.slice(0, 12)}...`);
  } else {
    console.error(`[ENV] ❌ MISSING: ${key}`);
  }
}

// ─── Now import everything else ────────────────────────────────────────────────
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { languageMiddleware } from './middleware/languageMiddleware';
import { translateError } from './utils/errorTranslator';

process.on('uncaughtException', (err) => {
  console.error('\n[FATAL] uncaughtException:', err.stack || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('\n[FATAL] unhandledRejection:', reason);
});
const _originalExit = process.exit;
process.exit = function(code?: number): never {
  console.error('\n[FATAL] process.exit() called with code:', code);
  return _originalExit(code);
};

console.log('[DEBUG] Firebase Ready');

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  console.log(`[Prisma Query] ${e.query}`);
});

const app = express();
const port = process.env.PORT || 3001;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log('[DEBUG] Socket Ready');

app.use(cors());
app.use(express.json());
app.use(languageMiddleware);

// Detailed Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n[Incoming Request] ${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      console.log(`[Failure] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    } else {
      console.log(`[Success] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

import { registerVoiceSocket } from './services/voice/voiceSocket';
console.log('[DEBUG] OpenRouter Ready');
console.log('[DEBUG] MCP Ready');
registerVoiceSocket(io);
console.log('[DEBUG] Voice Ready');

import workflowRoutes from './routes/workflowRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import resourcesRoutes from './routes/resourcesRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import analyticsAdvancedRoutes from './routes/analyticsAdvancedRoutes';
import projectRoutes from './routes/projectRoutes';
import uploadRoutes from './routes/uploadRoutes';

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running!',
    env: {
      openrouter: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
      firebase: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
    }
  });
});

app.use('/api/workflows', workflowRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics-advanced', analyticsAdvancedRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('\n[Exception] Unhandled error caught in global handler:');
  console.error(err.stack || err);
  
  const rawMessage = err.message || 'Internal Server Error';
  const locale = req.locale || 'en';
  
  // Do not block the event loop for translation if possible, or await it
  const translatedMessage = await translateError(rawMessage, locale);
  
  res.status(500).json({ 
    success: false, 
    message: translatedMessage, 
    originalMessage: rawMessage, // always good to have for dev debugging
    stack: err.stack 
  });
});

httpServer.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
