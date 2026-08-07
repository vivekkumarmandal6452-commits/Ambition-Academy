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

// ──────────────── SECURITY MIDDLEWARE ────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

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
