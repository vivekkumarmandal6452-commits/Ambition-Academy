import { Router } from 'express';
import { getTests, getTestById, startTest, submitTest, getTestResult } from '../controllers/testController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTests);
router.get('/:id', authenticate, getTestById);
router.post('/:id/start', authenticate, startTest);
router.post('/:id/submit', authenticate, submitTest);
router.get('/:id/result', authenticate, getTestResult);

export default router;
