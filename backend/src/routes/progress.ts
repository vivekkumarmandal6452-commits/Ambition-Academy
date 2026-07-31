import { Router } from 'express';
import { getProgress, saveProgress, getLectureProgress } from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getProgress);
router.post('/', authenticate, saveProgress);
router.get('/lecture/:id', authenticate, getLectureProgress);

export default router;
