import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError, sendPaginated, getPagination } from '../utils/response';

// GET /api/doubts
export const getDoubts = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page as string, req.query.limit as string);
    const userId = req.user!.id;
    const { status } = req.query;

    let query = supabaseAdmin
      .from('doubts')
      .select(`
        *,
        profiles!doubts_student_id_fkey(name, avatar_url),
        subjects(name),
        doubt_answers(id, answer_text, created_at, profiles(name, avatar_url))
      `, { count: 'exact' })
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error || !data) {
      sendPaginated(res, [], page, limit, 0);
      return;
    }

    sendPaginated(res, data, page, limit, count || 0);
  } catch {
    sendPaginated(res, [], 1, 10, 0);
  }
};

// POST /api/doubts
export const createDoubt = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { batch_id, subject_id, chapter_id, lecture_id, title, description, image_url } = req.body;

    if (!title || !description) {
      sendError(res, 'Title and description are required');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('doubts')
      .insert({
        student_id: userId,
        batch_id,
        subject_id,
        chapter_id,
        lecture_id,
        title,
        description,
        image_url,
        status: 'pending',
      })
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Doubt submitted successfully', 201);
  } catch {
    sendError(res, 'Failed to create doubt', 500);
  }
};

// POST /api/doubts/:id/answer — instructor/admin only
export const answerDoubt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answer_text } = req.body;
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('doubt_answers')
      .insert({ doubt_id: id, answered_by: userId, answer_text })
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    // Update doubt status
    await supabaseAdmin
      .from('doubts')
      .update({ status: 'answered', updated_at: new Date().toISOString() })
      .eq('id', id);

    sendSuccess(res, data, 'Answer submitted', 201);
  } catch {
    sendError(res, 'Failed to answer doubt', 500);
  }
};
