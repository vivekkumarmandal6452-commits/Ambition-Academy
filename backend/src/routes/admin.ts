import { Router } from 'express';
import {
  getAdminDashboard, getUsers, updateUserRole,
  adminGetBatches, adminCreateBatch, adminUpdateBatch, adminDeleteBatch,
  adminGetSubjects, adminCreateSubject, adminCreateChapter,
  adminGetLectures, adminCreateLecture, adminUpdateLecture, adminDeleteLecture,
  adminCreateTest, adminCreateAnnouncement, adminGetDoubts,
  adminGetStudyMaterials, adminCreateStudyMaterial, adminDeleteStudyMaterial, adminGetCategories,
  getAdminRevenue, getAdminPurchases, getStudentDetail, getAdminAITestAnalytics,
} from '../controllers/adminController';
import { createLiveClass, updateLiveClass, deleteLiveClass, getLiveClasses } from '../controllers/classController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Categories
router.get('/categories', adminGetCategories);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);

// Student Detail
router.get('/students/:studentId', getStudentDetail);

// Batches
router.get('/batches', adminGetBatches);
router.post('/batches', adminCreateBatch);
router.put('/batches/:id', adminUpdateBatch);
router.delete('/batches/:id', adminDeleteBatch);

// Subjects & Chapters
router.get('/subjects', adminGetSubjects);
router.post('/subjects', adminCreateSubject);
router.post('/chapters', adminCreateChapter);

// Lectures
router.get('/lectures', adminGetLectures);
router.post('/lectures', adminCreateLecture);
router.put('/lectures/:id', adminUpdateLecture);
router.delete('/lectures/:id', adminDeleteLecture);

// Live Classes
router.get('/classes', getLiveClasses);
router.post('/classes', createLiveClass);
router.put('/classes/:id', updateLiveClass);
router.delete('/classes/:id', deleteLiveClass);

// Tests
router.post('/tests', adminCreateTest);

// Announcements
router.post('/announcements', adminCreateAnnouncement);

// Doubts
router.get('/doubts', adminGetDoubts);

// Study Materials
router.get('/study-materials', adminGetStudyMaterials);
router.post('/study-materials', adminCreateStudyMaterial);
router.delete('/study-materials/:id', adminDeleteStudyMaterial);

// Revenue & Purchases (NEW)
router.get('/revenue', getAdminRevenue);
router.get('/purchases', getAdminPurchases);

// AI Analytics (NEW)
router.get('/ai-analytics', getAdminAITestAnalytics);

export default router;
