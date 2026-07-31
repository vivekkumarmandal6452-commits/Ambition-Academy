import api from './api';

// ─── Type Definitions ──────────────────────────────────────────────────────
export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{ type: string; title: string; chunk?: string }>;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIStudyPlanTask {
  id: string;
  day: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface AIStudyPlan {
  id: string;
  user_id: string;
  exam: string;
  target_date: string;
  daily_minutes: number;
  subjects: string[];
  current_level: string;
  target_score?: string;
  tasks: AIStudyPlanTask[];
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  questionType?: string;
  fingerprint?: string;
}

export interface AINote {
  id: string;
  title: string;
  summary: string;
  important_concepts: string[];
  key_points: string[];
  formulas?: string[];
  examples?: string[];
  common_mistakes?: string[];
  created_at: string;
}

export interface AIVivaSession {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  history: Array<{
    question: string;
    student_answer?: string;
    feedback?: string;
    score?: number;
  }>;
  completed: boolean;
  final_score?: number;
}

// ─── NEW: Immutable AI Test Attempt ───────────────────────────────────────────
export interface AITestAttemptQuestion {
  question_id: string;
  fingerprint: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  selected_answer?: string;
  is_correct?: boolean;
}

export interface AITestAttempt {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  difficulty: string;
  question_type: string;
  attempt_number: number;
  questions: AITestAttemptQuestion[];
  score?: number;
  total_questions: number;
  correct_count?: number;
  incorrect_count?: number;
  skipped_count?: number;
  accuracy?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
}

// ─── NEW: Activity Event ───────────────────────────────────────────────────────
export interface AIActivityEvent {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  entity_id?: string;
  entity_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ─── AI Service ───────────────────────────────────────────────────────────────
class AIServiceClient {
  // ── Chat ──────────────────────────────────────────────────────────────────
  async sendMessage(messageOrObj: string | { message: string; conversation_id?: string; [key: string]: any }, conversationId?: string, context?: any) {
    let body: any;
    if (typeof messageOrObj === 'object') {
      body = messageOrObj;
    } else {
      body = { message: messageOrObj, conversation_id: conversationId, ...context };
    }
    const res = await api.post('/api/ai/chat', body);
    return res.data.data;
  }

  async getConversations(): Promise<AIConversation[]> {
    const res = await api.get('/api/ai/conversations');
    return res.data.data || [];
  }

  async getMessages(conversationId: string): Promise<AIMessage[]> {
    const res = await api.get(`/api/ai/conversations/${conversationId}`);
    return res.data.data || [];
  }

  async getConversationMessages(conversationId: string): Promise<AIMessage[]> {
    return this.getMessages(conversationId);
  }

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/api/ai/conversations/${id}`);
  }

  // ── Study Plan ────────────────────────────────────────────────────────────
  async generateStudyPlan(params: {
    exam: string;
    target_date: string;
    daily_minutes: number;
    subjects: string[];
    current_level: string;
    target_score?: string;
  }): Promise<AIStudyPlan> {
    const res = await api.post('/api/ai/study-plan', params);
    return res.data.data;
  }

  async getStudyPlan(): Promise<AIStudyPlan | null> {
    const res = await api.get('/api/ai/study-plan');
    return res.data.data || null;
  }

  async updateTaskStatus(taskId: string, status: string): Promise<AIStudyPlan> {
    const res = await api.post('/api/ai/study-plan/task-status', { taskId, status });
    return res.data.data;
  }

  async updateStudyPlanTask(taskId: string, status: string): Promise<AIStudyPlan> {
    return this.updateTaskStatus(taskId, status);
  }

  // ── Legacy Question Generation (for simple quiz) ──────────────────────────
  async generateQuestions(params: {
    subject: string;
    topic: string;
    difficulty: string;
    count: number;
    questionType: string;
  }): Promise<AIQuestion[]> {
    const res = await api.post('/api/ai/generate-questions', params);
    return res.data.data || [];
  }

  async saveQuizSession(session: any): Promise<void> {
    await api.post('/api/ai/save-quiz', session);
  }

  // ── NEW: Immutable AI Test System ─────────────────────────────────────────

  /**
   * Start a new AI test (or resume if in_progress for same params).
   * Returns the immutable attempt with locked questions.
   */
  async startAITest(params: {
    subject: string;
    topic: string;
    difficulty: string;
    count: number;
    questionType?: string;
    force_new?: boolean;  // set true for retake
  }): Promise<{ attempt: AITestAttempt; resumed: boolean }> {
    const res = await api.post('/api/ai/test/start', params);
    return res.data.data;
  }

  /**
   * Resume a specific attempt by ID (after browser refresh/close).
   */
  async resumeAITest(attemptId: string): Promise<{ attempt: AITestAttempt; resumed: boolean }> {
    const res = await api.get(`/api/ai/test/resume/${attemptId}`);
    return res.data.data;
  }

  /**
   * Submit answers for a test attempt (permanent, never overwritten).
   */
  async submitAITest(attemptId: string, answers: Record<string, string>): Promise<AITestAttempt> {
    const res = await api.post(`/api/ai/test/${attemptId}/submit`, { answers });
    return res.data.data;
  }

  /**
   * Get all AI test attempts for the current student.
   */
  async getAITestHistory(): Promise<AITestAttempt[]> {
    const res = await api.get('/api/ai/test/history');
    return res.data.data || [];
  }

  /**
   * Get a specific attempt with full Q&A detail for review.
   */
  async getAITestAttempt(attemptId: string): Promise<AITestAttempt> {
    const res = await api.get(`/api/ai/test/attempt/${attemptId}`);
    return res.data.data;
  }

  // ── AI Notes ──────────────────────────────────────────────────────────────
  async generateNotes(params: { title: string; content?: string }): Promise<AINote> {
    const res = await api.post('/api/ai/generate-notes', params);
    return res.data.data;
  }

  async getNotes(): Promise<AINote[]> {
    const res = await api.get('/api/ai/notes');
    return res.data.data || [];
  }

  async deleteNote(id: string): Promise<void> {
    await api.delete(`/api/ai/notes/${id}`);
  }

  // ── Doubt Solver ──────────────────────────────────────────────────────────
  async solveDoubt(params: { doubt_text: string; subject?: string; topic?: string }): Promise<{ explanation: string }> {
    const res = await api.post('/api/ai/doubt', params);
    return res.data.data;
  }

  // ── Viva Mode ─────────────────────────────────────────────────────────────
  async submitVivaAnswer(params: {
    session_id?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    student_answer?: string;
  }): Promise<AIVivaSession> {
    const res = await api.post('/api/ai/viva', params);
    return res.data.data;
  }

  // ── Activity Timeline ─────────────────────────────────────────────────────
  async getActivity(limit?: number): Promise<AIActivityEvent[]> {
    const res = await api.get('/api/ai/activity', { params: { limit } });
    return res.data.data || [];
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  async getRecommendations(): Promise<any[]> {
    const res = await api.get('/api/ai/recommendations');
    return res.data.data || [];
  }

  // ── Performance Analysis ──────────────────────────────────────────────────
  async analyzePerformance(data?: any): Promise<any> {
    const res = await api.post('/api/ai/analyze-performance', data || {});
    return res.data.data;
  }
}

export const aiService = new AIServiceClient();
