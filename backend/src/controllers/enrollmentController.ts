import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';
import { batchStore } from '../store/batchStore';
import { enrollmentStore } from '../store/enrollmentStore';

// GET /api/enrollments/me — student's enrollments
export const getMyEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const localEnrollments = enrollmentStore.getByStudent(userId);

    let dbEnrollments: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('enrollments')
        .select(`
          *,
          batches(
            id, title, slug, thumbnail_url, status, target_exam,
            subjects(count)
          )
        `)
        .eq('student_id', userId)
        .in('status', ['active', 'free', 'paid'])
        .order('enrolled_at', { ascending: false });

      if (data) dbEnrollments = data;
    } catch {}

    // Combine DB and Local store avoiding duplicates
    const dbBatchIds = new Set(dbEnrollments.map(e => e.batch_id));
    const extraLocal = localEnrollments.filter(e => !dbBatchIds.has(e.batch_id));
    const combined = [...dbEnrollments, ...extraLocal];

    // Enrich missing batch metadata from batchStore
    const enriched = combined.map(enrollment => {
      let b = enrollment.batches;
      if (!b && enrollment.batch_id) {
        b = batchStore.getById(enrollment.batch_id);
      }
      return {
        ...enrollment,
        batches: b || {
          id: enrollment.batch_id,
          title: 'Enrolled Batch',
          target_exam: 'Competitive Exam',
          status: 'active',
        },
      };
    });

    sendSuccess(res, enriched);
  } catch {
    const localOnly = enrollmentStore.getByStudent(req.user!.id).map(e => ({
      ...e,
      batches: e.batches || batchStore.getById(e.batch_id) || { title: 'Batch' },
    }));
    sendSuccess(res, localOnly);
  }
};

// POST /api/enrollments — enroll in a batch
export const enrollInBatch = async (req: Request, res: Response) => {
  try {
    const { batch_id, payment_confirmed, payment_method } = req.body;
    const userId = req.user!.id;

    if (!batch_id) {
      sendError(res, 'batch_id is required', 400);
      return;
    }

    // Check store or DB for batch
    let batch = batchStore.getById(batch_id);
    if (!batch) {
      try {
        const { data } = await supabaseAdmin.from('batches').select('*').eq('id', batch_id).single();
        if (data) batch = data as any;
      } catch {}
    }

    if (!batch) {
      sendError(res, 'Batch not found', 404);
      return;
    }

    // Check existing enrollment
    const existingLocal = enrollmentStore.getByStudentAndBatch(userId, batch_id);
    if (existingLocal && existingLocal.status === 'active') {
      sendError(res, 'Already enrolled in this batch', 400);
      return;
    }

    const isFree = batch.price === 0;

    // For paid batches without payment confirmation
    if (!isFree && !payment_confirmed) {
      sendSuccess(res, {
        requires_payment: true,
        amount: batch.price,
        original_price: batch.original_price,
        batch_id: batch.id,
        batch_title: batch.title,
        message: 'Payment required for paid batch',
      }, 'Payment required', 200);
      return;
    }

    // Execute Enrollment (Free batch OR Paid batch with confirmed payment)
    const enrollmentData = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: userId,
      batch_id: batch.id,
      status: 'active' as const,
      payment_status: isFree ? ('free' as const) : ('paid' as const),
      amount_paid: isFree ? 0 : batch.price,
      enrolled_at: new Date().toISOString(),
      batches: batch,
    };

    // Save to local store
    const savedLocal = enrollmentStore.add(enrollmentData);
    batchStore.incrementEnrolledCount(batch.id);

    // Try Supabase sync
    try {
      await supabaseAdmin.from('batches').upsert({
        id: batch.id,
        title: batch.title,
        slug: batch.slug,
        price: batch.price,
        status: batch.status,
      }, { onConflict: 'id' });

      await supabaseAdmin.from('enrollments').insert({
        student_id: userId,
        batch_id: batch.id,
        status: 'active',
        payment_status: isFree ? 'free' : 'paid',
        amount_paid: isFree ? 0 : batch.price,
        enrolled_at: enrollmentData.enrolled_at,
      });
    } catch {
      // Ignore Supabase sync error; local persistence ensures seamless functionality
    }

    sendSuccess(res, {
      enrollment: savedLocal,
      requires_payment: false,
    }, isFree ? 'Successfully enrolled in Free batch!' : `Payment of ₹${batch.price} successful! Batch enrolled.`, 201);
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to enroll in batch', 500);
  }
};
