import { Router } from 'express';
import { getLiveClasses, getLiveClassById } from '../controllers/classController';
import { authenticate } from '../middleware/auth';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getLiveClasses);
router.get('/:id', authenticate, getLiveClassById);

export default router;
