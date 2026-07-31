import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      sendSuccess(res, { notifications: [], unread_count: 0 });
      return;
    }

    const unread = (data || []).filter(n => !n.is_read).length;

    sendSuccess(res, { notifications: data || [], unread_count: unread });
  } catch {
    sendSuccess(res, { notifications: [], unread_count: 0 });
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    sendSuccess(res, null, 'Marked as read');
  } catch {
    sendError(res, 'Failed to update notification', 500);
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    sendSuccess(res, null, 'All notifications marked as read');
  } catch {
    sendError(res, 'Failed to update notifications', 500);
  }
};

// GET /api/announcements
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { batch_id } = req.query;

    let query = supabaseAdmin
      .from('announcements')
      .select('*, profiles!announcements_published_by_fkey(name, avatar_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (batch_id) {
      query = query.or(`batch_id.eq.${batch_id},batch_id.is.null`);
    }

    const { data, error } = await query;
    if (error || !data) { sendSuccess(res, []); return; }

    sendSuccess(res, data);
  } catch {
    sendSuccess(res, []);
  }
};
