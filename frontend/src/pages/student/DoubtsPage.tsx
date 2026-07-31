import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Plus, X, Send } from 'lucide-react';
import { doubtService } from '../../services';
import { Doubt } from '../../types';
import { TableSkeleton, EmptyState, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const DoubtsPage: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    doubtService.getAll().then(res => setDoubts(res.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Please fill in all fields'); return; }
    setSubmitting(true);
    try {
      const newDoubt = await doubtService.create(form);
      setDoubts(prev => [newDoubt, ...prev]);
      setForm({ title: '', description: '' });
      setShowForm(false);
      toast.success('Doubt submitted successfully!');
    } catch {
      toast.error('Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = { pending: '#F59E0B', answered: '#3B82F6', resolved: '#10B981' };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
            My Doubts
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Ask questions and get help from instructors.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Ask Doubt</>}
        </button>
      </div>

      {/* Ask Doubt Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16 }}>Ask a New Doubt</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What's your question about?"
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your doubt in detail..."
                className="input-field"
                rows={4}
                style={{ resize: 'vertical' }}
                required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
              <Send size={15} /> Submit Doubt
            </button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <TableSkeleton rows={4} />
      ) : doubts.length === 0 ? (
        <EmptyState
          icon={<HelpCircle size={48} />}
          title="No doubts yet"
          description="Ask your first doubt and get help from our expert faculty!"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {doubts.map((doubt, i) => (
            <motion.div key={doubt.id} className="card" style={{ padding: '18px 20px' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem', flex: 1, marginRight: 12 }}>{doubt.title}</h3>
                <span className="badge" style={{
                  background: `${statusColors[doubt.status]}22`,
                  color: statusColors[doubt.status],
                  border: `1px solid ${statusColors[doubt.status]}44`,
                  textTransform: 'capitalize', flexShrink: 0,
                }}>
                  {doubt.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{doubt.description}</p>
              <p style={{ color: 'var(--text-faint)', fontSize: 12 }}>{new Date(doubt.created_at).toLocaleDateString('en-IN')}</p>

              {doubt.doubt_answers && doubt.doubt_answers.length > 0 && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                  <p style={{ color: '#10B981', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>✓ Instructor Answer</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{doubt.doubt_answers[0].answer_text}</p>
                  <p style={{ color: 'var(--text-faint)', fontSize: 11, marginTop: 6 }}>
                    By {doubt.doubt_answers[0].profiles?.name} • {new Date(doubt.doubt_answers[0].created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoubtsPage;
