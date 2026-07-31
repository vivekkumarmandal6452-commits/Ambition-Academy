import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';

// GET /api/progress — get student's overall progress
export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { batch_id } = req.query;

    let query = supabaseAdmin
      .from('lecture_progress')
      .select(`
        *,
        lectures(id, title, duration_seconds, chapter_id,
          chapters(id, title, subject_id,
            subjects(id, name, batch_id)
          )
        )
      `)
      .eq('student_id', userId);

    if (batch_id) {
      query = query.eq('lectures.chapters.subjects.batch_id', batch_id as string);
    }

    const { data, error } = await query;
    if (error) { sendError(res, error.message); return; }

    const completed = (data || []).filter(p => p.is_completed).length;
    const total = data?.length || 0;

    sendSuccess(res, {
      progress: data || [],
      stats: {
        total_lectures_started: total,
        completed_lectures: completed,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    });
  } catch {
    sendError(res, 'Failed to fetch progress', 500);
  }
};

// POST /api/progress — save lecture progress
export const saveProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lecture_id, watched_seconds, duration_seconds, is_completed } = req.body;

    if (!lecture_id) {
      sendError(res, 'lecture_id is required');
      return;
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('lecture_progress')
      .upsert({
        student_id: userId,
        lecture_id,
        watched_seconds: watched_seconds || 0,
        duration_seconds: duration_seconds || 0,
        is_completed: is_completed || false,
        last_watched_at: now,
        completed_at: is_completed ? now : undefined,
      }, {
        onConflict: 'student_id,lecture_id',
      })
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'Failed to save progress', 500);
  }
};

// GET /api/progress/lecture/:id — get progress for a specific lecture
export const getLectureProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { data } = await supabaseAdmin
      .from('lecture_progress')
      .select('*')
      .eq('student_id', userId)
      .eq('lecture_id', id)
      .single();

    sendSuccess(res, data || null);
  } catch {
    sendError(res, 'Failed to fetch lecture progress', 500);
  }
};
