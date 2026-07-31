import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';
import fs from 'fs';
import path from 'path';

// ── Persistence ──────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../../data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string;
  created_at: string;
}

const defaultGallery: GalleryItem[] = [
  {
    id: 'gal_1',
    title: 'Interactive Live Classroom',
    category: 'Classroom',
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    description: 'Students participating in live interactive physics problem-solving session.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'gal_2',
    title: 'Annual Rankers Felicitations',
    category: 'Events',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Honoring top JEE Advanced & NEET rankers at our main campus.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'gal_3',
    title: 'Advanced Science Laboratory',
    category: 'Campus',
    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    description: 'State-of-the-art physics & chemistry experimental setup.',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'gal_4',
    title: 'Master Class & Seminar',
    category: 'Workshops',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    description: 'Special exam strategy workshop with senior IIT alumni faculty.',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const loadGallery = (): GalleryItem[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(GALLERY_FILE)) {
      const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
      return JSON.parse(raw) as GalleryItem[];
    }
  } catch {}
  return [...defaultGallery];
};

const saveGallery = (items: GalleryItem[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('[galleryController] Failed to persist gallery:', e);
  }
};

let localGalleryStore = loadGallery();

// GET /api/gallery — public list of gallery photos
export const getGalleryItems = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Merge DB + local gallery avoiding duplicates
      const dbIds = new Set(data.map((d: any) => d.id));
      const localExtras = localGalleryStore.filter(item => !dbIds.has(item.id));
      sendSuccess(res, [...data, ...localExtras]);
      return;
    }

    sendSuccess(res, localGalleryStore);
  } catch {
    sendSuccess(res, localGalleryStore);
  }
};

// POST /api/admin/gallery — add new photo (admin only)
export const addGalleryItem = async (req: Request, res: Response) => {
  try {
    const { title, image_url, category = 'General', description = '' } = req.body;

    if (!title || !image_url) {
      sendError(res, 'Title and image URL are required', 400);
      return;
    }

    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      title,
      image_url,
      category,
      description,
      created_at: new Date().toISOString(),
    };

    // Try Supabase insert
    try {
      const { data, error } = await supabaseAdmin
        .from('gallery')
        .insert(newItem)
        .select()
        .single();

      if (!error && data) {
        // Also add to local store so it survives if DB fails next time
        localGalleryStore.unshift(newItem);
        saveGallery(localGalleryStore);
        sendSuccess(res, data, 'Photo added to gallery', 201);
        return;
      }
    } catch {}

    // Fallback: save to local store + persist
    localGalleryStore.unshift(newItem);
    saveGallery(localGalleryStore);
    sendSuccess(res, newItem, 'Photo added to gallery', 201);
  } catch (err: any) {
    sendError(res, err?.message || 'Failed to add photo', 500);
  }
};

// DELETE /api/admin/gallery/:id — delete photo (admin only)
export const deleteGalleryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
      await supabaseAdmin.from('gallery').delete().eq('id', id);
    } catch {}

    localGalleryStore = localGalleryStore.filter(item => item.id !== id);
    saveGallery(localGalleryStore);
    sendSuccess(res, { id }, 'Photo deleted from gallery');
  } catch {
    sendError(res, 'Failed to delete photo', 500);
  }
};
