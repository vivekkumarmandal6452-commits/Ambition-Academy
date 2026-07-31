import api from './api';
import { Batch, Category } from '../types';

export const batchService = {
  getAll: async (params?: { page?: number; limit?: number; category?: string; search?: string; level?: string }) => {
    const { data } = await api.get('/api/batches', { params });
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get(`/api/batches/${slug}`);
    return data.data as Batch;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/api/batches/${id}`);
    return data.data as Batch;
  },

  checkEnrollment: async (id: string) => {
    const { data } = await api.get(`/api/batches/${id}/enroll-check`);
    return data.data as { enrolled: boolean; enrollment: { id: string; status: string } | null };
  },
};

export const enrollmentService = {
  getMyEnrollments: async () => {
    const { data } = await api.get('/api/enrollments/me');
    return data.data;
  },

  enroll: async (batchId: string, payload?: { payment_confirmed?: boolean; payment_method?: string }) => {
    const { data } = await api.post('/api/enrollments', { batch_id: batchId, ...payload });
    return data;
  },
};

export const progressService = {
  getProgress: async (batchId?: string) => {
    const { data } = await api.get('/api/progress', { params: { batch_id: batchId } });
    return data.data;
  },

  getLectureProgress: async (lectureId: string) => {
    const { data } = await api.get(`/api/progress/lecture/${lectureId}`);
    return data.data;
  },

  saveProgress: async (payload: {
    lecture_id: string;
    watched_seconds: number;
    duration_seconds: number;
    is_completed?: boolean;
  }) => {
    const { data } = await api.post('/api/progress', payload);
    return data.data;
  },
};

export const classService = {
  getAll: async (params?: { batch_id?: string; status?: string; page?: number }) => {
    const { data } = await api.get('/api/classes', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/api/classes/${id}`);
    return data.data;
  },
};

export const testService = {
  getAll: async () => {
    const { data } = await api.get('/api/tests');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/api/tests/${id}`);
    return data.data;
  },

  start: async (id: string) => {
    const { data } = await api.post(`/api/tests/${id}/start`);
    return data.data;
  },

  submit: async (id: string, payload: { attempt_id: string; answers: { question_id: string; selected_option_id: string }[] }) => {
    const { data } = await api.post(`/api/tests/${id}/submit`, payload);
    return data.data;
  },

  getResult: async (id: string) => {
    const { data } = await api.get(`/api/tests/${id}/result`);
    return data.data;
  },
};

export const doubtService = {
  getAll: async (status?: string) => {
    const { data } = await api.get('/api/doubts', { params: { status } });
    return data;
  },

  create: async (payload: {
    title: string;
    description: string;
    batch_id?: string;
    subject_id?: string;
    image_url?: string;
  }) => {
    const { data } = await api.post('/api/doubts', payload);
    return data.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const { data } = await api.get('/api/notifications');
    return data.data;
  },

  markRead: async (id: string) => {
    await api.put(`/api/notifications/${id}/read`);
  },

  markAllRead: async () => {
    await api.put('/api/notifications/read-all');
  },

  getAnnouncements: async (batchId?: string) => {
    const { data } = await api.get('/api/notifications/announcements', { params: { batch_id: batchId } });
    return data.data;
  },
};

export const adminService = {
  getDashboard: async () => {
    const { data } = await api.get('/api/admin/dashboard');
    return data.data;
  },

  getUsers: async (params?: { page?: number; role?: string; search?: string }) => {
    const { data } = await api.get('/api/admin/users', { params });
    return data;
  },

  getStudentDetail: async (studentId: string) => {
    const { data } = await api.get(`/api/admin/students/${studentId}`);
    return data.data;
  },

  updateUser: async (id: string, payload: { role?: string; is_active?: boolean }) => {
    const { data } = await api.put(`/api/admin/users/${id}`, payload);
    return data.data;
  },

  getCategories: async () => {
    const { data } = await api.get('/api/admin/categories');
    return data.data as Category[];
  },

  getBatches: async (params?: { page?: number }) => {
    const { data } = await api.get('/api/admin/batches', { params });
    return data;
  },

  createBatch: async (payload: Partial<Batch>) => {
    const { data } = await api.post('/api/admin/batches', payload);
    return data.data;
  },

  updateBatch: async (id: string, payload: Partial<Batch>) => {
    const { data } = await api.put(`/api/admin/batches/${id}`, payload);
    return data.data;
  },

  deleteBatch: async (id: string) => {
    await api.delete(`/api/admin/batches/${id}`);
  },

  getSubjects: async (batchId?: string) => {
    const { data } = await api.get('/api/admin/subjects', { params: { batch_id: batchId } });
    return data.data;
  },

  createSubject: async (payload: { batch_id: string; name: string; color?: string; icon?: string; order_index?: number }) => {
    const { data } = await api.post('/api/admin/subjects', payload);
    return data.data;
  },

  createChapter: async (payload: { subject_id: string; title: string; order_index?: number }) => {
    const { data } = await api.post('/api/admin/chapters', payload);
    return data.data;
  },

  getLectures: async (chapterId?: string) => {
    const { data } = await api.get('/api/admin/lectures', { params: { chapter_id: chapterId } });
    return data.data;
  },

  createLecture: async (payload: object) => {
    const { data } = await api.post('/api/admin/lectures', payload);
    return data.data;
  },

  updateLecture: async (id: string, payload: object) => {
    const { data } = await api.put(`/api/admin/lectures/${id}`, payload);
    return data.data;
  },

  deleteLecture: async (id: string) => {
    await api.delete(`/api/admin/lectures/${id}`);
  },

  createClass: async (payload: object) => {
    const { data } = await api.post('/api/admin/classes', payload);
    return data.data;
  },

  createTest: async (payload: object) => {
    const { data } = await api.post('/api/admin/tests', payload);
    return data.data;
  },

  createAnnouncement: async (payload: { title: string; content: string; type: string; batch_id?: string }) => {
    const { data } = await api.post('/api/admin/announcements', payload);
    return data.data;
  },

  getDoubts: async (params?: { status?: string; page?: number }) => {
    const { data } = await api.get('/api/admin/doubts', { params });
    return data;
  },

  getStudyMaterials: async () => {
    const { data } = await api.get('/api/admin/study-materials');
    return data.data;
  },

  createStudyMaterial: async (payload: object) => {
    const { data } = await api.post('/api/admin/study-materials', payload);
    return data.data;
  },
};
