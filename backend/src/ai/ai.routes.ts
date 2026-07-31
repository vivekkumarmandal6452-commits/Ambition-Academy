import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import {
  chat, getConversations, getConversationMessages, renameConversation, deleteConversation,
  generateStudyPlan, getStudyPlan, updateStudyPlanTask, analyzePerformance,
  generateQuestions, saveQuizSession, generateNotes, getNotes, deleteNote,
  solveDoubt, vivaSession, getRecommendations,
  adminGenerateContent, adminGetStudentInsights, adminGetStudentAISummary,
  // NEW: Immutable AI Test System
  startAITest, resumeAITest, submitAITest, getAITestHistory, getAITestAttempt,
  // NEW: Activity Timeline
  getStudentActivity,
} from './ai.controller';

const router = Router();

// All student AI endpoints require authentication
router.use(authenticate);

// ── Chat & History ──────────────────────────────────────────────────────────
router.post('/chat', chat);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.put('/conversations/:id', renameConversation);
router.delete('/conversations/:id', deleteConversation);

// ── Study Plan ──────────────────────────────────────────────────────────────
router.post('/study-plan', generateStudyPlan);
router.get('/study-plan', getStudyPlan);
router.post('/study-plan/task-status', updateStudyPlanTask);

// ── Performance Analysis & Recommendations ──────────────────────────────────
router.post('/analyze-performance', analyzePerformance);
router.get('/recommendations', getRecommendations);

// ── Legacy Question Generator & Quiz Sessions ───────────────────────────────
router.post('/generate-questions', generateQuestions);
router.post('/save-quiz', saveQuizSession);

// ── NEW: Immutable AI Test System (unique questions, no repeats) ────────────
router.post('/test/start', startAITest);                      // Start or resume (returns attempt)
router.get('/test/history', getAITestHistory);               // All attempts for student
router.get('/test/resume/:attemptId', resumeAITest);          // Resume specific attempt
router.post('/test/:attemptId/submit', submitAITest);         // Submit and score
router.get('/test/attempt/:attemptId', getAITestAttempt);     // Full Q&A detail

// ── AI Notes ────────────────────────────────────────────────────────────────
router.post('/generate-notes', generateNotes);
router.get('/notes', getNotes);
router.delete('/notes/:id', deleteNote);

// ── Doubt Solver & Viva Mode ────────────────────────────────────────────────
router.post('/doubt', solveDoubt);
router.post('/viva', vivaSession);

// ── Activity Timeline ───────────────────────────────────────────────────────
router.get('/activity', getStudentActivity);

// ── Admin AI Endpoints (require admin role) ─────────────────────────────────
router.post('/admin/generate-content', requireAdmin, adminGenerateContent);
router.get('/admin/insights', requireAdmin, adminGetStudentInsights);
router.get('/admin/student/:studentId/ai-summary', requireAdmin, adminGetStudentAISummary);

export default router;
