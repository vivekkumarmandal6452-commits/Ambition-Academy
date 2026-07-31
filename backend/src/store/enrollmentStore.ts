import fs from 'fs';
import path from 'path';

export interface EnrollmentItem {
  id: string;
  student_id: string;
  batch_id: string;
  status: 'active' | 'pending' | 'cancelled';
  payment_status?: 'paid' | 'pending' | 'failed' | 'free';
  amount_paid?: number;
  enrolled_at: string;
  batches?: any;
}

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'enrollments.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const loadFromDisk = (): EnrollmentItem[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw) as EnrollmentItem[];
    }
  } catch {}
  return [];
};

const saveToDisk = (items: EnrollmentItem[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('[enrollmentStore] Failed to persist enrollments:', e);
  }
};

class EnrollmentStore {
  private enrollments: EnrollmentItem[] = loadFromDisk();

  getByStudent(studentId: string): EnrollmentItem[] {
    return this.enrollments.filter(e => e.student_id === studentId);
  }

  getByStudentAndBatch(studentId: string, batchId: string): EnrollmentItem | undefined {
    return this.enrollments.find(e => e.student_id === studentId && e.batch_id === batchId);
  }

  add(item: Partial<EnrollmentItem>): EnrollmentItem {
    const newItem: EnrollmentItem = {
      id: item.id || `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: item.student_id || 'unknown',
      batch_id: item.batch_id || 'unknown',
      status: item.status || 'active',
      payment_status: item.payment_status || 'free',
      amount_paid: item.amount_paid || 0,
      enrolled_at: item.enrolled_at || new Date().toISOString(),
      batches: item.batches,
    };

    const existingIdx = this.enrollments.findIndex(
      e => e.student_id === newItem.student_id && e.batch_id === newItem.batch_id
    );

    if (existingIdx !== -1) {
      this.enrollments[existingIdx] = { ...this.enrollments[existingIdx], ...newItem };
    } else {
      this.enrollments.unshift(newItem);
    }

    saveToDisk(this.enrollments);
    return newItem;
  }
}

export const enrollmentStore = new EnrollmentStore();
