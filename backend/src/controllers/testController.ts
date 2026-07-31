import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError, sendPaginated, getPagination } from '../utils/response';

// GET /api/tests — list tests
export const getTests = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page as string, req.query.limit as string);
    const userId = req.user!.id;

    // Get batches student is enrolled in
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('batch_id')
      .eq('student_id', userId)
      .in('status', ['active', 'free', 'paid']);

    const batchIds = enrollments?.map(e => e.batch_id) || [];

    const { data, error, count } = await supabaseAdmin
      .from('tests')
      .select('*', { count: 'exact' })
      .in('batch_id', batchIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      sendPaginated(res, [], page, limit, 0);
      return;
    }

    // Get attempt status for each test
    const testIds = (data || []).map(t => t.id);
    const { data: attempts } = await supabaseAdmin
      .from('test_attempts')
      .select('test_id, score, is_submitted')
      .eq('student_id', userId)
      .in('test_id', testIds);

    const testsWithStatus = (data || []).map(test => {
      const attempt = attempts?.find(a => a.test_id === test.id);
      return {
        ...test,
        attempt_status: attempt?.is_submitted ? 'completed' : attempt ? 'in_progress' : 'not_started',
        score: attempt?.score,
      };
    });

    sendPaginated(res, testsWithStatus, page, limit, count || 0);
  } catch {
    sendError(res, 'Failed to fetch tests', 500);
  }
};

// GET /api/tests/:id — get test with questions
export const getTestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: test, error } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error || !test) {
      sendError(res, 'Test not found', 404);
      return;
    }

    // Check if already attempted
    const { data: attempt } = await supabaseAdmin
      .from('test_attempts')
      .select('id, is_submitted, score')
      .eq('test_id', id)
      .eq('student_id', userId)
      .single();

    if (attempt?.is_submitted) {
      sendError(res, 'Test already submitted. View result page.', 400);
      return;
    }

    // Get questions (without correct answers)
    const { data: questions } = await supabaseAdmin
      .from('test_questions')
      .select(`
        id, question_text, marks, order_index,
        test_options(id, option_text, option_label)
      `)
      .eq('test_id', id)
      .order('order_index');

    sendSuccess(res, { test, questions: questions || [], existing_attempt: attempt });
  } catch {
    sendError(res, 'Failed to fetch test', 500);
  }
};

// POST /api/tests/:id/start — start attempt
export const startTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check existing attempt
    const { data: existing } = await supabaseAdmin
      .from('test_attempts')
      .select('id, is_submitted')
      .eq('test_id', id)
      .eq('student_id', userId)
      .single();

    if (existing?.is_submitted) {
      sendError(res, 'Test already completed');
      return;
    }

    if (existing) {
      sendSuccess(res, existing);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('test_attempts')
      .insert({
        test_id: id,
        student_id: userId,
        started_at: new Date().toISOString(),
        is_submitted: false,
      })
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Test started', 201);
  } catch {
    sendError(res, 'Failed to start test', 500);
  }
};

// POST /api/tests/:id/submit — submit test
export const submitTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { attempt_id, answers } = req.body; // answers: [{question_id, selected_option_id}]
    const userId = req.user!.id;

    // Get test details
    const { data: test } = await supabaseAdmin
      .from('tests')
      .select('total_marks, negative_marking')
      .eq('id', id)
      .single();

    if (!test) {
      sendError(res, 'Test not found', 404);
      return;
    }

    // Get all questions with correct answers
    const { data: questions } = await supabaseAdmin
      .from('test_questions')
      .select(`id, marks, test_options(id, is_correct)`)
      .eq('test_id', id);

    // Calculate score
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const questionMap = new Map((questions || []).map(q => [q.id, q]));
    const answerMap = new Map(answers.map((a: {question_id: string, selected_option_id: string}) => [a.question_id, a.selected_option_id]));

    for (const [qId, q] of questionMap) {
      const selectedOptionId = answerMap.get(qId);
      if (!selectedOptionId) {
        unattempted++;
        continue;
      }
      const correctOption = (q.test_options as {id: string, is_correct: boolean}[]).find((o) => o.is_correct);
      if (correctOption?.id === selectedOptionId) {
        score += q.marks;
        correct++;
      } else {
        score -= test.negative_marking || 0;
        incorrect++;
      }
    }

    score = Math.max(0, score);

    // Save answers and update attempt
    const answerRows = answers.map((a: {question_id: string, selected_option_id: string}) => ({
      attempt_id,
      question_id: a.question_id,
      selected_option_id: a.selected_option_id,
    }));

    await supabaseAdmin.from('test_answers').insert(answerRows);

    const { data: updatedAttempt, error } = await supabaseAdmin
      .from('test_attempts')
      .update({
        is_submitted: true,
        submitted_at: new Date().toISOString(),
        score,
        correct_count: correct,
        incorrect_count: incorrect,
        unattempted_count: unattempted,
      })
      .eq('id', attempt_id)
      .eq('student_id', userId)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, {
      attempt: updatedAttempt,
      summary: { score, correct, incorrect, unattempted, total_marks: test.total_marks },
    });
  } catch {
    sendError(res, 'Failed to submit test', 500);
  }
};

// GET /api/tests/:id/result
export const getTestResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: attempt } = await supabaseAdmin
      .from('test_attempts')
      .select(`
        *,
        test_answers(
          question_id, selected_option_id,
          test_questions(question_text, marks, explanation,
            test_options(id, option_text, option_label, is_correct)
          )
        )
      `)
      .eq('test_id', id)
      .eq('student_id', userId)
      .eq('is_submitted', true)
      .single();

    if (!attempt) {
      sendError(res, 'Result not found', 404);
      return;
    }

    sendSuccess(res, attempt);
  } catch {
    sendError(res, 'Failed to fetch result', 500);
  }
};
