import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { aiStore, generateQuestionFingerprint, questionSimilarity } from './ai.store';
import { buildStudentContext, retrieveRAGContext } from './ai.context';
import { sendSuccess, sendError } from '../utils/response';
import { AIRecommendation, AITestAttemptQuestion } from './ai.types';

// ──────────────── 1. ASK AMBITION AI CHAT ────────────────
export const chat = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversation_id, message, lecture_context, material_context } = req.body;

    if (!message) { sendError(res, 'Message is required', 400); return; }

    const rateCheck = aiStore.checkAndIncrementUsage(userId, 100);
    if (!rateCheck.allowed) {
      sendError(res, 'Daily AI request limit reached. Please try again tomorrow!', 429);
      return;
    }

    let convId = conversation_id;
    let conv = convId ? aiStore.getConversationById(convId) : null;
    if (!conv) {
      const title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      conv = aiStore.createConversation(userId, title);
      convId = conv.id;
    }

    aiStore.addMessage({ conversation_id: convId, role: 'user', content: message });

    const studentCtx = await buildStudentContext(userId);
    const ragChunks = await retrieveRAGContext(message, 3);

    let systemPrompt = `Student Name: ${studentCtx.studentName}. Enrolled Batches: ${studentCtx.enrolledBatches.join(', ')}.`;
    if (lecture_context) systemPrompt += ` Current Lecture Context: ${JSON.stringify(lecture_context)}.`;
    if (material_context) systemPrompt += ` Current Study Material Context: ${JSON.stringify(material_context)}.`;

    let promptWithContext = message;
    if (ragChunks.length > 0) {
      promptWithContext += `\n\n[RELEVANT AMBITION ACADEMY KNOWLEDGE BASE]\n` +
        ragChunks.map(c => `- ${c.source}: ${c.content}`).join('\n');
    }

    const aiResponseText = await aiService.generateText(promptWithContext, systemPrompt);
    const sources = ragChunks.map(c => ({ type: c.type, title: c.title, chunk: c.source }));

    const assistantMsg = aiStore.addMessage({
      conversation_id: convId,
      role: 'assistant',
      content: aiResponseText,
      sources,
    });

    // Log activity
    aiStore.logActivity({
      user_id: userId,
      type: 'ai_chat',
      title: 'Asked AI a question',
      description: message.slice(0, 100),
      entity_id: convId,
      entity_type: 'conversation',
    });

    sendSuccess(res, { conversation_id: convId, message: assistantMsg });
  } catch (err: any) {
    sendError(res, err?.message || 'AI Chat failed', 500);
  }
};

// ──────────────── 2. CHAT HISTORY ────────────────
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    sendSuccess(res, aiStore.getConversations(userId));
  } catch { sendError(res, 'Failed to fetch conversations', 500); }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    sendSuccess(res, aiStore.getMessages(String(req.params.id)));
  } catch { sendError(res, 'Failed to fetch messages', 500); }
};

export const renameConversation = async (req: Request, res: Response) => {
  try {
    const updated = aiStore.renameConversation(String(req.params.id), req.body.title);
    if (!updated) { sendError(res, 'Conversation not found', 404); return; }
    sendSuccess(res, updated);
  } catch { sendError(res, 'Failed to rename conversation', 500); }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    aiStore.deleteConversation(String(req.params.id));
    sendSuccess(res, null, 'Conversation deleted');
  } catch { sendError(res, 'Failed to delete conversation', 500); }
};

// ──────────────── 3. AI PERSONALIZED STUDY PLANNER ────────────────
export const generateStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { exam, target_date, daily_minutes, subjects, current_level, target_score } = req.body;

    const tasks = await aiService.generateStudyPlan(
      exam || 'JEE Main',
      target_date || new Date(Date.now() + 90 * 86400000).toISOString(),
      Number(daily_minutes) || 120,
      subjects || ['Physics', 'Chemistry', 'Mathematics'],
      current_level || 'intermediate'
    );

    const savedPlan = aiStore.saveStudyPlan({
      user_id: userId, exam, target_date,
      daily_minutes: Number(daily_minutes) || 120,
      subjects, current_level, target_score, tasks,
    });

    aiStore.logActivity({
      user_id: userId,
      type: 'ai_study_plan_created',
      title: 'Created AI Study Plan',
      description: `${exam} study plan with ${subjects?.join(', ')} subjects`,
      entity_id: savedPlan.id,
      entity_type: 'study_plan',
    });

    sendSuccess(res, savedPlan, 'AI Study plan generated and saved!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to generate study plan', 500);
  }
};

export const getStudyPlan = async (req: Request, res: Response) => {
  try {
    sendSuccess(res, aiStore.getStudyPlan(req.user!.id) || null);
  } catch { sendError(res, 'Failed to fetch study plan', 500); }
};

export const updateStudyPlanTask = async (req: Request, res: Response) => {
  try {
    const { taskId, status } = req.body;
    sendSuccess(res, aiStore.updateStudyTaskStatus(req.user!.id, taskId, status));
  } catch { sendError(res, 'Failed to update task status', 500); }
};

// ──────────────── 4. AI WEAKNESS ANALYZER ────────────────
export const analyzePerformance = async (req: Request, res: Response) => {
  try {
    // Enrich with real test attempt data
    const userId = req.user!.id;
    const attempts = aiStore.getStudentTestAttempts(userId).filter(a => a.status === 'completed');
    const analysis = await aiService.analyzeWeakness({ userId, attempts, ...req.body });
    sendSuccess(res, analysis);
  } catch { sendError(res, 'Failed to analyze performance', 500); }
};

// ──────────────── 5. AI QUESTION GENERATOR (legacy — for AiQuizPage basic mode) ────────────────
export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty, count, questionType } = req.body;
    const questions = await aiService.generateQuestions(
      subject || 'Physics', topic || 'Kinematics',
      difficulty || 'medium', Number(count) || 5, questionType || 'MCQ'
    );
    sendSuccess(res, questions);
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to generate questions', 500);
  }
};

export const saveQuizSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const session = aiStore.saveQuizSession({ user_id: userId, ...req.body });
    sendSuccess(res, session, 'Quiz session saved');
  } catch { sendError(res, 'Failed to save quiz session', 500); }
};

// ──────────────── 6. IMMUTABLE AI TEST SYSTEM ────────────────

/**
 * POST /api/ai/test/start
 * Creates a new immutable AI test attempt with UNIQUE questions.
 * If an in-progress attempt exists for same subject+topic+difficulty, returns it (resume).
 */
export const startAITest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subject, topic, difficulty, count, questionType, force_new } = req.body;

    const subj = subject || 'Physics';
    const tpc = topic || 'Kinematics';
    const diff = difficulty || 'medium';
    const qCount = Math.min(Number(count) || 10, 20);
    const qType = questionType || 'MCQ';

    // Check for existing in-progress attempt (resume logic)
    if (!force_new) {
      const existing = aiStore.getInProgressAttempt(userId, subj, tpc, diff);
      if (existing) {
        return sendSuccess(res, { attempt: existing, resumed: true }, 'Resuming existing test');
      }
    }

    // Get all fingerprints this student has seen for this topic
    const seenFingerprints = aiStore.getStudentSeenFingerprints(userId, subj, tpc);

    // Check question bank for unused questions first
    const bankQuestions = aiStore.getUnusedQuestionsForStudent(userId, subj, tpc, diff, qCount);

    let questions: AITestAttemptQuestion[];

    if (bankQuestions.length >= qCount) {
      // Enough in bank — use them
      questions = bankQuestions.map((bq, idx) => ({
        question_id: `q_${idx}_${bq.fingerprint}`,
        fingerprint: bq.fingerprint,
        question_text: bq.question_text,
        options: [...bq.options].sort(() => Math.random() - 0.5), // randomize option order
        correct_answer: bq.correct_answer,
        explanation: bq.explanation,
        topic: bq.topic,
        difficulty: bq.difficulty,
      }));
    } else {
      // Not enough in bank — generate new unique questions
      const bankFps = bankQuestions.map(q => q.fingerprint);
      const allExcluded = [...new Set([...seenFingerprints, ...bankFps])];

      const aiQuestions = await aiService.generateUniqueQuestions(
        subj, tpc, diff, qCount - bankQuestions.length, qType, allExcluded, userId
      );

      // Save new questions to bank
      aiStore.addQuestionsToBank(
        aiQuestions.map(q => ({
          fingerprint: q.fingerprint || generateQuestionFingerprint(q.question, q.options, q.correctAnswer),
          subject: subj,
          topic: tpc,
          difficulty: diff,
          question_type: qType,
          question_text: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        })),
        userId
      );

      // Also mark bank questions as used
      if (bankQuestions.length > 0) {
        aiStore.addQuestionsToBank(
          bankQuestions.map(q => ({
            fingerprint: q.fingerprint,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            question_type: q.question_type,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
          userId
        );
      }

      // Combine bank + AI-generated
      const bankConverted: AITestAttemptQuestion[] = bankQuestions.map((bq, idx) => ({
        question_id: `q_${idx}_${bq.fingerprint}`,
        fingerprint: bq.fingerprint,
        question_text: bq.question_text,
        options: [...bq.options].sort(() => Math.random() - 0.5),
        correct_answer: bq.correct_answer,
        explanation: bq.explanation,
        topic: bq.topic,
        difficulty: bq.difficulty,
      }));

      const aiConverted: AITestAttemptQuestion[] = aiQuestions.map((q, idx) => ({
        question_id: `q_${bankQuestions.length + idx}_${q.fingerprint || generateQuestionFingerprint(q.question, q.options, q.correctAnswer)}`,
        fingerprint: q.fingerprint || generateQuestionFingerprint(q.question, q.options, q.correctAnswer),
        question_text: q.question,
        options: [...q.options].sort(() => Math.random() - 0.5),
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty,
      }));

      questions = [...bankConverted, ...aiConverted];
    }

    // Final deduplication check within the attempt
    const finalQuestions: AITestAttemptQuestion[] = [];
    const usedFps = new Set<string>();
    for (const q of questions) {
      if (!usedFps.has(q.fingerprint)) {
        usedFps.add(q.fingerprint);
        finalQuestions.push(q);
      }
    }

    // Create immutable attempt
    const attempt = aiStore.createTestAttempt({
      user_id: userId,
      subject: subj,
      topic: tpc,
      difficulty: diff,
      question_type: qType,
      questions: finalQuestions.slice(0, qCount),
      total_questions: finalQuestions.slice(0, qCount).length,
    });

    aiStore.logActivity({
      user_id: userId,
      type: 'ai_quiz_started',
      title: 'Started AI Test',
      description: `${subj} — ${tpc} (${diff}) | ${attempt.total_questions} questions | Attempt #${attempt.attempt_number}`,
      entity_id: attempt.id,
      entity_type: 'ai_test_attempt',
      metadata: { subject: subj, topic: tpc, difficulty: diff, attempt_number: attempt.attempt_number },
    });

    sendSuccess(res, { attempt, resumed: false }, 'AI Test started!', 201);
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to start AI test', 500);
  }
};

/**
 * GET /api/ai/test/resume/:attemptId
 * Returns an in-progress attempt exactly as it was (same questions, same order).
 */
export const resumeAITest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { attemptId } = req.params;
    const attempt = aiStore.getTestAttemptById(String(attemptId));

    if (!attempt) { sendError(res, 'Test attempt not found', 404); return; }
    if (attempt.user_id !== userId) { sendError(res, 'Unauthorized', 403); return; }

    sendSuccess(res, { attempt, resumed: true });
  } catch { sendError(res, 'Failed to resume test', 500); }
};

/**
 * POST /api/ai/test/:attemptId/submit
 * Submits and scores the test. Attempt becomes permanently completed.
 */
export const submitAITest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { attemptId } = req.params;
    const { answers } = req.body; // { [question_id]: selectedAnswer }

    if (!answers || typeof answers !== 'object') {
      sendError(res, 'Answers object is required', 400);
      return;
    }

    const result = aiStore.submitTestAttempt(String(attemptId), userId, answers);
    if (!result) {
      sendError(res, 'Attempt not found or already submitted', 404);
      return;
    }

    aiStore.logActivity({
      user_id: userId,
      type: 'ai_quiz_completed',
      title: 'Completed AI Test',
      description: `${result.subject} — ${result.topic} | Score: ${result.correct_count}/${result.total_questions} (${result.accuracy}%) | Attempt #${result.attempt_number}`,
      entity_id: result.id,
      entity_type: 'ai_test_attempt',
      metadata: {
        subject: result.subject,
        topic: result.topic,
        score: result.correct_count,
        total: result.total_questions,
        accuracy: result.accuracy,
      },
    });

    sendSuccess(res, result, 'Test submitted successfully!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to submit test', 500);
  }
};

/**
 * GET /api/ai/test/history
 * Returns all AI test attempts for the student (newest first).
 */
export const getAITestHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const attempts = aiStore.getStudentTestAttempts(userId);
    sendSuccess(res, attempts);
  } catch { sendError(res, 'Failed to fetch test history', 500); }
};

/**
 * GET /api/ai/test/attempt/:attemptId
 * Returns a single attempt with full Q&A detail (for review).
 */
export const getAITestAttempt = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const attempt = aiStore.getTestAttemptById(String(req.params.attemptId));
    if (!attempt) { sendError(res, 'Attempt not found', 404); return; }
    if (attempt.user_id !== userId) { sendError(res, 'Unauthorized', 403); return; }
    sendSuccess(res, attempt);
  } catch { sendError(res, 'Failed to fetch attempt', 500); }
};

// ──────────────── 7. AI NOTES GENERATOR ────────────────
export const generateNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, content, source_type, source_id } = req.body;
    const noteData = await aiService.generateNotes(title, content);

    const saved = aiStore.saveNote({ user_id: userId, source_type: source_type || 'custom', source_id, ...noteData });

    aiStore.logActivity({
      user_id: userId,
      type: 'ai_notes_generated',
      title: 'Generated AI Notes',
      description: `Notes on: ${title}`,
      entity_id: saved.id,
      entity_type: 'ai_note',
    });

    sendSuccess(res, saved, 'AI Notes generated and saved!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to generate notes', 500);
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    sendSuccess(res, aiStore.getNotes(req.user!.id));
  } catch { sendError(res, 'Failed to fetch notes', 500); }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    aiStore.deleteNote(String(req.params.id));
    sendSuccess(res, null, 'Note deleted');
  } catch { sendError(res, 'Failed to delete note', 500); }
};

// ──────────────── 8. AI DOUBT SOLVER ────────────────
export const solveDoubt = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { doubt_text, subject, topic } = req.body;
    const prompt = `Solve this student doubt step-by-step for Subject: ${subject || 'General'}, Topic: ${topic || 'General'}.\nDoubt: "${doubt_text}"`;
    const explanation = await aiService.generateText(prompt);

    aiStore.logActivity({
      user_id: userId,
      type: 'ai_doubt_solved',
      title: 'AI Doubt Solved',
      description: doubt_text?.slice(0, 100),
      entity_type: 'doubt',
    });

    sendSuccess(res, { explanation, subject, topic });
  } catch { sendError(res, 'Failed to solve doubt', 500); }
};

// ──────────────── 9. AI VIVA / INTERVIEW MODE ────────────────
export const vivaSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { session_id, subject, topic, difficulty, student_answer } = req.body;

    let session = session_id ? aiStore.getVivaSession(session_id) : null;
    if (!session) {
      session = aiStore.saveVivaSession({
        user_id: userId,
        subject: subject || 'Physics',
        topic: topic || 'Laws of Motion',
        difficulty: difficulty || 'medium',
        history: [{
          question: `Welcome to your ${subject || 'Physics'} Viva on ${topic || 'Laws of Motion'}! State Newton's Second Law of Motion and explain its mathematical formula.`,
        }],
      });
      sendSuccess(res, session);
      return;
    }

    const evaluation = await aiService.evaluateViva(
      session.subject, session.topic, session.history, student_answer || ''
    );

    const lastIdx = session.history.length - 1;
    if (lastIdx >= 0) {
      session.history[lastIdx].student_answer = student_answer;
      session.history[lastIdx].feedback = evaluation.feedback;
      session.history[lastIdx].score = evaluation.score;
    }

    if (session.history.length < 5) {
      session.history.push({ question: evaluation.next_question });
    } else {
      session.completed = true;
      const totalScore = session.history.reduce((acc, curr) => acc + (curr.score || 0), 0);
      session.final_score = Math.round(totalScore / session.history.length);

      aiStore.logActivity({
        user_id: userId,
        type: 'ai_viva_completed',
        title: 'Completed AI Viva',
        description: `${session.subject} — ${session.topic} | Score: ${session.final_score}%`,
        entity_id: session.id,
        entity_type: 'viva_session',
        metadata: { final_score: session.final_score },
      });
    }

    aiStore.saveVivaSession(session);
    sendSuccess(res, session);
  } catch { sendError(res, 'Viva session failed', 500); }
};

// ──────────────── 10. ACTIVITY TIMELINE ────────────────
export const getStudentActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Number(req.query.limit) || 50;
    const activity = aiStore.getStudentActivity(userId, limit);
    sendSuccess(res, activity);
  } catch { sendError(res, 'Failed to fetch activity', 500); }
};

// ──────────────── 11. AI RECOMMENDATIONS ────────────────
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Build recommendations based on actual test history
    const attempts = aiStore.getStudentTestAttempts(userId).filter(a => a.status === 'completed');
    const weakTopics = attempts
      .filter(a => (a.accuracy || 0) < 60)
      .map(a => a.topic)
      .slice(0, 3);

    const recommendations: AIRecommendation[] = [
      ...(weakTopics.length > 0 ? [{
        id: 'rec_weak_1',
        user_id: userId,
        type: 'test' as const,
        title: `Practice Test: ${weakTopics[0]}`,
        description: `You scored below 60% on ${weakTopics[0]}. Retry with harder questions.`,
        reason: 'Based on your recent test performance',
        action_url: '/student/ai/quiz',
      }] : []),
      {
        id: 'rec_1',
        user_id: userId,
        type: 'lecture',
        title: 'Rotational Motion & Torque Problem Solving',
        description: 'Targeted revision based on your recent physics score',
        reason: 'Recommended due to difficulty in Torque calculations',
        action_url: '/student/classes',
      },
      {
        id: 'rec_2',
        user_id: userId,
        type: 'dpp',
        title: 'DPP-05: Chemical Bonding & Hybridization',
        description: '15 practice questions to strengthen chemistry concept',
        reason: 'Recommended for daily preparation',
        action_url: '/student/dpp',
      },
    ];

    sendSuccess(res, recommendations);
  } catch { sendError(res, 'Failed to fetch recommendations', 500); }
};

// ──────────────── 12. ADMIN AI TOOLS ────────────────
export const adminGenerateContent = async (req: Request, res: Response) => {
  try {
    const { topic, type } = req.body;
    const prompt = `Generate high-quality ${type || 'description'} for Ambition Academy batch/lecture on topic: "${topic}". Include key learning outcomes, target exams, and syllabus points.`;
    const generated = await aiService.generateText(prompt);
    sendSuccess(res, { generated_content: generated, topic, type });
  } catch { sendError(res, 'Failed to generate admin content', 500); }
};

export const adminGetStudentInsights = async (req: Request, res: Response) => {
  try {
    const stats = aiStore.getTestAttemptStats();
    const bankStats = aiStore.getQuestionBankStats();
    const allActivity = aiStore.getAllActivity(20);

    // Top difficult topics from actual attempt data
    const topicAccuracy: Record<string, { total: number; correct: number }> = {};
    for (const attempt of aiStore.getAllTestAttempts().filter(a => a.status === 'completed')) {
      if (!topicAccuracy[attempt.topic]) topicAccuracy[attempt.topic] = { total: 0, correct: 0 };
      topicAccuracy[attempt.topic].total++;
      topicAccuracy[attempt.topic].correct += attempt.correct_count || 0;
    }

    const difficultTopics = Object.entries(topicAccuracy)
      .map(([topic, data]) => ({
        topic,
        accuracy: data.total > 0 ? Math.round((data.correct / (data.total * 10)) * 100) : 0,
        attempts: data.total,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    sendSuccess(res, {
      ai_test_stats: stats,
      question_bank: bankStats,
      recent_activity: allActivity,
      difficult_topics: difficultTopics,
    });
  } catch { sendError(res, 'Failed to fetch AI insights', 500); }
};

export const adminGetStudentAISummary = async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.studentId);
    const summary = aiStore.getStudentAISummary(studentId);
    const testHistory = aiStore.getStudentTestAttempts(studentId);
    sendSuccess(res, { ...summary, test_history: testHistory });
  } catch { sendError(res, 'Failed to fetch student AI summary', 500); }
};
