import { Router } from 'express';
import { register, login, syncProfile, getMe, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/profile', authenticate, syncProfile);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
