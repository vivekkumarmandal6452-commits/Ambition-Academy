import { Router } from 'express';
import { getBatches, getBatchBySlug, checkEnrollment } from '../controllers/batchController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getBatches);
router.get('/:slug', optionalAuth, getBatchBySlug);
router.get('/:id/enroll-check', authenticate, checkEnrollment);

export default router;
