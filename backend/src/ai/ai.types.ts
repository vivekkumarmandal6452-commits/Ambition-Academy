export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: AISource[];
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AISource {
  type: 'lecture' | 'material' | 'course' | 'faq';
  title: string;
  subject?: string;
  path?: string;
  chunk?: string;
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
  current_level: 'beginner' | 'intermediate' | 'advanced';
  target_score?: string;
  tasks: AIStudyPlanTask[];
  status: 'active' | 'completed' | 'archived';
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
  questionType?: 'MCQ' | 'Multiple correct' | 'True/False' | 'Short answer' | 'Numerical';
}

export interface AIQuizSession {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  difficulty: string;
  questions: AIQuestion[];
  userAnswers?: Record<string, string>;
  score?: number;
  completed: boolean;
  created_at: string;
}

export interface AINote {
  id: string;
  user_id: string;
  title: string;
  source_type: 'lecture' | 'material' | 'custom';
  source_id?: string;
  summary: string;
  important_concepts: string[];
  key_points: string[];
  formulas?: string[];
  examples?: string[];
  common_mistakes?: string[];
  created_at: string;
}

export interface AIWeaknessAnalysis {
  user_id: string;
  strong_topics: string[];
  weak_topics: string[];
  revision_needed: string[];
  recommendations: string[];
  overall_accuracy: number;
  last_analyzed: string;
}

export interface AIVivaSession {
  id: string;
  user_id: string;
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
  created_at: string;
}

export interface AIRevisionPlan {
  id: string;
  user_id: string;
  today_tasks: Array<{
    topic: string;
    action: string;
    reason: string;
  }>;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  type: 'lecture' | 'topic' | 'dpp' | 'test' | 'material';
  title: string;
  description: string;
  reason: string;
  action_url: string;
}

export interface AIUsageRecord {
  user_id: string;
  date: string;
  count: number;
}
