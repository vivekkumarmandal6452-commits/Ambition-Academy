import fs from 'fs';
import path from 'path';

export interface ClassItem {
  id: string;
  title: string;
  description?: string;
  meeting_url: string;
  recording_url?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  batch_id?: string;
  batch_name?: string;
  subject_name?: string;
  instructor_name?: string;
  platform?: 'youtube' | 'zoom' | 'gmeet' | 'other';
  thumbnail_url?: string;
  created_at: string;
}

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'classes.json');

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
};

const loadFromDisk = (): ClassItem[] => {
  try {
    ensureDir();
    if (fs.existsSync(STORE_FILE)) return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch {}
  return [];
};

const saveToDisk = (items: ClassItem[]) => {
  try {
    ensureDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('[classStore] save failed:', e);
  }
};

class ClassStore {
  private classes: ClassItem[] = loadFromDisk();

  getAll(filter?: { status?: string; batch_id?: string }): ClassItem[] {
    let items = [...this.classes].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
    if (filter?.status) items = items.filter(c => c.status === filter.status);
    if (filter?.batch_id) items = items.filter(c => c.batch_id === filter.batch_id);
    return items;
  }

  getById(id: string): ClassItem | undefined {
    return this.classes.find(c => c.id === id);
  }

  add(item: Partial<ClassItem>): ClassItem {
    const newItem: ClassItem = {
      id: item.id || `cls_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: item.title || 'Live Class',
      description: item.description || '',
      meeting_url: item.meeting_url || '',
      recording_url: item.recording_url,
      scheduled_at: item.scheduled_at || new Date().toISOString(),
      duration_minutes: item.duration_minutes || 60,
      status: item.status || 'scheduled',
      batch_id: item.batch_id,
      batch_name: item.batch_name || 'All Batches',
      subject_name: item.subject_name || 'General',
      instructor_name: item.instructor_name || 'Faculty',
      platform: item.platform || 'youtube',
      thumbnail_url: item.thumbnail_url,
      created_at: item.created_at || new Date().toISOString(),
    };
    this.classes.unshift(newItem);
    saveToDisk(this.classes);
    return newItem;
  }

  update(id: string, updates: Partial<ClassItem>): ClassItem | null {
    const idx = this.classes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.classes[idx] = { ...this.classes[idx], ...updates };
    saveToDisk(this.classes);
    return this.classes[idx];
  }

  delete(id: string): boolean {
    const before = this.classes.length;
    this.classes = this.classes.filter(c => c.id !== id);
    if (this.classes.length < before) { saveToDisk(this.classes); return true; }
    return false;
  }

  autoUpdateStatuses() {
    const now = new Date();
    let changed = false;
    this.classes = this.classes.map(c => {
      if (c.status === 'live') {
        const endTime = new Date(new Date(c.scheduled_at).getTime() + c.duration_minutes * 60000);
        if (now > endTime) { changed = true; return { ...c, status: 'completed' }; }
      }
      return c;
    });
    if (changed) saveToDisk(this.classes);
  }
}

export const classStore = new ClassStore();
