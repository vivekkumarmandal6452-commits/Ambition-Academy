import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError, sendPaginated, getPagination } from '../utils/response';
import fs from 'fs';
import path from 'path';

// ── Local Fallback Persistence ──────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../../data');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'test_attempts_local.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
};

const loadAttempts = (): any[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(ATTEMPTS_FILE)) {
      return JSON.parse(fs.readFileSync(ATTEMPTS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
};

const saveAttempts = (items: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('[testController] Failed to save local attempts:', e);
  }
};

let localAttempts = loadAttempts();

// Standard Fallback Test Series Data
const FALLBACK_TESTS = [
  {
    id: 'test_jee_full_01',
    title: 'JEE Main 2026 Full Syllabus Mock Test - 01',
    description: 'Comprehensive 3-hour full syllabus practice test covering Physics, Chemistry, and Mathematics.',
    type: 'full_mock',
    duration_minutes: 180,
    total_questions: 15,
    total_marks: 60,
    negative_marking: 1,
    is_published: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    batch_id: 'all',
  },
  {
    id: 'test_neet_physics_02',
    title: 'NEET Physics Unit Test: Mechanics & Motion',
    description: 'Targeted physics practice on Kinematics, Laws of Motion, and Rotational Dynamics.',
    type: 'chapter_test',
    duration_minutes: 60,
    total_questions: 10,
    total_marks: 40,
    negative_marking: 1,
    is_published: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    batch_id: 'all',
  },
  {
    id: 'test_chem_organic_03',
    title: 'Organic Chemistry Sprint: Reaction Mechanisms & Bonding',
    description: 'High-yield practice test covering Reaction Mechanisms, Hybridization, and Functional Groups.',
    type: 'chapter_test',
    duration_minutes: 45,
    total_questions: 10,
    total_marks: 40,
    negative_marking: 1,
    is_published: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    batch_id: 'all',
  },
];

const FALLBACK_QUESTIONS: Record<string, any[]> = {
  test_jee_full_01: [
    {
      id: 'q_jee_1',
      question_text: 'A particle moves along a straight line with velocity v = (3t² - 6t) m/s. Find the total distance traveled from t = 0 to t = 3 seconds.',
      marks: 4,
      order_index: 0,
      test_options: [
        { id: 'opt_1_a', option_label: 'A', option_text: '4 m', is_correct: false },
        { id: 'opt_1_b', option_label: 'B', option_text: '8 m', is_correct: true },
        { id: 'opt_1_c', option_label: 'C', option_text: '12 m', is_correct: false },
        { id: 'opt_1_d', option_label: 'D', option_text: '16 m', is_correct: false },
      ],
      explanation: 'Integrating speed |v| over [0,3]: velocity v=0 at t=2. From t=0 to 2, s1 = |-4| = 4m. From t=2 to 3, s2 = 4m. Total distance = 4 + 4 = 8 m.',
    },
    {
      id: 'q_jee_2',
      question_text: 'Which of the following molecules has zero dipole moment due to symmetrical geometry?',
      marks: 4,
      order_index: 1,
      test_options: [
        { id: 'opt_2_a', option_label: 'A', option_text: 'H₂O', is_correct: false },
        { id: 'opt_2_b', option_label: 'B', option_text: 'NH₃', is_correct: false },
        { id: 'opt_2_c', option_label: 'C', option_text: 'BF₃', is_correct: true },
        { id: 'opt_2_d', option_label: 'D', option_text: 'SO₂', is_correct: false },
      ],
      explanation: 'BF₃ has a trigonal planar geometry with bond angles of 120°. The vector sum of three equal B-F bond dipoles cancels out to 0.',
    },
    {
      id: 'q_jee_3',
      question_text: 'Find the derivative of f(x) = ln(sin(x²)) with respect to x.',
      marks: 4,
      order_index: 2,
      test_options: [
        { id: 'opt_3_a', option_label: 'A', option_text: '2x · cot(x²)', is_correct: true },
        { id: 'opt_3_b', option_label: 'B', option_text: '2x · tan(x²)', is_correct: false },
        { id: 'opt_3_c', option_label: 'C', option_text: 'cot(x²)', is_correct: false },
        { id: 'opt_3_d', option_label: 'D', option_text: '2x · cos(x²)', is_correct: false },
      ],
      explanation: 'Using chain rule: d/dx[ln(u)] = (1/u) · du/dx. u = sin(x²), du/dx = cos(x²) · 2x. So f\'(x) = (1/sin(x²)) · 2x · cos(x²) = 2x · cot(x²).',
    },
  ],
  test_neet_physics_02: [
    {
      id: 'q_neet_1',
      question_text: 'A block of mass 2 kg rests on a frictionless plane inclined at 30° to the horizontal. Calculate the magnitude of normal reaction force (g = 9.8 m/s²).',
      marks: 4,
      order_index: 0,
      test_options: [
        { id: 'opt_n1_a', option_label: 'A', option_text: '9.8 N', is_correct: false },
        { id: 'opt_n1_b', option_label: 'B', option_text: '16.97 N', is_correct: true },
        { id: 'opt_n1_c', option_label: 'C', option_text: '19.6 N', is_correct: false },
        { id: 'opt_n1_d', option_label: 'D', option_text: '8.48 N', is_correct: false },
      ],
      explanation: 'Normal force N = mg cos(30°) = 2 × 9.8 × (√3/2) = 19.6 × 0.866 = 16.97 N.',
    },
    {
      id: 'q_neet_2',
      question_text: 'A body dropped from a height h reaches the ground with velocity v. With what velocity must it be thrown downwards from height h to double its final ground speed?',
      marks: 4,
      order_index: 1,
      test_options: [
        { id: 'opt_n2_a', option_label: 'A', option_text: 'v', is_correct: false },
        { id: 'opt_n2_b', option_label: 'B', option_text: '√3 · v', is_correct: true },
        { id: 'opt_n2_c', option_label: 'C', option_text: '2v', is_correct: false },
        { id: 'opt_n2_d', option_label: 'D', option_text: '3v', is_correct: false },
      ],
      explanation: 'For initial u=0: v² = 2gh. Target speed = 2v. (2v)² = u² + 2gh => 4v² = u² + v² => u² = 3v² => u = √3 · v.',
    },
  ],
  test_chem_organic_03: [
    {
      id: 'q_chem_1',
      question_text: 'Which of the following carbocations is the MOST stable?',
      marks: 4,
      order_index: 0,
      test_options: [
        { id: 'opt_c1_a', option_label: 'A', option_text: 'Methyl carbocation (CH₃⁺)', is_correct: false },
        { id: 'opt_c1_b', option_label: 'B', option_text: 'Ethyl carbocation (CH₃CH₂⁺)', is_correct: false },
        { id: 'opt_c1_c', option_label: 'C', option_text: 'Tertiary butyl carbocation ((CH₃)₃C⁺)', is_correct: true },
        { id: 'opt_c1_d', option_label: 'D', option_text: 'Isopropyl carbocation ((CH₃)₂CH⁺)', is_correct: false },
      ],
      explanation: 'Tertiary butyl carbocation has 9 hyperconjugative alpha-hydrogens and strong +I inductive stabilization, making it the most stable.',
    },
  ],
};

// ──────────────── GET /api/tests ────────────────────────────────────────────
export const getTests = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const userId = req.user!.id;

    let dbTests: any[] = [];
    let dbCount = 0;

    try {
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('batch_id')
        .eq('student_id', userId)
        .in('status', ['active', 'free', 'paid']);

      const batchIds = enrollments?.map(e => e.batch_id) || [];

      let query = supabaseAdmin
        .from('tests')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (batchIds.length > 0) {
        query = query.in('batch_id', batchIds);
      }

      const { data, count } = await query.range(offset, offset + limit - 1);
      if (data && data.length > 0) {
        dbTests = data;
        dbCount = count || data.length;
      }
    } catch {}

    // Combine DB tests + Fallback test series
    const dbTestIds = new Set(dbTests.map(t => t.id));
    const combinedTests = [...dbTests, ...FALLBACK_TESTS.filter(t => !dbTestIds.has(t.id))];

    // Annotate each test with student's attempt status
    const testsWithStatus = combinedTests.map(test => {
      const attempt = localAttempts.find(a => a.test_id === test.id && a.student_id === userId);
      return {
        ...test,
        attempt_status: attempt?.is_submitted ? 'completed' : attempt ? 'in_progress' : 'not_started',
        score: attempt?.score,
        total_marks: test.total_marks || 60,
      };
    });

    sendPaginated(res, testsWithStatus, page, limit, combinedTests.length);
  } catch {
    // Fail-safe fallback
    const userId = req.user!.id;
    const testsWithStatus = FALLBACK_TESTS.map(test => {
      const attempt = localAttempts.find(a => a.test_id === test.id && a.student_id === userId);
      return {
        ...test,
        attempt_status: attempt?.is_submitted ? 'completed' : attempt ? 'in_progress' : 'not_started',
        score: attempt?.score,
      };
    });
    sendPaginated(res, testsWithStatus, 1, 10, testsWithStatus.length);
  }
};

// ──────────────── GET /api/tests/:id ─────────────────────────────────────────
export const getTestById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    // Check local attempts first
    const existingAttempt = localAttempts.find(a => a.test_id === id && a.student_id === userId);

    if (existingAttempt?.is_submitted) {
      sendError(res, 'Test already submitted. View result page.', 400);
      return;
    }

    // Try Supabase first
    let test: any = null;
    let questions: any[] = [];

    try {
      const { data: dbTest } = await supabaseAdmin
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();

      if (dbTest) {
        test = dbTest;
        const { data: dbQ } = await supabaseAdmin
          .from('test_questions')
          .select(`id, question_text, marks, order_index, test_options(id, option_text, option_label)`)
          .eq('test_id', id)
          .order('order_index');
        if (dbQ) questions = dbQ;
      }
    } catch {}

    // Fallback if not found in DB
    if (!test) {
      test = FALLBACK_TESTS.find(t => t.id === id);
    }
    if (questions.length === 0 && FALLBACK_QUESTIONS[id]) {
      questions = FALLBACK_QUESTIONS[id];
    }
    if (questions.length === 0) {
      // General default questions for dynamic tests
      questions = (FALLBACK_QUESTIONS['test_jee_full_01'] || []).map((q, idx) => ({
        ...q,
        id: `${id}_q_${idx}`,
      }));
    }

    if (!test) {
      sendError(res, 'Test not found', 404);
      return;
    }

    sendSuccess(res, { test, questions, existing_attempt: existingAttempt || null });
  } catch {
    sendError(res, 'Failed to fetch test', 500);
  }
};

// ──────────────── POST /api/tests/:id/start ──────────────────────────────────
export const startTest = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    // Check existing attempt
    let attempt = localAttempts.find(a => a.test_id === id && a.student_id === userId);

    if (attempt?.is_submitted) {
      sendError(res, 'Test already completed');
      return;
    }

    if (attempt) {
      sendSuccess(res, attempt);
      return;
    }

    const newAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      test_id: id,
      student_id: userId,
      started_at: new Date().toISOString(),
      is_submitted: false,
    };

    localAttempts.unshift(newAttempt);
    saveAttempts(localAttempts);

    // Try Supabase sync
    try {
      await supabaseAdmin.from('test_attempts').insert(newAttempt);
    } catch {}

    sendSuccess(res, newAttempt, 'Test started', 201);
  } catch {
    sendError(res, 'Failed to start test', 500);
  }
};

// ──────────────── POST /api/tests/:id/submit ─────────────────────────────────
export const submitTest = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { attempt_id, answers } = req.body; // answers: [{question_id, selected_option_id}]
    const userId = req.user!.id;

    // Get test
    let test: any = FALLBACK_TESTS.find(t => t.id === id) || { total_marks: 60, negative_marking: 1 };
    try {
      const { data } = await supabaseAdmin.from('tests').select('total_marks, negative_marking').eq('id', id).single();
      if (data) test = data;
    } catch {}

    // Get questions with correct answers
    let questions: any[] = FALLBACK_QUESTIONS[id] || FALLBACK_QUESTIONS['test_jee_full_01'] || [];
    try {
      const { data } = await supabaseAdmin.from('test_questions').select(`id, marks, test_options(id, is_correct, option_text, option_label)`).eq('test_id', id);
      if (data && data.length > 0) questions = data;
    } catch {}

    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const answerMap = new Map((answers || []).map((a: any) => [a.question_id, a.selected_option_id]));

    for (const q of questions) {
      const selectedOptionId = answerMap.get(q.id);
      if (!selectedOptionId) {
        unattempted++;
        continue;
      }
      const correctOption = (q.test_options || []).find((o: any) => o.is_correct);
      if (correctOption?.id === selectedOptionId || selectedOptionId === correctOption?.option_label) {
        score += (q.marks || 4);
        correct++;
      } else {
        score -= (test.negative_marking || 0);
        incorrect++;
      }
    }

    score = Math.max(0, score);

    // Update attempt
    let attemptIdx = localAttempts.findIndex(a => (a.id === attempt_id || (a.test_id === id && a.student_id === userId)));

    const updatedAttempt = {
      id: attempt_id || `att_${Date.now()}`,
      test_id: id,
      student_id: userId,
      is_submitted: true,
      submitted_at: new Date().toISOString(),
      score,
      correct_count: correct,
      incorrect_count: incorrect,
      unattempted_count: unattempted,
      user_answers: answers || [],
    };

    if (attemptIdx !== -1) {
      localAttempts[attemptIdx] = { ...localAttempts[attemptIdx], ...updatedAttempt };
    } else {
      localAttempts.unshift(updatedAttempt);
    }
    saveAttempts(localAttempts);

    // Try DB update
    try {
      await supabaseAdmin.from('test_attempts').update(updatedAttempt).eq('id', attempt_id);
    } catch {}

    sendSuccess(res, {
      attempt: updatedAttempt,
      summary: { score, correct, incorrect, unattempted, total_marks: test.total_marks || 60 },
    }, 'Test submitted successfully!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to submit test', 500);
  }
};

// ──────────────── GET /api/tests/:id/result ──────────────────────────────────
export const getTestResult = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    // Check local attempts first
    const attempt = localAttempts.find(a => a.test_id === id && a.student_id === userId && a.is_submitted);

    let test = FALLBACK_TESTS.find(t => t.id === id) || FALLBACK_TESTS[0];
    let questions = FALLBACK_QUESTIONS[id] || FALLBACK_QUESTIONS['test_jee_full_01'] || [];

    if (!attempt) {
      sendError(res, 'Result not found. Complete the test first.', 404);
      return;
    }

    sendSuccess(res, {
      ...attempt,
      test_title: test.title,
      total_marks: test.total_marks,
      questions: questions.map(q => {
        const userAns = (attempt.user_answers || []).find((ua: any) => ua.question_id === q.id);
        return {
          ...q,
          selected_option_id: userAns?.selected_option_id,
        };
      }),
    });
  } catch {
    sendError(res, 'Failed to fetch test result', 500);
  }
};
