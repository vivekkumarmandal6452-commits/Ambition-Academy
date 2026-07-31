import api from './api';

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

export const aiService = {
  // Chat
  sendMessage: async (payload: { message: string; conversation_id?: string; lecture_context?: any; material_context?: any }) => {
    const { data } = await api.post('/api/ai/chat', payload);
    return data.data as { conversation_id: string; message: AIMessage };
  },

  getConversations: async () => {
    const { data } = await api.get('/api/ai/conversations');
    return data.data as AIConversation[];
  },

  getConversationMessages: async (id: string) => {
    const { data } = await api.get(`/api/ai/conversations/${id}`);
    return data.data as AIMessage[];
  },

  renameConversation: async (id: string, title: string) => {
    const { data } = await api.put(`/api/ai/conversations/${id}`, { title });
    return data.data as AIConversation;
  },

  deleteConversation: async (id: string) => {
    const { data } = await api.delete(`/api/ai/conversations/${id}`);
    return data;
  },

  // Study Plan
  generateStudyPlan: async (payload: { exam: string; target_date: string; daily_minutes: number; subjects: string[]; current_level: string; target_score?: string }) => {
    const { data } = await api.post('/api/ai/study-plan', payload);
    return data.data as AIStudyPlan;
  },

  getStudyPlan: async () => {
    const { data } = await api.get('/api/ai/study-plan');
    return data.data as AIStudyPlan | null;
  },

  updateStudyPlanTask: async (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped') => {
    const { data } = await api.post('/api/ai/study-plan/task-status', { taskId, status });
    return data.data as AIStudyPlan;
  },

  // Performance & Weakness
  analyzePerformance: async (payload?: any) => {
    const { data } = await api.post('/api/ai/analyze-performance', payload || {});
    return data.data;
  },

  getRecommendations: async () => {
    const { data } = await api.get('/api/ai/recommendations');
    return data.data;
  },

  // Questions & Quiz
  generateQuestions: async (payload: { subject: string; topic: string; difficulty: string; count: number; questionType?: string }) => {
    const { data } = await api.post('/api/ai/generate-questions', payload);
    return data.data as AIQuestion[];
  },

  saveQuizSession: async (payload: any) => {
    const { data } = await api.post('/api/ai/save-quiz', payload);
    return data.data;
  },

  // Notes
  generateNotes: async (payload: { title: string; content?: string; source_type?: string; source_id?: string }) => {
    const { data } = await api.post('/api/ai/generate-notes', payload);
    return data.data as AINote;
  },

  getNotes: async () => {
    const { data } = await api.get('/api/ai/notes');
    return data.data as AINote[];
  },

  deleteNote: async (id: string) => {
    const { data } = await api.delete(`/api/ai/notes/${id}`);
    return data;
  },

  // Doubt Solver
  solveDoubt: async (payload: { doubt_text: string; subject?: string; topic?: string }) => {
    const { data } = await api.post('/api/ai/doubt', payload);
    return data.data as { explanation: string; subject: string; topic: string };
  },

  // Viva Mode
  submitVivaAnswer: async (payload: { session_id?: string; subject?: string; topic?: string; difficulty?: string; student_answer?: string }) => {
    const { data } = await api.post('/api/ai/viva', payload);
    return data.data as AIVivaSession;
  },

  // Admin AI
  adminGenerateContent: async (payload: { topic: string; type: string }) => {
    const { data } = await api.post('/api/ai/admin/generate-content', payload);
    return data.data as { generated_content: string; topic: string; type: string };
  },

  adminGetInsights: async () => {
    const { data } = await api.get('/api/ai/admin/insights');
    return data.data;
  },
};
