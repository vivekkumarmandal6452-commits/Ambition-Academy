import fs from 'fs';
import path from 'path';
import {
  AIConversation, AIMessage, AIStudyPlan, AIQuizSession,
  AINote, AIWeaknessAnalysis, AIVivaSession, AIRevisionPlan, AIRecommendation,
  AIQuestionRecord, AITestAttempt, AIActivityEvent, AIActivityEventType
} from './ai.types';

const DATA_DIR = path.join(__dirname, '../../data');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
};

const loadFile = <T>(filename: string, fallback: T): T => {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {}
  return fallback;
};

const saveFile = (filename: string, data: any) => {
  try {
    ensureDataDir();
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`[AIStore] Failed to save ${filename}:`, e);
  }
};

// ─── Question Fingerprinting Utilities ──────────────────────────────────────
/**
 * Generates a normalized fingerprint for a question to detect duplicates.
 * Normalizes: lowercase, trim, remove punctuation, sort options.
 */
export function generateQuestionFingerprint(questionText: string, options: string[], correctAnswer: string): string {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');

  const normQ = normalize(questionText);
  const normOpts = [...options].map(normalize).sort().join('|');
  const normAns = normalize(correctAnswer);

  const combined = `${normQ}__${normOpts}__${normAns}`;

  // Simple hash (djb2 variant — no crypto needed)
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) ^ combined.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Calculates word-overlap similarity between two strings (0–1).
 * Used to detect near-duplicate/paraphrased questions.
 */
export function questionSimilarity(a: string, b: string): number {
  const words = (s: string) => new Set(s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3));
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  const intersection = [...wa].filter(w => wb.has(w)).length;
  return intersection / Math.max(wa.size, wb.size);
}

class AIStore {
  // ── Existing collections ──────────────────────────────────────────────────
  private conversations: AIConversation[] = loadFile('ai_conversations.json', []);
  private messages: AIMessage[] = loadFile('ai_messages.json', []);
  private studyPlans: AIStudyPlan[] = loadFile('ai_study_plans.json', []);
  private quizSessions: AIQuizSession[] = loadFile('ai_quiz_sessions.json', []);
  private notes: AINote[] = loadFile('ai_notes.json', []);
  private vivaSessions: AIVivaSession[] = loadFile('ai_viva_sessions.json', []);
  private usage: Record<string, { count: number; date: string }> = loadFile('ai_usage.json', {});

  // ── NEW collections ───────────────────────────────────────────────────────
  private questionBank: AIQuestionRecord[] = loadFile('ai_question_bank.json', []);
  private testAttempts: AITestAttempt[] = loadFile('ai_test_attempts.json', []);
  private activityLog: AIActivityEvent[] = loadFile('ai_activity_log.json', []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSATIONS & MESSAGES (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════
  getConversations(userId: string): AIConversation[] {
    return this.conversations
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getConversationById(id: string): AIConversation | undefined {
    return this.conversations.find(c => c.id === id);
  }

  createConversation(userId: string, title: string): AIConversation {
    const newConv: AIConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      title: title || 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.conversations.unshift(newConv);
    saveFile('ai_conversations.json', this.conversations);
    return newConv;
  }

  renameConversation(id: string, title: string): AIConversation | null {
    const conv = this.conversations.find(c => c.id === id);
    if (!conv) return null;
    conv.title = title;
    conv.updated_at = new Date().toISOString();
    saveFile('ai_conversations.json', this.conversations);
    return conv;
  }

  deleteConversation(id: string): boolean {
    const lenBefore = this.conversations.length;
    this.conversations = this.conversations.filter(c => c.id !== id);
    this.messages = this.messages.filter(m => m.conversation_id !== id);
    saveFile('ai_conversations.json', this.conversations);
    saveFile('ai_messages.json', this.messages);
    return this.conversations.length < lenBefore;
  }

  getMessages(conversationId: string): AIMessage[] {
    return this.messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addMessage(msg: Partial<AIMessage>): AIMessage {
    const newMsg: AIMessage = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversation_id: msg.conversation_id || '',
      role: msg.role || 'user',
      content: msg.content || '',
      sources: msg.sources || [],
      created_at: msg.created_at || new Date().toISOString(),
    };
    this.messages.push(newMsg);
    saveFile('ai_messages.json', this.messages);

    const conv = this.conversations.find(c => c.id === newMsg.conversation_id);
    if (conv) {
      conv.updated_at = new Date().toISOString();
      saveFile('ai_conversations.json', this.conversations);
    }
    return newMsg;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STUDY PLANS (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════
  getStudyPlan(userId: string): AIStudyPlan | undefined {
    return this.studyPlans.find(p => p.user_id === userId && p.status === 'active');
  }

  saveStudyPlan(plan: Partial<AIStudyPlan>): AIStudyPlan {
    const existingIdx = this.studyPlans.findIndex(p => p.user_id === plan.user_id && p.status === 'active');
    const newPlan: AIStudyPlan = {
      id: plan.id || `plan_${Date.now()}`,
      user_id: plan.user_id!,
      exam: plan.exam || 'JEE Main',
      target_date: plan.target_date || new Date(Date.now() + 90 * 86400000).toISOString(),
      daily_minutes: plan.daily_minutes || 120,
      subjects: plan.subjects || ['Physics', 'Chemistry', 'Mathematics'],
      current_level: plan.current_level || 'intermediate',
      target_score: plan.target_score || '250+',
      tasks: plan.tasks || [],
      status: 'active',
      created_at: plan.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      this.studyPlans[existingIdx] = newPlan;
    } else {
      this.studyPlans.unshift(newPlan);
    }
    saveFile('ai_study_plans.json', this.studyPlans);
    return newPlan;
  }

  updateStudyTaskStatus(userId: string, taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped'): AIStudyPlan | null {
    const plan = this.getStudyPlan(userId);
    if (!plan) return null;
    const task = plan.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      plan.updated_at = new Date().toISOString();
      saveFile('ai_study_plans.json', this.studyPlans);
    }
    return plan;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ SESSIONS (unchanged — for backward compat)
  // ═══════════════════════════════════════════════════════════════════════════
  saveQuizSession(session: Partial<AIQuizSession>): AIQuizSession {
    const newSession: AIQuizSession = {
      id: session.id || `quiz_${Date.now()}`,
      user_id: session.user_id!,
      subject: session.subject || 'Physics',
      topic: session.topic || 'General',
      difficulty: session.difficulty || 'medium',
      questions: session.questions || [],
      userAnswers: session.userAnswers || {},
      score: session.score || 0,
      completed: session.completed || false,
      created_at: session.created_at || new Date().toISOString(),
    };
    this.quizSessions.unshift(newSession);
    saveFile('ai_quiz_sessions.json', this.quizSessions);
    return newSession;
  }

  getQuizSessions(userId: string): AIQuizSession[] {
    return this.quizSessions.filter(q => q.user_id === userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI NOTES (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════
  saveNote(note: Partial<AINote>): AINote {
    const newNote: AINote = {
      id: note.id || `ainote_${Date.now()}`,
      user_id: note.user_id!,
      title: note.title || 'AI Generated Note',
      source_type: note.source_type || 'custom',
      source_id: note.source_id,
      summary: note.summary || '',
      important_concepts: note.important_concepts || [],
      key_points: note.key_points || [],
      formulas: note.formulas || [],
      examples: note.examples || [],
      common_mistakes: note.common_mistakes || [],
      created_at: note.created_at || new Date().toISOString(),
    };
    this.notes.unshift(newNote);
    saveFile('ai_notes.json', this.notes);
    return newNote;
  }

  getNotes(userId: string): AINote[] {
    return this.notes.filter(n => n.user_id === userId);
  }

  deleteNote(id: string): boolean {
    const lenBefore = this.notes.length;
    this.notes = this.notes.filter(n => n.id !== id);
    saveFile('ai_notes.json', this.notes);
    return this.notes.length < lenBefore;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIVA SESSIONS (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════
  saveVivaSession(session: Partial<AIVivaSession>): AIVivaSession {
    const newSession: AIVivaSession = {
      id: session.id || `viva_${Date.now()}`,
      user_id: session.user_id!,
      subject: session.subject || 'Physics',
      topic: session.topic || 'General',
      difficulty: session.difficulty || 'medium',
      history: session.history || [],
      completed: session.completed || false,
      final_score: session.final_score || 0,
      created_at: session.created_at || new Date().toISOString(),
    };
    const idx = this.vivaSessions.findIndex(v => v.id === newSession.id);
    if (idx !== -1) {
      this.vivaSessions[idx] = newSession;
    } else {
      this.vivaSessions.unshift(newSession);
    }
    saveFile('ai_viva_sessions.json', this.vivaSessions);
    return newSession;
  }

  getVivaSession(id: string): AIVivaSession | undefined {
    return this.vivaSessions.find(v => v.id === id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USAGE RATE LIMITS (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════
  checkAndIncrementUsage(userId: string, limitPerDay: number = 50): { allowed: boolean; current: number } {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    const current = this.usage[key]?.count || 0;
    if (current >= limitPerDay) {
      return { allowed: false, current };
    }
    this.usage[key] = { count: current + 1, date: today };
    saveFile('ai_usage.json', this.usage);
    return { allowed: true, current: current + 1 };
  }

  getUsageSummary(userId: string): { today: number; total: number } {
    const today = new Date().toISOString().split('T')[0];
    const todayKey = `${userId}_${today}`;
    const todayCount = this.usage[todayKey]?.count || 0;
    const total = Object.entries(this.usage)
      .filter(([k]) => k.startsWith(`${userId}_`))
      .reduce((sum, [, v]) => sum + v.count, 0);
    return { today: todayCount, total };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: QUESTION BANK
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get questions from bank that this student has NOT seen, filtered by topic */
  getUnusedQuestionsForStudent(
    userId: string,
    subject: string,
    topic: string,
    difficulty: string,
    count: number
  ): AIQuestionRecord[] {
    const eligible = this.questionBank.filter(q =>
      q.subject.toLowerCase() === subject.toLowerCase() &&
      q.topic.toLowerCase() === topic.toLowerCase() &&
      q.difficulty === difficulty &&
      !q.used_by_students.includes(userId)
    );

    // Shuffle for randomization
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /** Get all fingerprints for questions a student has seen for a topic */
  getStudentSeenFingerprints(userId: string, subject: string, topic: string): string[] {
    return this.questionBank
      .filter(q =>
        q.subject.toLowerCase() === subject.toLowerCase() &&
        q.topic.toLowerCase() === topic.toLowerCase() &&
        q.used_by_students.includes(userId)
      )
      .map(q => q.fingerprint);
  }

  /** Get ALL fingerprints a student has ever seen (any topic) */
  getAllStudentSeenFingerprints(userId: string): string[] {
    return this.questionBank
      .filter(q => q.used_by_students.includes(userId))
      .map(q => q.fingerprint);
  }

  /** Add validated questions to bank; mark as used by student */
  addQuestionsToBank(
    questions: Array<{
      fingerprint: string;
      subject: string;
      topic: string;
      difficulty: string;
      question_type: string;
      question_text: string;
      options: string[];
      correct_answer: string;
      explanation: string;
    }>,
    markedUsedByUserId: string
  ): void {
    for (const q of questions) {
      const existing = this.questionBank.find(b => b.fingerprint === q.fingerprint);
      if (existing) {
        // Already in bank — just mark as used by this student
        if (!existing.used_by_students.includes(markedUsedByUserId)) {
          existing.used_by_students.push(markedUsedByUserId);
        }
      } else {
        this.questionBank.push({
          id: `qbank_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          fingerprint: q.fingerprint,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          question_type: q.question_type,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          created_at: new Date().toISOString(),
          used_by_students: [markedUsedByUserId],
        });
      }
    }
    saveFile('ai_question_bank.json', this.questionBank);
  }

  getQuestionBankStats(): { total: number; by_subject: Record<string, number> } {
    const by_subject: Record<string, number> = {};
    for (const q of this.questionBank) {
      by_subject[q.subject] = (by_subject[q.subject] || 0) + 1;
    }
    return { total: this.questionBank.length, by_subject };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: IMMUTABLE TEST ATTEMPTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Create a new AI test attempt — immutable once created */
  createTestAttempt(attempt: Omit<AITestAttempt, 'id' | 'started_at' | 'status' | 'attempt_number'>): AITestAttempt {
    // Calculate attempt number (how many times has this student attempted this subject+topic)
    const previousAttempts = this.testAttempts.filter(
      a => a.user_id === attempt.user_id &&
        a.subject === attempt.subject &&
        a.topic === attempt.topic
    );

    const newAttempt: AITestAttempt = {
      id: `aitst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...attempt,
      attempt_number: previousAttempts.length + 1,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    };
    this.testAttempts.unshift(newAttempt);
    saveFile('ai_test_attempts.json', this.testAttempts);
    return newAttempt;
  }

  /** Get a specific attempt by ID (for resume) */
  getTestAttemptById(attemptId: string): AITestAttempt | undefined {
    return this.testAttempts.find(a => a.id === attemptId);
  }

  /** Get in-progress attempt for student on subject+topic (for auto-resume) */
  getInProgressAttempt(userId: string, subject: string, topic: string, difficulty: string): AITestAttempt | undefined {
    return this.testAttempts.find(
      a => a.user_id === userId &&
        a.subject === subject &&
        a.topic === topic &&
        a.difficulty === difficulty &&
        a.status === 'in_progress'
    );
  }

  /** Submit (complete) a test attempt — immutable, never overwrite completed */
  submitTestAttempt(
    attemptId: string,
    userId: string,
    answers: Record<string, string>  // questionId → selectedAnswer
  ): AITestAttempt | null {
    const attempt = this.testAttempts.find(a => a.id === attemptId && a.user_id === userId);
    if (!attempt || attempt.status === 'completed') return null;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    attempt.questions = attempt.questions.map(q => {
      const selected = answers[q.question_id];
      const isCorrect = selected ? selected === q.correct_answer : false;

      if (!selected) skipped++;
      else if (isCorrect) correct++;
      else incorrect++;

      return {
        ...q,
        selected_answer: selected || undefined,
        is_correct: selected ? isCorrect : undefined,
      };
    });

    attempt.score = correct;
    attempt.correct_count = correct;
    attempt.incorrect_count = incorrect;
    attempt.skipped_count = skipped;
    attempt.accuracy = attempt.total_questions > 0
      ? Math.round((correct / attempt.total_questions) * 100)
      : 0;
    attempt.status = 'completed';
    attempt.completed_at = new Date().toISOString();

    saveFile('ai_test_attempts.json', this.testAttempts);
    return attempt;
  }

  /** Get all test attempts for a student (sorted newest first) */
  getStudentTestAttempts(userId: string): AITestAttempt[] {
    return this.testAttempts
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  /** Get all AI test attempts (for admin analytics) */
  getAllTestAttempts(): AITestAttempt[] {
    return this.testAttempts;
  }

  /** Admin: get test attempt stats */
  getTestAttemptStats(): {
    total: number;
    completed: number;
    average_accuracy: number;
    by_subject: Record<string, number>;
    by_topic: Record<string, number>;
  } {
    const completed = this.testAttempts.filter(a => a.status === 'completed');
    const avgAcc = completed.length > 0
      ? Math.round(completed.reduce((s, a) => s + (a.accuracy || 0), 0) / completed.length)
      : 0;
    const by_subject: Record<string, number> = {};
    const by_topic: Record<string, number> = {};
    for (const a of this.testAttempts) {
      by_subject[a.subject] = (by_subject[a.subject] || 0) + 1;
      by_topic[a.topic] = (by_topic[a.topic] || 0) + 1;
    }
    return {
      total: this.testAttempts.length,
      completed: completed.length,
      average_accuracy: avgAcc,
      by_subject,
      by_topic,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: ACTIVITY LOG (append-only, never reset)
  // ═══════════════════════════════════════════════════════════════════════════

  logActivity(event: Omit<AIActivityEvent, 'id' | 'created_at'>): AIActivityEvent {
    const newEvent: AIActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...event,
      created_at: new Date().toISOString(),
    };
    this.activityLog.unshift(newEvent);
    // Keep last 1000 events per student to avoid unbounded growth
    const userEvents = this.activityLog.filter(e => e.user_id === event.user_id);
    if (userEvents.length > 500) {
      // Keep only the 500 most recent for this user
      const otherEvents = this.activityLog.filter(e => e.user_id !== event.user_id);
      this.activityLog = [...userEvents.slice(0, 500), ...otherEvents];
    }
    saveFile('ai_activity_log.json', this.activityLog);
    return newEvent;
  }

  getStudentActivity(userId: string, limit: number = 50): AIActivityEvent[] {
    return this.activityLog
      .filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  getAllActivity(limit: number = 100): AIActivityEvent[] {
    return this.activityLog
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /** Get comprehensive student summary for admin */
  getStudentAISummary(userId: string): {
    conversation_count: number;
    notes_count: number;
    quiz_sessions_count: number;
    ai_test_attempts: number;
    ai_test_completed: number;
    avg_accuracy: number;
    usage: { today: number; total: number };
    recent_activity: AIActivityEvent[];
  } {
    const conversations = this.conversations.filter(c => c.user_id === userId).length;
    const notes = this.notes.filter(n => n.user_id === userId).length;
    const quizSessions = this.quizSessions.filter(q => q.user_id === userId).length;
    const attempts = this.testAttempts.filter(a => a.user_id === userId);
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const avgAcc = completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / completedAttempts.length)
      : 0;

    return {
      conversation_count: conversations,
      notes_count: notes,
      quiz_sessions_count: quizSessions,
      ai_test_attempts: attempts.length,
      ai_test_completed: completedAttempts.length,
      avg_accuracy: avgAcc,
      usage: this.getUsageSummary(userId),
      recent_activity: this.getStudentActivity(userId, 10),
    };
  }
}

export const aiStore = new AIStore();
