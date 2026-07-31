import { Router } from 'express';
import { getMyEnrollments, enrollInBatch } from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';
import { requireStudent } from '../middleware/roles';

const router = Router();

router.get('/me', authenticate, requireStudent, getMyEnrollments);
router.post('/', authenticate, requireStudent, enrollInBatch);

export default router;
