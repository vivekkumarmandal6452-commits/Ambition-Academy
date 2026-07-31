import fs from 'fs';
import path from 'path';

export interface StudyMaterialItem {
  id: string;
  title: string;
  file_url: string;
  type: string; // 'PDF Notes' | 'Formula Sheet' | 'Assignment' | 'DPP Solution'
  subject_name?: string;
  batch_name?: string;
  created_at: string;
}

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'notes.json');

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
};

const loadFromDisk = (): StudyMaterialItem[] => {
  try {
    ensureDir();
    if (fs.existsSync(STORE_FILE)) return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch {}
  return [
    {
      id: 'mat_1',
      title: 'Complete Formula Handbook — JEE Physics 2026',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'Formula Sheet',
      subject_name: 'Physics',
      batch_name: 'Lakshya JEE 2026',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mat_2',
      title: 'Class 12th Optics & Wave Mechanics Chapter Notes',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'PDF Notes',
      subject_name: 'Physics',
      batch_name: 'Lakshya JEE 2026',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mat_3',
      title: 'NEET Organic Chemistry Reactions & Mechanism Sheet',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'PDF Notes',
      subject_name: 'Chemistry',
      batch_name: 'Yakeen NEET 2026',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mat_4',
      title: 'Class 10th Science Board Exam Special Formula & Diagrams',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'Formula Sheet',
      subject_name: 'Science',
      batch_name: 'Udaan Class 10th',
      created_at: new Date().toISOString(),
    },
  ];
};

const saveToDisk = (items: StudyMaterialItem[]) => {
  try {
    ensureDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('[notesStore] save failed:', e);
  }
};

class NotesStore {
  private notes: StudyMaterialItem[] = loadFromDisk();

  getAll(): StudyMaterialItem[] {
    return [...this.notes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  add(item: Partial<StudyMaterialItem>): StudyMaterialItem {
    const newItem: StudyMaterialItem = {
      id: item.id || `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: item.title || 'Study Note',
      file_url: item.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: item.type || 'PDF Notes',
      subject_name: item.subject_name || 'General',
      batch_name: item.batch_name || 'All Batches',
      created_at: item.created_at || new Date().toISOString(),
    };
    this.notes.unshift(newItem);
    saveToDisk(this.notes);
    return newItem;
  }

  delete(id: string): boolean {
    const lenBefore = this.notes.length;
    this.notes = this.notes.filter(n => n.id !== id);
    if (this.notes.length < lenBefore) {
      saveToDisk(this.notes);
      return true;
    }
    return false;
  }
}

export const notesStore = new NotesStore();
