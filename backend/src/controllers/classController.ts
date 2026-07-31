import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError, sendPaginated, getPagination } from '../utils/response';
import { classStore } from '../store/classStore';

// GET /api/classes
export const getLiveClasses = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page as string, req.query.limit as string);
    const { batch_id, status } = req.query;

    classStore.autoUpdateStatuses();

    // Always return from local store first (works without Supabase)
    const localClasses = classStore.getAll({
      status: status as string | undefined,
      batch_id: batch_id as string | undefined,
    });

    // Try Supabase and merge
    let dbClasses: any[] = [];
    try {
      let query = supabaseAdmin
        .from('live_classes')
        .select(`*, batches(id, title, slug), subjects(id, name), profiles!live_classes_instructor_id_fkey(id, name)`)
        .order('scheduled_at', { ascending: true })
        .range(offset, offset + limit - 1);
      if (batch_id) query = query.eq('batch_id', batch_id);
      if (status) query = query.eq('status', status);
      const { data } = await query;
      if (data) dbClasses = data;
    } catch {}

    const dbIds = new Set(dbClasses.map(c => c.id));
    const combined = [
      ...localClasses.filter(c => !dbIds.has(c.id)),
      ...dbClasses,
    ];

    const paginated = combined.slice(0, limit);
    sendPaginated(res, paginated, page, limit, combined.length);
  } catch {
    const local = classStore.getAll();
    sendPaginated(res, local, 1, 20, local.length);
  }
};

// GET /api/classes/:id
export const getLiveClassById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const local = classStore.getById(id);
    if (local) { sendSuccess(res, local); return; }

    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .select(`*, batches(id, title, slug), subjects(id, name), profiles!live_classes_instructor_id_fkey(id, name)`)
      .eq('id', id)
      .single();

    if (error || !data) { sendError(res, 'Class not found', 404); return; }
    sendSuccess(res, data);
  } catch {
    sendError(res, 'Failed to fetch class', 500);
  }
};

// POST /api/admin/classes — create live class
export const createLiveClass = async (req: Request, res: Response) => {
  try {
    const {
      title, description, meeting_url, scheduled_at,
      duration_minutes, batch_id, batch_name,
      subject_name, instructor_name, platform, thumbnail_url,
    } = req.body;

    if (!title || !meeting_url) {
      sendError(res, 'title and meeting_url are required', 400);
      return;
    }

    const newClass = classStore.add({
      title,
      description,
      meeting_url,
      scheduled_at: scheduled_at || new Date().toISOString(),
      duration_minutes: Number(duration_minutes) || 60,
      status: 'scheduled',
      batch_id,
      batch_name: batch_name || 'All Batches',
      subject_name: subject_name || 'General',
      instructor_name: instructor_name || 'Faculty',
      platform: platform || 'youtube',
      thumbnail_url,
    });

    // Try Supabase sync
    try {
      await supabaseAdmin.from('live_classes').insert({
        id: newClass.id,
        title: newClass.title,
        meeting_url: newClass.meeting_url,
        scheduled_at: newClass.scheduled_at,
        duration_minutes: newClass.duration_minutes,
        status: newClass.status,
        batch_id: newClass.batch_id,
      });
    } catch {}

    sendSuccess(res, newClass, 'Live class scheduled!', 201);
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to create live class', 500);
  }
};

// PUT /api/admin/classes/:id — update (go live, end class, etc.)
export const updateLiveClass = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    const updated = classStore.update(id, updates);
    if (!updated) {
      sendError(res, 'Class not found', 404);
      return;
    }

    try {
      await supabaseAdmin.from('live_classes').update(updates).eq('id', id);
    } catch {}

    sendSuccess(res, updated, 'Class updated!');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to update class', 500);
  }
};

// DELETE /api/admin/classes/:id
export const deleteLiveClass = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    classStore.delete(id);
    try { await supabaseAdmin.from('live_classes').delete().eq('id', id); } catch {}
    sendSuccess(res, null, 'Class deleted');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to delete', 500);
  }
};
