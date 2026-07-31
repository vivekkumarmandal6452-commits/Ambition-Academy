import { supabaseAdmin } from '../config/supabase';
import { batchStore } from '../store/batchStore';
import { notesStore } from '../store/notesStore';
import { classStore } from '../store/classStore';
import { enrollmentStore } from '../store/enrollmentStore';

export interface StudentContextData {
  studentName: string;
  enrolledBatches: string[];
  recentTestScores?: string[];
  currentLecture?: string;
  weakTopics?: string[];
}

export const buildStudentContext = async (userId: string): Promise<StudentContextData> => {
  try {
    // 1. Get enrollments
    const localEnrollments = enrollmentStore.getByStudent(userId);
    let batchIds = localEnrollments.map(e => e.batch_id);

    try {
      const { data: dbEnroll } = await supabaseAdmin
        .from('enrollments')
        .select('batch_id')
        .eq('student_id', userId);
      if (dbEnroll && dbEnroll.length > 0) {
        batchIds = Array.from(new Set([...batchIds, ...dbEnroll.map((e: any) => e.batch_id)]));
      }
    } catch {}

    const allBatches = batchStore.getAll();
    const enrolledBatches = allBatches
      .filter(b => batchIds.includes(b.id))
      .map(b => `${b.title} (${b.target_exam || 'Exam Prep'})`);

    return {
      studentName: 'Student',
      enrolledBatches: enrolledBatches.length > 0 ? enrolledBatches : ['General JEE/NEET Prep Batch'],
      weakTopics: ['Rotational Motion', 'Organic Mechanisms', 'Calculus Integration'],
    };
  } catch (err) {
    return {
      studentName: 'Student',
      enrolledBatches: ['General Prep'],
    };
  }
};

export const retrieveRAGContext = async (query: string, limit: number = 3): Promise<Array<{ title: string; type: 'lecture' | 'material' | 'course'; content: string; source: string }>> => {
  const chunks: Array<{ title: string; type: 'lecture' | 'material' | 'course'; content: string; source: string }> = [];
  const qLower = query.toLowerCase();

  // Search Notes
  const allNotes = notesStore.getAll();
  allNotes.forEach(note => {
    if (
      note.title.toLowerCase().includes(qLower) ||
      (note.subject_name || '').toLowerCase().includes(qLower) ||
      (note.type || '').toLowerCase().includes(qLower)
    ) {
      chunks.push({
        title: note.title,
        type: 'material',
        content: `Study Note: ${note.title} [Subject: ${note.subject_name || 'General'}, Type: ${note.type}]. Document Link: ${note.file_url}`,
        source: `${note.subject_name || 'General'} → ${note.title}`,
      });
    }
  });

  // Search Live Classes / Lectures
  const allClasses = classStore.getAll();
  allClasses.forEach(cls => {
    if (
      cls.title.toLowerCase().includes(qLower) ||
      (cls.subject_name || '').toLowerCase().includes(qLower) ||
      (cls.batch_name || '').toLowerCase().includes(qLower)
    ) {
      chunks.push({
        title: cls.title,
        type: 'lecture',
        content: `Live Lecture: ${cls.title} [Batch: ${cls.batch_name || 'All Batches'}, Instructor: ${cls.instructor_name || 'Faculty'}, Scheduled: ${cls.scheduled_at}]`,
        source: `${cls.batch_name || 'Batch'} → ${cls.title}`,
      });
    }
  });

  // Search Batches
  const allBatches = batchStore.getAll();
  allBatches.forEach(b => {
    if (
      b.title.toLowerCase().includes(qLower) ||
      b.description.toLowerCase().includes(qLower) ||
      (b.target_exam || '').toLowerCase().includes(qLower)
    ) {
      chunks.push({
        title: b.title,
        type: 'course',
        content: `Course Batch: ${b.title} [Target Exam: ${b.target_exam}, Level: ${b.level}, Description: ${b.description}]`,
        source: `Ambition Academy → ${b.title}`,
      });
    }
  });

  return chunks.slice(0, limit);
};
