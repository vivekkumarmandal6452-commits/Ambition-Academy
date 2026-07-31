// ─── Existing AI Types (preserved) ───────────────────────────────────────────
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
  // New: fingerprint for deduplication
  fingerprint?: string;
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

// ─── NEW: Question Bank (shared pool of validated questions) ───────────────────
export interface AIQuestionRecord {
  id: string;
  fingerprint: string;          // normalized hash for dedup
  subject: string;
  topic: string;
  difficulty: string;
  question_type: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  created_at: string;
  // tracks which students have already seen this question (for per-student dedup)
  used_by_students: string[];
}

// ─── NEW: AI Test Attempt (immutable once created) ─────────────────────────────
export interface AITestAttemptQuestion {
  question_id: string;
  fingerprint: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  selected_answer?: string;       // filled on submit
  is_correct?: boolean;           // filled on submit
  time_spent_seconds?: number;
}

export interface AITestAttempt {
  id: string;                     // unique attempt ID
  user_id: string;
  subject: string;
  topic: string;
  difficulty: string;
  question_type: string;
  attempt_number: number;         // 1, 2, 3 … for retakes
  questions: AITestAttemptQuestion[];   // LOCKED once attempt starts
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
export type AIActivityEventType =
  | 'ai_chat'
  | 'ai_quiz_started'
  | 'ai_quiz_completed'
  | 'ai_notes_generated'
  | 'ai_study_plan_created'
  | 'ai_viva_completed'
  | 'ai_doubt_solved'
  | 'batch_enrolled'
  | 'batch_purchased'
  | 'lecture_watched'
  | 'test_started'
  | 'test_completed'
  | 'dpp_submitted'
  | 'live_class_joined'
  | 'doubt_submitted'
  | 'profile_updated';

export interface AIActivityEvent {
  id: string;
  user_id: string;
  type: AIActivityEventType;
  title: string;
  description: string;
  entity_id?: string;            // batch_id, test_id, etc.
  entity_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
