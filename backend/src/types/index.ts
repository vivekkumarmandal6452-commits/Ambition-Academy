export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  name?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ──────────────── Database entity types ────────────────

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  role: 'student' | 'instructor' | 'admin';
  education?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface Batch {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  target_exam?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  original_price?: number;
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  total_lectures?: number;
  total_duration_hours?: number;
  max_students?: number;
  enrolled_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  batch_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index: number;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface Lecture {
  id: string;
  chapter_id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  order_index: number;
  is_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  batch_id: string;
  status: 'free' | 'paid' | 'pending' | 'active' | 'expired' | 'cancelled';
  payment_status?: 'pending' | 'success' | 'failed' | 'refunded';
  payment_id?: string;
  amount_paid?: number;
  enrolled_at: string;
  expires_at?: string;
}

export interface LectureProgress {
  id: string;
  student_id: string;
  lecture_id: string;
  watched_seconds: number;
  duration_seconds: number;
  is_completed: boolean;
  last_watched_at: string;
  completed_at?: string;
}

export interface LiveClass {
  id: string;
  batch_id: string;
  subject_id?: string;
  instructor_id: string;
  title: string;
  description?: string;
  provider: 'zoom' | 'google_meet' | 'youtube_live' | 'custom';
  meeting_url: string;
  recording_url?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface StudyMaterial {
  id: string;
  batch_id?: string;
  subject_id?: string;
  chapter_id?: string;
  lecture_id?: string;
  title: string;
  description?: string;
  type: 'pdf' | 'notes' | 'formula_sheet' | 'assignment' | 'reference';
  file_url: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
}

export interface DPP {
  id: string;
  batch_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  description?: string;
  total_questions: number;
  time_limit_minutes?: number;
  due_date?: string;
  is_published: boolean;
  created_at: string;
}

export interface DPPQuestion {
  id: string;
  dpp_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  marks: number;
  order_index: number;
}

export interface Test {
  id: string;
  batch_id?: string;
  title: string;
  description?: string;
  type: 'chapter' | 'subject' | 'full_test' | 'mock';
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  negative_marking: number;
  pass_percentage?: number;
  start_time?: string;
  end_time?: string;
  is_published: boolean;
  created_at: string;
}

export interface Doubt {
  id: string;
  student_id: string;
  batch_id?: string;
  subject_id?: string;
  chapter_id?: string;
  lecture_id?: string;
  title: string;
  description: string;
  image_url?: string;
  status: 'pending' | 'answered' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'class' | 'lecture' | 'dpp' | 'test' | 'result' | 'announcement' | 'general';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  batch_id?: string;
  title: string;
  content: string;
  type: 'general' | 'batch' | 'class' | 'test';
  published_by: string;
  is_active: boolean;
  created_at: string;
}
