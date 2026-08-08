import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import batchRoutes from './routes/batches';
import enrollmentRoutes from './routes/enrollments';
import progressRoutes from './routes/progress';
import classRoutes from './routes/classes';
import testRoutes from './routes/tests';
import doubtRoutes from './routes/doubts';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import galleryRoutes from './routes/gallery';
import aiRoutes from './ai/ai.routes';
import { errorHandler, notFoundHandler } from './middleware/error';

dotenv.config();

const app = express();

// ──────────────── SECURITY & CORS MIDDLEWARE ────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Universal CORS handler for all origins, preflights, and request headers
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// ──────────────── BODY & LOGGING ────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ──────────────── HEALTH CHECK ────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Ambition Academy API is running', timestamp: new Date().toISOString() });
});

// ──────────────── ROUTES ────────────────
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/ai', aiRoutes);

// ──────────────── ERROR HANDLING ────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
