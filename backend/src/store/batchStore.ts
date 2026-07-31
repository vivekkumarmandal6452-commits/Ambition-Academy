import fs from 'fs';
import path from 'path';

export interface BatchItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  target_exam: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  original_price: number;
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'archived';
  category_id?: string;
  is_featured: boolean;
  enrolled_count: number;
  created_at: string;
  thumbnail_url?: string;
  categories?: { name: string; slug?: string };
}

// ── Persistence via JSON file ──────────────────────────────
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'batches.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const loadFromDisk = (): BatchItem[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw) as BatchItem[];
    }
  } catch {
    // If file is corrupt, fall back to defaults
  }
  return [...defaultBatches];
};

const saveToDisk = (batches: BatchItem[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(batches, null, 2), 'utf-8');
  } catch (e) {
    console.error('[batchStore] Failed to persist batches:', e);
  }
};

// ── Default demo batches (only used on first run) ─────────
const defaultBatches: BatchItem[] = [
  {
    id: 'batch_lakshya_2026',
    title: 'Lakshya JEE 2026 (Class 12th + JEE Main & Advanced)',
    slug: 'lakshya-jee-2026',
    description: 'Complete syllabus coverage for JEE Main & Advanced 2026 with daily live classes, DPPs, chapterwise tests, and 24/7 doubt resolution by Kota faculty.',
    target_exam: 'JEE Main & Advanced 2026',
    level: 'advanced',
    language: 'Hinglish (Hindi + English)',
    price: 4499,
    original_price: 8999,
    status: 'active',
    is_featured: true,
    enrolled_count: 1420,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    categories: { name: 'JEE' },
  },
  {
    id: 'batch_yakeen_2026',
    title: 'Yakeen NEET 2026 (Droppers / Class 12th Intensive)',
    slug: 'yakeen-neet-2026',
    description: 'Top-ranked NEET preparation batch focused on NCERT deep-dives, Biology mindmaps, Physics problem tricks, and weekly AIIMS mock tests.',
    target_exam: 'NEET UG 2026',
    level: 'intermediate',
    language: 'Hinglish',
    price: 3999,
    original_price: 7999,
    status: 'active',
    is_featured: true,
    enrolled_count: 2180,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    categories: { name: 'NEET' },
  },
  {
    id: 'batch_udaan_10th',
    title: 'Udaan Class 10th Board + NTSE Foundation 2026',
    slug: 'udaan-class-10th-2026',
    description: 'Strong foundation for CBSE/State Board 10th exam with Olympiad & NTSE level problem solving in Physics, Chemistry, Maths & Biology.',
    target_exam: 'Class 10th Boards & NTSE',
    level: 'beginner',
    language: 'Hindi + English',
    price: 2499,
    original_price: 4999,
    status: 'active',
    is_featured: false,
    enrolled_count: 850,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    categories: { name: 'Foundation' },
  },
];

class BatchStore {
  private batches: BatchItem[] = loadFromDisk();

  getAll(): BatchItem[] {
    return this.batches;
  }

  getBySlug(slug: string | string[]): BatchItem | undefined {
    const s = Array.isArray(slug) ? slug[0] : slug;
    return this.batches.find(b => b.slug === s || b.id === s);
  }

  getById(id: string | string[]): BatchItem | undefined {
    const i = Array.isArray(id) ? id[0] : id;
    return this.batches.find(b => b.id === i);
  }

  add(item: Partial<BatchItem>): BatchItem {
    const title = item.title || 'Untitled Batch';
    const newBatch: BatchItem = {
      id: item.id || `batch_${Date.now()}`,
      title,
      slug: item.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: item.description || '',
      target_exam: item.target_exam || 'All Competitive Exams',
      level: item.level || 'intermediate',
      language: item.language || 'Hindi + English',
      price: Number(item.price) || 0,
      original_price: Number(item.original_price) || 0,
      status: item.status || 'active',
      category_id: item.category_id,
      is_featured: !!item.is_featured,
      enrolled_count: 0,
      created_at: new Date().toISOString(),
      thumbnail_url: item.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      categories: { name: item.target_exam || 'General' },
    };

    // Check for duplicate
    const existingIdx = this.batches.findIndex(b => b.id === newBatch.id || b.slug === newBatch.slug);
    if (existingIdx !== -1) {
      this.batches[existingIdx] = { ...this.batches[existingIdx], ...newBatch };
    } else {
      this.batches.unshift(newBatch);
    }

    saveToDisk(this.batches);
    return newBatch;
  }

  update(id: string | string[], updates: Partial<BatchItem>): BatchItem | undefined {
    const targetId = Array.isArray(id) ? id[0] : id;
    const index = this.batches.findIndex(b => b.id === targetId);
    if (index !== -1) {
      this.batches[index] = { ...this.batches[index], ...updates };
      saveToDisk(this.batches);
      return this.batches[index];
    }
    return undefined;
  }

  delete(id: string | string[]): boolean {
    const targetId = Array.isArray(id) ? id[0] : id;
    const initialLen = this.batches.length;
    this.batches = this.batches.filter(b => b.id !== targetId);
    if (this.batches.length < initialLen) {
      saveToDisk(this.batches);
      return true;
    }
    return false;
  }

  incrementEnrolledCount(id: string): void {
    const batch = this.batches.find(b => b.id === id);
    if (batch) {
      batch.enrolled_count = (batch.enrolled_count || 0) + 1;
      saveToDisk(this.batches);
    }
  }
}

export const batchStore = new BatchStore();
