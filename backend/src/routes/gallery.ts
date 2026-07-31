import { Router } from 'express';
import { getGalleryItems, addGalleryItem, deleteGalleryItem } from '../controllers/galleryController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

router.get('/', getGalleryItems);
router.post('/admin', authenticate, requireAdmin, addGalleryItem);
router.delete('/admin/:id', authenticate, requireAdmin, deleteGalleryItem);

export default router;
