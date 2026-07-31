-- ============================================================
-- LUMINARY ED-TECH PLATFORM — SUPABASE POSTGRESQL SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  education   TEXT,
  bio         TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  color       TEXT DEFAULT '#7C3AED',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- PLATFORM STATS (configurable from admin)
-- ──────────────────────────────────────
CREATE TABLE platform_stats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  label       TEXT NOT NULL,
  icon        TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- BATCHES
-- ──────────────────────────────────────
CREATE TABLE batches (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
  title                TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT,
  thumbnail_url        TEXT,
  target_exam          TEXT,
  level                TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language             TEXT NOT NULL DEFAULT 'Hindi + English',
  price                NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price       NUMERIC(10,2),
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'active', 'completed', 'archived')),
  start_date           DATE,
  end_date             DATE,
  total_lectures       INTEGER DEFAULT 0,
  total_duration_hours NUMERIC(6,1) DEFAULT 0,
  max_students         INTEGER,
  enrolled_count       INTEGER NOT NULL DEFAULT 0,
  is_featured          BOOLEAN NOT NULL DEFAULT false,
  what_you_learn       TEXT[], -- array of learning points
  requirements         TEXT[], -- prerequisites
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- BATCH INSTRUCTORS (many-to-many)
-- ──────────────────────────────────────
CREATE TABLE batch_instructors (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id       UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  instructor_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_primary     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(batch_id, instructor_id)
);

-- ──────────────────────────────────────
-- SUBJECTS
-- ──────────────────────────────────────
CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id    UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  color       TEXT DEFAULT '#7C3AED',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(batch_id, slug)
);

-- ──────────────────────────────────────
-- CHAPTERS
-- ──────────────────────────────────────
CREATE TABLE chapters (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- LECTURES
-- ──────────────────────────────────────
CREATE TABLE lectures (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id       UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  video_url        TEXT,
  thumbnail_url    TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index      INTEGER NOT NULL DEFAULT 0,
  is_preview       BOOLEAN NOT NULL DEFAULT false,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- LECTURE RESOURCES
-- ──────────────────────────────────────
CREATE TABLE lecture_resources (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecture_id   UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('pdf', 'notes', 'link', 'assignment')),
  url          TEXT NOT NULL,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- ENROLLMENTS
-- ──────────────────────────────────────
CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id        UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('free', 'paid', 'pending', 'active', 'expired', 'cancelled')),
  payment_status  TEXT CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  payment_id      TEXT,
  payment_provider TEXT,
  amount_paid     NUMERIC(10,2),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  UNIQUE(student_id, batch_id)
);

-- Function to increment enrolled_count
CREATE OR REPLACE FUNCTION increment_enrolled_count(batch_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE batches SET enrolled_count = enrolled_count + 1 WHERE id = batch_id;
END;
$$;

-- ──────────────────────────────────────
-- LECTURE PROGRESS
-- ──────────────────────────────────────
CREATE TABLE lecture_progress (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lecture_id       UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  watched_seconds  INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed     BOOLEAN NOT NULL DEFAULT false,
  last_watched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  UNIQUE(student_id, lecture_id)
);

-- ──────────────────────────────────────
-- LIVE CLASSES
-- ──────────────────────────────────────
CREATE TABLE live_classes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  subject_id        UUID REFERENCES subjects(id) ON DELETE SET NULL,
  instructor_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  provider          TEXT NOT NULL DEFAULT 'zoom' CHECK (provider IN ('zoom', 'google_meet', 'youtube_live', 'custom')),
  meeting_url       TEXT NOT NULL,
  recording_url     TEXT,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_minutes  INTEGER NOT NULL DEFAULT 60,
  status            TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- STUDY MATERIALS
-- ──────────────────────────────────────
CREATE TABLE study_materials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id     UUID REFERENCES batches(id) ON DELETE CASCADE,
  subject_id   UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id   UUID REFERENCES chapters(id) ON DELETE SET NULL,
  lecture_id   UUID REFERENCES lectures(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'notes', 'formula_sheet', 'assignment', 'reference')),
  file_url     TEXT NOT NULL,
  file_size    BIGINT,
  uploaded_by  UUID NOT NULL REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- DPPs (Daily Practice Problems)
-- ──────────────────────────────────────
CREATE TABLE dpps (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id             UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  subject_id           UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id           UUID REFERENCES chapters(id) ON DELETE SET NULL,
  title                TEXT NOT NULL,
  description          TEXT,
  total_questions      INTEGER NOT NULL DEFAULT 0,
  time_limit_minutes   INTEGER,
  due_date             TIMESTAMPTZ,
  is_published         BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dpp_questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dpp_id          UUID NOT NULL REFERENCES dpps(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  option_a        TEXT NOT NULL,
  option_b        TEXT NOT NULL,
  option_c        TEXT NOT NULL,
  option_d        TEXT NOT NULL,
  correct_option  TEXT NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  explanation     TEXT,
  marks           INTEGER NOT NULL DEFAULT 1,
  order_index     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dpp_submissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dpp_id            UUID NOT NULL REFERENCES dpps(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers           JSONB NOT NULL DEFAULT '{}',
  score             INTEGER,
  total_questions   INTEGER,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dpp_id, student_id)
);

-- ──────────────────────────────────────
-- TESTS
-- ──────────────────────────────────────
CREATE TABLE tests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id          UUID REFERENCES batches(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT NOT NULL DEFAULT 'chapter' CHECK (type IN ('chapter', 'subject', 'full_test', 'mock')),
  total_questions   INTEGER NOT NULL DEFAULT 0,
  total_marks       INTEGER NOT NULL DEFAULT 0,
  duration_minutes  INTEGER NOT NULL DEFAULT 60,
  negative_marking  NUMERIC(4,2) NOT NULL DEFAULT 0,
  pass_percentage   INTEGER DEFAULT 40,
  start_time        TIMESTAMPTZ,
  end_time          TIMESTAMPTZ,
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id        UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  marks          INTEGER NOT NULL DEFAULT 1,
  explanation    TEXT,
  order_index    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE test_options (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  option_label  TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
  is_correct    BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE test_attempts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id           UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at      TIMESTAMPTZ,
  is_submitted      BOOLEAN NOT NULL DEFAULT false,
  score             NUMERIC(6,2),
  correct_count     INTEGER,
  incorrect_count   INTEGER,
  unattempted_count INTEGER,
  UNIQUE(test_id, student_id)
);

CREATE TABLE test_answers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id          UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id         UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  selected_option_id  UUID REFERENCES test_options(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────
-- DOUBTS
-- ──────────────────────────────────────
CREATE TABLE doubts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id     UUID REFERENCES batches(id) ON DELETE SET NULL,
  subject_id   UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id   UUID REFERENCES chapters(id) ON DELETE SET NULL,
  lecture_id   UUID REFERENCES lectures(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  image_url    TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'resolved')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE doubt_answers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doubt_id      UUID NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  answered_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer_text   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('class', 'lecture', 'dpp', 'test', 'result', 'announcement', 'general')),
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ──────────────────────────────────────
-- ANNOUNCEMENTS
-- ──────────────────────────────────────
CREATE TABLE announcements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id      UUID REFERENCES batches(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'batch', 'class', 'test')),
  published_by  UUID NOT NULL REFERENCES profiles(id),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────
-- INDEXES for performance
-- ──────────────────────────────────────
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_category ON batches(category_id);
CREATE INDEX idx_batches_featured ON batches(is_featured);
CREATE INDEX idx_subjects_batch ON subjects(batch_id);
CREATE INDEX idx_chapters_subject ON chapters(subject_id);
CREATE INDEX idx_lectures_chapter ON lectures(chapter_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_batch ON enrollments(batch_id);
CREATE INDEX idx_progress_student ON lecture_progress(student_id);
CREATE INDEX idx_progress_lecture ON lecture_progress(lecture_id);
CREATE INDEX idx_live_classes_batch ON live_classes(batch_id);
CREATE INDEX idx_live_classes_status ON live_classes(status);
CREATE INDEX idx_live_classes_scheduled ON live_classes(scheduled_at);
CREATE INDEX idx_doubts_student ON doubts(student_id);
CREATE INDEX idx_doubts_status ON doubts(status);
CREATE INDEX idx_test_attempts_student ON test_attempts(student_id);

-- ──────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpp_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Enrollments: students see only their own
CREATE POLICY "enrollments_own" ON enrollments FOR ALL USING (auth.uid() = student_id);

-- Lecture progress: students see only their own
CREATE POLICY "progress_own" ON lecture_progress FOR ALL USING (auth.uid() = student_id);

-- Doubts: students see only their own
CREATE POLICY "doubts_own" ON doubts FOR ALL USING (auth.uid() = student_id);

-- Notifications: users see only their own
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Test attempts: students see only their own
CREATE POLICY "attempts_own" ON test_attempts FOR ALL USING (auth.uid() = student_id);

-- DPP submissions: students see only their own
CREATE POLICY "dpp_own" ON dpp_submissions FOR ALL USING (auth.uid() = student_id);
