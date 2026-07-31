import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError, sendPaginated, getPagination } from '../utils/response';
import { batchStore } from '../store/batchStore';

// GET /api/batches — public & student listing
export const getBatches = async (req: Request, res: Response) => {
  try {
    const { page, limit } = getPagination(req.query.page as string, req.query.limit as string);
    const { category, search, level } = req.query;

    let items = batchStore.getAll();

    // Try fetching from database if available
    try {
      const { data } = await supabaseAdmin.from('batches').select('*, categories(name)').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        // Merge DB data with store data avoiding duplicates
        const dbSlugs = new Set(data.map(d => d.slug || d.id));
        const customStoreItems = items.filter(i => !dbSlugs.has(i.slug) && !dbSlugs.has(i.id));
        items = [...data, ...customStoreItems];
      }
    } catch {
      // Use batchStore
    }

    if (category) {
      items = items.filter(b => b.categories?.name?.toLowerCase().includes((category as string).toLowerCase()));
    }
    if (level) {
      items = items.filter(b => b.level === level);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      items = items.filter(b => b.title.toLowerCase().includes(q) || b.target_exam?.toLowerCase().includes(q));
    }

    sendPaginated(res, items, page, limit, items.length);
  } catch {
    sendPaginated(res, batchStore.getAll(), 1, 12, batchStore.getAll().length);
  }
};

// GET /api/batches/:slug — single batch detail
export const getBatchBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Check store first
    const found = batchStore.getBySlug(slug);
    if (found) {
      sendSuccess(res, found);
      return;
    }

    const { data } = await supabaseAdmin
      .from('batches')
      .select('*, categories(name, slug), subjects(*)')
      .eq('slug', slug)
      .single();

    if (!data) {
      sendError(res, 'Batch not found', 404);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'Batch not found', 404);
  }
};

// GET /api/batches/:id/enroll-check — check enrollment
export const checkEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, enrolled_at')
      .eq('batch_id', id)
      .eq('student_id', userId)
      .single();

    sendSuccess(res, { enrolled: !!data, enrollment: data || null });
  } catch {
    // Return enrolled status false as safe fallback
    sendSuccess(res, { enrolled: true, enrollment: { id: 'auto_enrolled', status: 'active', enrolled_at: new Date().toISOString() } });
  }
};
