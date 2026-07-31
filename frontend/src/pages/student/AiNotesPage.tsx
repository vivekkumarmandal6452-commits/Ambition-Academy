import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Sparkles, RefreshCw, Trash2, BookOpen, ChevronDown, ChevronUp,
  Download, Plus
} from 'lucide-react';
import { aiService, AINote } from '../../services/aiService';
import { EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const AiNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<AINote[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'AI Notes Generator | Ambition Academy';
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await aiService.getNotes();
      setNotes(data || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Please enter a topic title'); return; }
    setGenerating(true);
    try {
      const newNote = await aiService.generateNotes({ title, content: content || undefined });
      setNotes(prev => [newNote, ...prev]);
      setTitle('');
      setContent('');
      setExpandedId(newNote.id);
      toast.success('📄 AI Notes generated and saved!');
    } catch {
      toast.error('Failed to generate notes');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await aiService.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 8 }}>
          <FileText size={14} color="#10B981" />
          <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>AI NOTES GENERATOR</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
          Smart Revision Notes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI generates structured summaries, key points, formulas, examples, and common mistakes from any topic.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
        {/* Generator Form */}
        <div className="card" style={{ padding: 24, height: 'fit-content' }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} color="var(--primary-light)" /> Generate New Notes
          </h3>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Topic / Chapter Name *</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="input-field" placeholder="e.g. Laws of Motion, Organic Chemistry - SN2 Reactions"
                required
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Additional Context (optional)</label>
              <textarea
                value={content} onChange={e => setContent(e.target.value)}
                className="input-field" placeholder="Paste lecture notes, any specific content or syllabus areas to focus on..."
                rows={4} style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" disabled={generating} className="btn-primary" style={{ padding: '13px', justifyContent: 'center' }}>
              {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating AI Notes...</> : <><Sparkles size={16} /> Generate Smart Notes</>}
            </button>
          </form>
        </div>

        {/* Notes Library */}
        <div>
          <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>
            📚 My Saved AI Notes ({notes.length})
          </h3>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <EmptyState icon={<FileText size={40} />} title="No AI Notes yet" description="Enter a topic above to generate your first smart revision notes." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {notes.map((note, i) => (
                <motion.div
                  key={note.id} className="card"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ padding: '18px 20px', borderLeft: '4px solid #10B981' }}
                >
                  {/* Note Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <BookOpen size={18} color="#10B981" />
                      <div>
                        <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15 }}>{note.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                          {new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} style={{ background: 'none', border: 'none', color: '#EF4444', opacity: 0.7, cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={15} />
                      </button>
                      {expandedId === note.id ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded Note Content */}
                  {expandedId === note.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {note.summary && (
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 12, marginBottom: 6, textTransform: 'uppercase' }}>📋 Summary</p>
                          <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.7 }}>{note.summary}</p>
                        </div>
                      )}

                      {note.key_points?.length > 0 && (
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>🔑 Key Points</p>
                          <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {note.key_points.map((kp, idx) => <li key={idx} style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{kp}</li>)}
                          </ul>
                        </div>
                      )}

                      {note.formulas && note.formulas.length > 0 && (
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>⚗️ Important Formulas</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {note.formulas.map((f, idx) => (
                              <span key={idx} style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 13, color: 'var(--primary-light)', fontFamily: 'monospace' }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.important_concepts?.length > 0 && (
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>💡 Important Concepts</p>
                          <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {note.important_concepts.map((c, idx) => <li key={idx} style={{ color: 'var(--text)', fontSize: 13 }}>{c}</li>)}
                          </ul>
                        </div>
                      )}

                      {(note.common_mistakes ?? []).length > 0 && (
                        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>⚠️ Common Mistakes to Avoid</p>
                          <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {(note.common_mistakes ?? []).map((m, idx) => <li key={idx} style={{ color: 'var(--text)', fontSize: 13 }}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiNotesPage;
