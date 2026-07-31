import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Image as ImageIcon, ExternalLink } from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  description?: string;
  created_at: string;
}

const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    image_url: '',
    category: 'Classroom',
    description: '',
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data } = await api.get('/api/gallery');
      if (data.success) {
        setItems(data.data || []);
      }
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      toast.error('Title and Image URL are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/gallery/admin', form);
      if (res.data.success) {
        setItems(prev => [res.data.data, ...prev]);
        toast.success('Photo added to gallery!');
        setForm({ title: '', image_url: '', category: 'Classroom', description: '' });
        setShowModal(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Delete this photo from gallery?')) return;
    try {
      await api.delete(`/api/gallery/admin/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Photo deleted');
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}>
        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
              Gallery Photo Manager
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Upload campus, classroom, and event photos for the website gallery</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Upload Photo
          </button>
        </div>

        {/* Add Photo Modal */}
        <AnimatePresence>
          {showModal && (
            <div
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px 16px', zIndex: 1000, overflowY: 'auto',
              }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%', maxWidth: 540, maxHeight: '85vh',
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--card)', borderRadius: 20, padding: '24px 28px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem' }}>
                    Upload New Gallery Photo
                  </h2>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddPhoto} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Photo Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Physics Problem Solving Session"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Image URL *</label>
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                      className="input-field"
                      placeholder="https://images.unsplash.com/..."
                      required
                    />
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Classroom">Classroom</option>
                      <option value="Events">Events & Felicitations</option>
                      <option value="Campus">Campus & Labs</option>
                      <option value="Workshops">Workshops & Seminars</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      className="input-field"
                      rows={3}
                      placeholder="Brief description of the photo..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      {submitting ? <Spinner size={18} /> : 'Add Photo'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <ImageIcon size={44} style={{ color: 'var(--text-faint)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>No gallery photos uploaded yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} /> Upload First Photo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {items.map(item => (
              <div key={item.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
                  }}>
                    {item.category}
                  </span>
                </div>

                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 12 }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <a href={item.image_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Preview <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => handleDeletePhoto(item.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGalleryPage;
