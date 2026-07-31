-- ============================================================
-- LUMINARY SEED DATA — Run after schema migration
-- ============================================================

-- Categories
INSERT INTO categories (id, name, slug, description, icon, color) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Engineering Entrance', 'engineering', 'JEE Mains, JEE Advanced preparation', '⚙️', '#7C3AED'),
  ('11111111-0000-0000-0000-000000000002', 'Medical Entrance', 'medical', 'NEET UG, NEET PG preparation', '🩺', '#EF4444'),
  ('11111111-0000-0000-0000-000000000003', 'Foundation', 'foundation', 'Class 9-10 foundation courses', '📚', '#10B981');

-- Platform Stats
INSERT INTO platform_stats (key, value, label, icon) VALUES
  ('total_students', '50000', 'Students Enrolled', '👨‍🎓'),
  ('total_courses', '120', 'Courses Available', '📚'),
  ('expert_educators', '45', 'Expert Educators', '👨‍🏫'),
  ('total_classes', '5000', 'Classes Delivered', '🎥'),
  ('learning_hours', '200000', 'Learning Hours', '⏱️');

-- Batches
INSERT INTO batches (id, category_id, title, slug, description, thumbnail_url, target_exam, level, language, price, original_price, status, start_date, end_date, total_lectures, is_featured, what_you_learn, requirements) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'JEE 2026 Complete Batch',
    'jee-2026-complete',
    'Comprehensive preparation for JEE Mains & Advanced 2026. Covers full syllabus of Physics, Chemistry & Mathematics with live classes, recorded lectures, DPPs, and mock tests.',
    NULL,
    'JEE Mains + Advanced',
    'advanced',
    'Hindi + English',
    2999,
    5999,
    'active',
    '2025-08-01',
    '2026-05-31',
    450,
    true,
    ARRAY['Complete PCM syllabus', 'JEE-level problem solving', '300+ hours of video', 'Mock test series', 'DPP practice', 'Doubt sessions'],
    ARRAY['Class 11th or 12th studying', 'Basic concepts of Physics, Chemistry, Math', 'Strong dedication']
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000002',
    'NEET 2026 Dropper Batch',
    'neet-2026-dropper',
    'Specially designed for NEET droppers. Intensive course with full syllabus coverage, revision sessions, and unlimited doubt support.',
    NULL,
    'NEET UG',
    'advanced',
    'Hindi + English',
    2499,
    4999,
    'active',
    '2025-09-01',
    '2026-04-30',
    380,
    true,
    ARRAY['Complete Biology, Physics & Chemistry', 'NEET-level MCQ practice', 'Revision strategies', 'Previous year analysis', 'Full-length mocks'],
    ARRAY['NEET aspirant (dropper or class 12)', 'Basic science knowledge']
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000003',
    'Class 10 Foundation Batch',
    'class-10-foundation',
    'Complete preparation for Class 10 board exams and foundation for competitive exams. Science and Mathematics focus.',
    NULL,
    'CBSE Class 10 Boards',
    'beginner',
    'Hindi + English',
    0,
    1999,
    'active',
    '2025-07-01',
    '2026-03-31',
    200,
    false,
    ARRAY['Complete Class 10 Science & Math', 'Board exam strategies', 'Chapter-wise tests', 'NCERT coverage'],
    ARRAY['Class 9 passed', 'Basic understanding of subjects']
  );

-- Subjects for JEE Batch
INSERT INTO subjects (id, batch_id, name, slug, color, icon, order_index) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Physics', 'physics', '#7C3AED', '⚡', 1),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Chemistry', 'chemistry', '#EF4444', '🧪', 2),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Mathematics', 'mathematics', '#3B82F6', '📐', 3);

-- Subjects for NEET Batch
INSERT INTO subjects (id, batch_id, name, slug, color, icon, order_index) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'Biology', 'biology', '#10B981', '🌿', 1),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'Physics', 'physics', '#7C3AED', '⚡', 2),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000002', 'Chemistry', 'chemistry', '#EF4444', '🧪', 3);

-- Chapters for Physics (JEE)
INSERT INTO chapters (id, subject_id, title, order_index) VALUES
  ('cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'Kinematics', 1),
  ('cccccccc-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'Laws of Motion', 2),
  ('cccccccc-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001', 'Work, Energy & Power', 3),
  ('cccccccc-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000001', 'Gravitation', 4);

-- Chapters for Chemistry (JEE)
INSERT INTO chapters (id, subject_id, title, order_index) VALUES
  ('cccccccc-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000002', 'Some Basic Concepts', 1),
  ('cccccccc-0000-0000-0000-000000000006', 'bbbbbbbb-0000-0000-0000-000000000002', 'Atomic Structure', 2),
  ('cccccccc-0000-0000-0000-000000000007', 'bbbbbbbb-0000-0000-0000-000000000002', 'Chemical Bonding', 3);

-- Lectures for Kinematics
INSERT INTO lectures (id, chapter_id, title, description, video_url, duration_seconds, order_index, is_preview) VALUES
  ('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Introduction to Kinematics', 'Basic concepts of motion, distance, displacement', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3600, 1, true),
  ('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'Velocity and Acceleration', 'Types of motion, equations of motion', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 4200, 2, false),
  ('dddddddd-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000001', 'Projectile Motion', 'Horizontal and vertical projectiles', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5400, 3, false),
  ('dddddddd-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000001', 'Relative Motion', 'Concept of relative velocity and reference frames', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3900, 4, false);

-- DPP for Kinematics
INSERT INTO dpps (id, batch_id, subject_id, chapter_id, title, total_questions, is_published) VALUES
  ('eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Kinematics DPP #1', 5, true);

INSERT INTO dpp_questions (dpp_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, marks, order_index) VALUES
  ('eeeeeeee-0000-0000-0000-000000000001', 'A car starts from rest and accelerates uniformly at 2 m/s². What is its velocity after 5 seconds?', '5 m/s', '10 m/s', '15 m/s', '20 m/s', 'b', 'v = u + at = 0 + 2×5 = 10 m/s', 1, 1),
  ('eeeeeeee-0000-0000-0000-000000000001', 'Distance covered in nth second is given by?', 'u + an', 'u + a(2n-1)/2', 'u + a(n-1)', 'u + an/2', 'b', 'Sn = u + a(2n-1)/2', 1, 2),
  ('eeeeeeee-0000-0000-0000-000000000001', 'A ball is thrown vertically upward with velocity 20 m/s. Maximum height reached (g=10)?', '10 m', '20 m', '30 m', '40 m', 'b', 'H = v²/2g = 400/20 = 20 m', 1, 3);

-- Test
INSERT INTO tests (id, batch_id, title, type, total_questions, total_marks, duration_minutes, is_published) VALUES
  ('ffffffff-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Physics Chapter Test — Kinematics', 'chapter', 10, 40, 30, true);

INSERT INTO test_questions (id, test_id, question_text, marks, order_index) VALUES
  ('gggggggg-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000001', 'The velocity of a particle is v = 3t² + 2t. Find acceleration at t = 2s.', 4, 1),
  ('gggggggg-0000-0000-0000-000000000002', 'ffffffff-0000-0000-0000-000000000001', 'A body starts from rest. The ratio of distance covered in 1st, 2nd, 3rd second is:', 4, 2);

INSERT INTO test_options (question_id, option_text, option_label, is_correct) VALUES
  ('gggggggg-0000-0000-0000-000000000001', '14 m/s²', 'A', true),
  ('gggggggg-0000-0000-0000-000000000001', '8 m/s²', 'B', false),
  ('gggggggg-0000-0000-0000-000000000001', '12 m/s²', 'C', false),
  ('gggggggg-0000-0000-0000-000000000001', '16 m/s²', 'D', false),
  ('gggggggg-0000-0000-0000-000000000002', '1:2:3', 'A', false),
  ('gggggggg-0000-0000-0000-000000000002', '1:3:5', 'B', true),
  ('gggggggg-0000-0000-0000-000000000002', '1:4:9', 'C', false),
  ('gggggggg-0000-0000-0000-000000000002', '1:2:4', 'D', false);
