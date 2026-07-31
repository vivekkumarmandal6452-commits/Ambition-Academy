import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import {
  chat, getConversations, getConversationMessages, renameConversation, deleteConversation,
  generateStudyPlan, getStudyPlan, updateStudyPlanTask, analyzePerformance,
  generateQuestions, saveQuizSession, generateNotes, getNotes, deleteNote,
  solveDoubt, vivaSession, getRecommendations, adminGenerateContent, adminGetStudentInsights
} from './ai.controller';

const router = Router();

// Student AI endpoints require authentication
router.use(authenticate);

// Chat & History
router.post('/chat', chat);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.put('/conversations/:id', renameConversation);
router.delete('/conversations/:id', deleteConversation);

// Study Plan
router.post('/study-plan', generateStudyPlan);
router.get('/study-plan', getStudyPlan);
router.post('/study-plan/task-status', updateStudyPlanTask);

// Performance Analysis & Recommendations
router.post('/analyze-performance', analyzePerformance);
router.get('/recommendations', getRecommendations);

// Question Generator & Quiz Sessions
router.post('/generate-questions', generateQuestions);
router.post('/save-quiz', saveQuizSession);

// AI Notes
router.post('/generate-notes', generateNotes);
router.get('/notes', getNotes);
router.delete('/notes/:id', deleteNote);

// Doubt Solver & Viva Mode
router.post('/doubt', solveDoubt);
router.post('/viva', vivaSession);

// Admin AI endpoints require admin role
router.post('/admin/generate-content', requireAdmin, adminGenerateContent);
router.get('/admin/insights', requireAdmin, adminGetStudentInsights);

export default router;
