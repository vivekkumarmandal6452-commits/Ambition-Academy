import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, BookOpen, Search } from 'lucide-react';
import { adminService } from '../../services';
import { Batch, Category } from '../../types';
import { TableSkeleton, EmptyState, Badge, Spinner } from '../../components/ui';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const AdminBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    slug: string;
    description: string;
    target_exam: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    price: number;
    original_price: number;
    status: 'draft' | 'upcoming' | 'active' | 'completed' | 'archived';
    category_id: string;
    is_featured: boolean;
  }>({
    title: '', slug: '', description: '', target_exam: '', level: 'beginner',
    language: 'Hindi + English', price: 0, original_price: 0, status: 'draft',
    category_id: '', is_featured: false,
  });

  useEffect(() => {
    Promise.all([
      adminService.getBatches(),
      adminService.getCategories(),
    ]).then(([batchRes, cats]) => {
      setBatches(batchRes.data || []);
      setCategories(cats || []);
    }).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditBatch(null);
    setForm({ title: '', slug: '', description: '', target_exam: '', level: 'beginner', language: 'Hindi + English', price: 0, original_price: 0, status: 'draft', category_id: '', is_featured: false });
    setShowForm(true);
  };

  const openEdit = (batch: Batch) => {
    setEditBatch(batch);
    setForm({
      title: batch.title, slug: batch.slug, description: batch.description || '',
      target_exam: batch.target_exam || '', level: batch.level, language: batch.language,
      price: batch.price, original_price: batch.original_price || 0, status: batch.status,
      category_id: batch.category_id || '', is_featured: batch.is_featured,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      if (editBatch) {
        const updated = await adminService.updateBatch(editBatch.id, form);
        setBatches(prev => prev.map(b => b.id === editBatch.id ? updated : b));
        toast.success('Batch updated!');
      } else {
        const created = await adminService.createBatch(form);
        setBatches(prev => [created, ...prev]);
        toast.success('Batch created!');
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this batch? This action cannot be undone.')) return;
    try {
      await adminService.deleteBatch(id);
      setBatches(prev => prev.filter(b => b.id !== id));
      toast.success('Batch deleted');
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  return (
    <AdminLayout>
      <div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
              Batch Management
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>{batches.length} batches total</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Create Batch
          </button>
        </div>

        {/* Batch Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px 16px', zIndex: 1000, overflowY: 'auto',
              }}
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%', maxWidth: 640, maxHeight: '85vh',
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--card)', borderRadius: 20, padding: '24px 28px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
                  <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.25rem' }}>
                    {editBatch ? 'Edit Batch' : 'Create New Batch'}
                  </h2>
                  <button onClick={() => setShowForm(false)} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable Form Content */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Batch Title *</label>
                        <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))} className="input-field" placeholder="e.g. Lakshya JEE 2026" required />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Slug *</label>
                        <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="input-field" placeholder="lakshya-jee-2026" required />
                      </div>
                    </div>

                    <div>
                      <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Description</label>
                      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" rows={3} placeholder="Comprehensive batch features, syllabus coverage, and faculty info..." style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Target Exam</label>
                        <input type="text" value={form.target_exam} onChange={e => setForm(p => ({ ...p, target_exam: e.target.value }))} className="input-field" placeholder="JEE Mains + Advanced / NEET" />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Category</label>
                        <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="input-field">
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Level</label>
                        <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value as any }))} className="input-field">
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Price (₹)</label>
                        <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="input-field" min="0" />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Original Price (₹)</label>
                        <input type="number" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: Number(e.target.value) }))} className="input-field" min="0" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Status</label>
                        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="input-field">
                          <option value="active">Active</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="draft">Draft</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                        <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                        <label htmlFor="featured" style={{ color: 'var(--text)', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Featured Batch</label>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer Actions */}
                  <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                    <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: 15 }}>
                      {submitting ? <Spinner size={18} /> : (editBatch ? 'Update Batch' : 'Create Batch')}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : batches.length === 0 ? (
          <EmptyState icon={<BookOpen size={48} />} title="No batches yet" description="Create your first batch to get started." action={<button onClick={openCreate} className="btn-primary"><Plus size={15} /> Create Batch</button>} />
        ) : (
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Batch', 'Exam', 'Level', 'Price', 'Status', 'Students', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, i) => (
                  <motion.tr key={batch.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ background: 'var(--card)' }}
                  >
                    <td className="table-cell">
                      <div>
                        <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>{batch.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>/{batch.slug}</p>
                      </div>
                    </td>
                    <td className="table-cell" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{batch.target_exam || '—'}</td>
                    <td className="table-cell">
                      <span className="badge badge-primary" style={{ fontSize: 10, textTransform: 'capitalize' }}>{batch.level}</span>
                    </td>
                    <td className="table-cell" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                      {batch.price === 0 ? <span style={{ color: '#10B981' }}>FREE</span> : `₹${batch.price.toLocaleString('en-IN')}`}
                    </td>
                    <td className="table-cell">
                      <span className={`badge badge-${batch.status === 'active' ? 'success' : batch.status === 'draft' ? 'warning' : 'primary'}`} style={{ fontSize: 10, textTransform: 'capitalize' }}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="table-cell" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {batch.enrolled_count?.toLocaleString() || 0}
                    </td>
                    <td className="table-cell">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(batch)} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(batch.id)} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBatchesPage;
