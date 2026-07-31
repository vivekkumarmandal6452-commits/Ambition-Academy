import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { aiStore } from './ai.store';
import { buildStudentContext, retrieveRAGContext } from './ai.context';
import { sendSuccess, sendError } from '../utils/response';
import { AIRecommendation } from './ai.types';

// ──────────────── 1. ASK AMBITION AI CHAT ────────────────
export const chat = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversation_id, message, lecture_context, material_context } = req.body;

    if (!message) {
      sendError(res, 'Message is required', 400);
      return;
    }

    // Rate Limit Check
    const rateCheck = aiStore.checkAndIncrementUsage(userId, 100);
    if (!rateCheck.allowed) {
      sendError(res, 'Daily AI request limit reached. Please try again tomorrow!', 429);
      return;
    }

    // Get or Create Conversation
    let convId = conversation_id;
    let conv = convId ? aiStore.getConversationById(convId) : null;
    if (!conv) {
      const title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      conv = aiStore.createConversation(userId, title);
      convId = conv.id;
    }

    // Save User Message
    aiStore.addMessage({
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // Build Context & RAG
    const studentCtx = await buildStudentContext(userId);
    const ragChunks = await retrieveRAGContext(message, 3);

    let systemPrompt = `Student Name: ${studentCtx.studentName}. Enrolled Batches: ${studentCtx.enrolledBatches.join(', ')}.`;
    if (lecture_context) {
      systemPrompt += ` Current Lecture Context: ${JSON.stringify(lecture_context)}.`;
    }
    if (material_context) {
      systemPrompt += ` Current Study Material Context: ${JSON.stringify(material_context)}.`;
    }

    let promptWithContext = message;
    if (ragChunks.length > 0) {
      promptWithContext += `\n\n[RELEVANT AMBITION ACADEMY KNOWLEDGE BASE]\n` +
        ragChunks.map(c => `- ${c.source}: ${c.content}`).join('\n');
    }

    // Generate AI Response
    const aiResponseText = await aiService.generateText(promptWithContext, systemPrompt);

    // Sources format
    const sources = ragChunks.map(c => ({
      type: c.type,
      title: c.title,
      chunk: c.source,
    }));

    // Save Assistant Message
    const assistantMsg = aiStore.addMessage({
      conversation_id: convId,
      role: 'assistant',
      content: aiResponseText,
      sources,
    });

    sendSuccess(res, {
      conversation_id: convId,
      message: assistantMsg,
    });
  } catch (err: any) {
    sendError(res, err?.message || 'AI Chat failed', 500);
  }
};

// ──────────────── 2. CHAT HISTORY MANAGEMENT ────────────────
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversations = aiStore.getConversations(userId);
    sendSuccess(res, conversations);
  } catch {
    sendError(res, 'Failed to fetch conversations', 500);
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = aiStore.getMessages(String(id));
    sendSuccess(res, messages);
  } catch {
    sendError(res, 'Failed to fetch messages', 500);
  }
};

export const renameConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updated = aiStore.renameConversation(String(id), title);
    if (!updated) { sendError(res, 'Conversation not found', 404); return; }
    sendSuccess(res, updated);
  } catch {
    sendError(res, 'Failed to rename conversation', 500);
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    aiStore.deleteConversation(String(id));
    sendSuccess(res, null, 'Conversation deleted');
  } catch {
    sendError(res, 'Failed to delete conversation', 500);
  }
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
      user_id: userId,
      exam,
      target_date,
      daily_minutes: Number(daily_minutes) || 120,
      subjects,
      current_level,
      target_score,
      tasks,
    });

    sendSuccess(res, savedPlan, 'AI Study plan generated and saved!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to generate study plan', 500);
  }
};

export const getStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const plan = aiStore.getStudyPlan(userId);
    sendSuccess(res, plan || null);
  } catch {
    sendError(res, 'Failed to fetch study plan', 500);
  }
};

export const updateStudyPlanTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { taskId, status } = req.body;
    const updatedPlan = aiStore.updateStudyTaskStatus(userId, taskId, status);
    sendSuccess(res, updatedPlan);
  } catch {
    sendError(res, 'Failed to update task status', 500);
  }
};

// ──────────────── 4. AI WEAKNESS ANALYZER ────────────────
export const analyzePerformance = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const analysis = await aiService.analyzeWeakness({ userId, ...req.body });
    sendSuccess(res, analysis);
  } catch {
    sendError(res, 'Failed to analyze performance', 500);
  }
};

// ──────────────── 5. AI QUESTION & QUIZ GENERATOR ────────────────
export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty, count, questionType } = req.body;
    const questions = await aiService.generateQuestions(
      subject || 'Physics',
      topic || 'Kinematics',
      difficulty || 'medium',
      Number(count) || 5,
      questionType || 'MCQ'
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
  } catch {
    sendError(res, 'Failed to save quiz session', 500);
  }
};

// ──────────────── 6. AI NOTES GENERATOR ────────────────
export const generateNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, content, source_type, source_id } = req.body;
    const noteData = await aiService.generateNotes(title, content);

    const saved = aiStore.saveNote({
      user_id: userId,
      source_type: source_type || 'custom',
      source_id,
      ...noteData,
    });

    sendSuccess(res, saved, 'AI Notes generated and saved!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to generate notes', 500);
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const notes = aiStore.getNotes(userId);
    sendSuccess(res, notes);
  } catch {
    sendError(res, 'Failed to fetch notes', 500);
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    aiStore.deleteNote(String(id));
    sendSuccess(res, null, 'Note deleted');
  } catch {
    sendError(res, 'Failed to delete note', 500);
  }
};

// ──────────────── 7. AI DOUBT SOLVER ────────────────
export const solveDoubt = async (req: Request, res: Response) => {
  try {
    const { doubt_text, subject, topic } = req.body;
    const prompt = `Solve this student doubt step-by-step for Subject: ${subject || 'General'}, Topic: ${topic || 'General'}.\nDoubt: "${doubt_text}"`;
    const explanation = await aiService.generateText(prompt);
    sendSuccess(res, {
      explanation,
      subject,
      topic,
    });
  } catch {
    sendError(res, 'Failed to solve doubt', 500);
  }
};

// ──────────────── 8. AI VIVA / INTERVIEW MODE ────────────────
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

    // Evaluate answer and generate next question
    const evaluation = await aiService.evaluateViva(
      session.subject,
      session.topic,
      session.history,
      student_answer || ''
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
    }

    aiStore.saveVivaSession(session);
    sendSuccess(res, session);
  } catch {
    sendError(res, 'Viva session failed', 500);
  }
};

// ──────────────── 9. AI RECOMMENDATIONS & LEARNING PATH ────────────────
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const recommendations: AIRecommendation[] = [
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
      {
        id: 'rec_3',
        user_id: userId,
        type: 'material',
        title: 'Complete Formula Handbook — JEE Physics',
        description: 'Quick formula revision before next mock test',
        reason: 'Recommended for quick revision',
        action_url: '/student/study-material',
      },
    ];

    sendSuccess(res, recommendations);
  } catch {
    sendError(res, 'Failed to fetch recommendations', 500);
  }
};

// ──────────────── 10. ADMIN AI TOOLS & ANALYTICS ────────────────
export const adminGenerateContent = async (req: Request, res: Response) => {
  try {
    const { topic, type } = req.body;
    const prompt = `Generate high-quality ${type || 'description'} for Ambition Academy batch/lecture on topic: "${topic}". Include key learning outcomes, target exams, and syllabus points.`;
    const generated = await aiService.generateText(prompt);
    sendSuccess(res, { generated_content: generated, topic, type });
  } catch {
    sendError(res, 'Failed to generate admin content', 500);
  }
};

export const adminGetStudentInsights = async (req: Request, res: Response) => {
  try {
    sendSuccess(res, {
      top_difficult_topics: [
        { topic: 'Rotational Dynamics', count: 142, subject: 'Physics' },
        { topic: 'Organic Reaction Mechanisms', count: 118, subject: 'Chemistry' },
        { topic: 'Definite Integration', count: 95, subject: 'Mathematics' },
      ],
      completion_rate: 84,
      total_ai_queries_today: 340,
    });
  } catch {
    sendError(res, 'Failed to fetch AI insights', 500);
  }
};
