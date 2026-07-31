import { Router } from 'express';
import {
  getNotifications, markRead, markAllRead, getAnnouncements,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markRead);
router.get('/announcements', authenticate, getAnnouncements);

export default router;
