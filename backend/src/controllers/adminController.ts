import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError, sendPaginated, getPagination } from '../utils/response';
import { batchStore } from '../store/batchStore';
import { notesStore } from '../store/notesStore';

// ──────────────── DASHBOARD ────────────────
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const results = await Promise.allSettled([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('batches').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('lectures').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('live_classes').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabaseAdmin.from('profiles').select('id, name, email, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('live_classes').select('*, batches(title)').in('status', ['scheduled', 'live']).order('scheduled_at').limit(5),
    ]);

    const getValue = (res: PromiseSettledResult<any>, defaultVal: any) =>
      res.status === 'fulfilled' ? res.value : defaultVal;

    const totalStudents = getValue(results[0], { count: 0 }).count || 0;
    const totalBatches = getValue(results[1], { count: 0 }).count || 0;
    const totalLectures = getValue(results[2], { count: 0 }).count || 0;
    const totalEnrollments = getValue(results[3], { count: 0 }).count || 0;
    const liveClasses = getValue(results[4], { count: 0 }).count || 0;
    const recentStudents = getValue(results[5], { data: [] }).data || [];
    const upcomingClasses = getValue(results[6], { data: [] }).data || [];

    sendSuccess(res, {
      stats: {
        total_students: totalStudents,
        total_batches: totalBatches,
        total_lectures: totalLectures,
        total_enrollments: totalEnrollments,
        live_classes: liveClasses,
      },
      recent_students: recentStudents,
      upcoming_classes: upcomingClasses,
    });
  } catch {
    sendError(res, 'Failed to fetch dashboard data', 500);
  }
};

// ──────────────── USERS ────────────────
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page as string, req.query.limit as string);
    const { role, search } = req.query;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) query = query.eq('role', role);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;
    if (error) { sendPaginated(res, [], page, limit, 0); return; }

    sendPaginated(res, data || [], page, limit, count || 0);
  } catch {
    sendPaginated(res, [], 1, 10, 0);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'User updated');
  } catch {
    sendError(res, 'Failed to update user', 500);
  }
};

// ──────────────── BATCHES ────────────────
export const adminGetBatches = async (req: Request, res: Response) => {
  try {
    const { page, limit } = getPagination(req.query.page as string, req.query.limit as string);
    const storeBatches = batchStore.getAll();

    try {
      const { data } = await supabaseAdmin.from('batches').select('*, categories(name)').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbSlugs = new Set(data.map(d => d.slug || d.id));
        const customStoreItems = storeBatches.filter(i => !dbSlugs.has(i.slug) && !dbSlugs.has(i.id));
        const combined = [...data, ...customStoreItems];
        sendPaginated(res, combined, page, limit, combined.length);
        return;
      }
    } catch {}

    sendPaginated(res, storeBatches, page, limit, storeBatches.length);
  } catch {
    sendPaginated(res, batchStore.getAll(), 1, 10, batchStore.getAll().length);
  }
};

export const adminCreateBatch = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Add to real-time batchStore so students immediately see it
    const createdBatch = batchStore.add({
      title: body.title,
      slug: body.slug,
      description: body.description,
      target_exam: body.target_exam,
      level: body.level,
      price: body.price,
      original_price: body.original_price,
      status: body.status,
      is_featured: body.is_featured,
      category_id: body.category_id,
    });

    // Try inserting into DB as well
    try {
      await supabaseAdmin.from('batches').insert({ ...body, slug: createdBatch.slug, enrolled_count: 0 });
    } catch {}

    sendSuccess(res, createdBatch, 'Batch created successfully', 201);
  } catch {
    const fallback = batchStore.add(req.body);
    sendSuccess(res, fallback, 'Batch created', 201);
  }
};

export const adminUpdateBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = batchStore.update(id, req.body);

    try {
      await supabaseAdmin.from('batches').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', id);
    } catch {}

    sendSuccess(res, updated || { id, ...req.body }, 'Batch updated');
  } catch {
    sendError(res, 'Failed to update batch', 500);
  }
};

export const adminDeleteBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    batchStore.delete(id);

    try {
      await supabaseAdmin.from('batches').delete().eq('id', id);
    } catch {}

    sendSuccess(res, null, 'Batch deleted');
  } catch {
    sendError(res, 'Failed to delete batch', 500);
  }
};

// ──────────────── SUBJECTS ────────────────
export const adminGetSubjects = async (req: Request, res: Response) => {
  try {
    const { batch_id } = req.query;

    let query = supabaseAdmin
      .from('subjects')
      .select('*, chapters(id, title, order_index, lectures(count))')
      .order('order_index');

    if (batch_id) query = query.eq('batch_id', batch_id);

    const { data, error } = await query;
    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data || []);
  } catch {
    sendError(res, 'Failed to fetch subjects', 500);
  }
};

export const adminCreateSubject = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({ ...body, slug })
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Subject created', 201);
  } catch {
    sendError(res, 'Failed to create subject', 500);
  }
};

// ──────────────── CHAPTERS ────────────────
export const adminCreateChapter = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .insert(req.body)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Chapter created', 201);
  } catch {
    sendError(res, 'Failed to create chapter', 500);
  }
};

// ──────────────── LECTURES ────────────────
export const adminGetLectures = async (req: Request, res: Response) => {
  try {
    const { chapter_id } = req.query;

    let query = supabaseAdmin
      .from('lectures')
      .select('*')
      .order('order_index');

    if (chapter_id) query = query.eq('chapter_id', chapter_id);

    const { data, error } = await query;
    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data || []);
  } catch {
    sendError(res, 'Failed to fetch lectures', 500);
  }
};

export const adminCreateLecture = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('lectures')
      .insert(req.body)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Lecture created', 201);
  } catch {
    sendError(res, 'Failed to create lecture', 500);
  }
};

export const adminUpdateLecture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('lectures')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Lecture updated');
  } catch {
    sendError(res, 'Failed to update lecture', 500);
  }
};

export const adminDeleteLecture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('lectures').delete().eq('id', id);
    if (error) { sendError(res, error.message); return; }
    sendSuccess(res, null, 'Lecture deleted');
  } catch {
    sendError(res, 'Failed to delete lecture', 500);
  }
};

// ──────────────── LIVE CLASSES ────────────────
export const adminCreateLiveClass = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .insert(req.body)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Class scheduled', 201);
  } catch {
    sendError(res, 'Failed to schedule class', 500);
  }
};

export const adminUpdateLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Class updated');
  } catch {
    sendError(res, 'Failed to update class', 500);
  }
};

// ──────────────── TESTS ────────────────
export const adminCreateTest = async (req: Request, res: Response) => {
  try {
    const { questions, ...testData } = req.body;

    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .insert(testData)
      .select()
      .single();

    if (testError) { sendError(res, testError.message); return; }

    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const { options, ...qData } = questions[i];
        const { data: question } = await supabaseAdmin
          .from('test_questions')
          .insert({ ...qData, test_id: test.id, order_index: i })
          .select()
          .single();

        if (question && options) {
          await supabaseAdmin.from('test_options').insert(
            options.map((opt: {option_text: string, option_label: string, is_correct: boolean}) => ({ ...opt, question_id: question.id }))
          );
        }
      }
    }

    sendSuccess(res, test, 'Test created', 201);
  } catch {
    sendError(res, 'Failed to create test', 500);
  }
};

// ──────────────── ANNOUNCEMENTS ────────────────
export const adminCreateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({ ...req.body, published_by: req.user!.id })
      .select()
      .single();

    if (error) { sendError(res, error.message); return; }

    sendSuccess(res, data, 'Announcement published', 201);
  } catch {
    sendError(res, 'Failed to publish announcement', 500);
  }
};

export const adminGetDoubts = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page as string, req.query.limit as string);
    const { status } = req.query;

    let query = supabaseAdmin
      .from('doubts')
      .select(`
        *,
        profiles!doubts_student_id_fkey(name, avatar_url),
        subjects(name),
        doubt_answers(id, answer_text, created_at)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) { sendError(res, error.message); return; }

    sendPaginated(res, data || [], page, limit, count || 0);
  } catch {
    sendError(res, 'Failed to fetch doubts', 500);
  }
};

export const adminGetStudyMaterials = async (req: Request, res: Response) => {
  try {
    const localNotes = notesStore.getAll();
    let dbNotes: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('study_materials')
        .select('*, batches(title), subjects(name)')
        .order('created_at', { ascending: false });
      if (data) dbNotes = data;
    } catch {}

    const dbIds = new Set(dbNotes.map((n: any) => n.id));
    const combined = [...localNotes.filter((n: any) => !dbIds.has(n.id)), ...dbNotes];
    sendSuccess(res, combined);
  } catch {
    sendSuccess(res, notesStore.getAll());
  }
};

export const adminCreateStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { title, file_url, type, subject_name, batch_name } = req.body;
    if (!title || !file_url) {
      sendError(res, 'Title and file_url are required', 400);
      return;
    }

    const newNote = notesStore.add({
      title,
      file_url,
      type: type || 'PDF Notes',
      subject_name: subject_name || 'Physics',
      batch_name: batch_name || 'All Batches',
    });

    try {
      await supabaseAdmin.from('study_materials').insert({
        id: newNote.id,
        title: newNote.title,
        file_url: newNote.file_url,
        type: newNote.type,
      });
    } catch {}

    sendSuccess(res, newNote, 'Material added successfully', 201);
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to add material', 500);
  }
};

export const adminDeleteStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    notesStore.delete(String(id));
    try { await supabaseAdmin.from('study_materials').delete().eq('id', id); } catch {}
    sendSuccess(res, null, 'Study material deleted');
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to delete material', 500);
  }
};

// Static fallback categories (used when Supabase categories table is missing)
const STATIC_CATEGORIES = [
  { id: 'cat_jee', name: 'JEE', slug: 'jee', created_at: new Date().toISOString() },
  { id: 'cat_neet', name: 'NEET', slug: 'neet', created_at: new Date().toISOString() },
  { id: 'cat_foundation', name: 'Foundation', slug: 'foundation', created_at: new Date().toISOString() },
  { id: 'cat_board', name: 'Board Exams', slug: 'board-exams', created_at: new Date().toISOString() },
  { id: 'cat_competitive', name: 'Competitive Exams', slug: 'competitive-exams', created_at: new Date().toISOString() },
];

export const adminGetCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data && data.length > 0) {
      sendSuccess(res, data);
      return;
    }

    // Table missing or empty — return static categories
    sendSuccess(res, STATIC_CATEGORIES);
  } catch {
    sendSuccess(res, STATIC_CATEGORIES);
  }
};
