import { Router } from 'express';
import { getDoubts, createDoubt, answerDoubt } from '../controllers/doubtController';
import { authenticate } from '../middleware/auth';
import { requireInstructor } from '../middleware/roles';

const router = Router();

router.get('/', authenticate, getDoubts);
router.post('/', authenticate, createDoubt);
router.post('/:id/answer', authenticate, requireInstructor, answerDoubt);

export default router;
