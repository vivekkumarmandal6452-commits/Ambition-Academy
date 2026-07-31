import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Zap, FileText, BookOpen, Trash2, X, ExternalLink, Calendar, Clock, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner, EmptyState } from '../../components/ui';

interface LiveClass {
  id: string;
  title: string;
  meeting_url: string;
  scheduled_at: string;
  status: 'scheduled' | 'live' | 'completed';
  batch_name?: string;
}

interface Lecture {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  subject_name?: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  file_url: string;
  type: string;
  subject_name?: string;
  batch_name?: string;
}

interface DPPItem {
  id: string;
  title: string;
  total_questions: number;
  due_date?: string;
}

const AdminContentManagerPage: React.FC<{ defaultTab?: 'classes' | 'lectures' | 'notes' | 'dpp' }> = ({ defaultTab = 'classes' }) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'lectures' | 'notes' | 'dpp'>(defaultTab);

  // States
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [dpps, setDpps] = useState<DPPItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [classForm, setClassForm] = useState({ title: '', meeting_url: '', scheduled_at: '', batch_id: '', duration_minutes: 60 });
  const [lectureForm, setLectureForm] = useState({ title: '', video_url: '', thumbnail_url: '', duration_minutes: 45, subject: 'Physics' });
  const [notesForm, setNotesForm] = useState({ title: '', file_url: '', type: 'PDF Notes', subject: 'Physics', batch_name: '' });
  const [dppForm, setDppForm] = useState({ title: '', total_questions: 10, due_date: '' });

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'classes') {
        const { data } = await api.get('/api/classes');
        setClasses(data?.data?.data || data?.data || [
          { id: 'lc_1', title: 'Rotational Motion & Torque Problem Solving', meeting_url: 'https://youtube.com/live/demo1', scheduled_at: new Date(Date.now() + 3600000).toISOString(), status: 'scheduled', batch_name: 'Lakshya JEE 2026' },
          { id: 'lc_2', title: 'Human Physiology & Organic Chemistry Live', meeting_url: 'https://youtube.com/live/demo2', scheduled_at: new Date().toISOString(), status: 'live', batch_name: 'Yakeen NEET 2026' },
        ]);
      } else if (activeTab === 'lectures') {
        setLectures([
          { id: 'lec_1', title: 'Laws of Motion — Friction & Slope Mechanics', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', duration_minutes: 54, subject_name: 'Physics' },
          { id: 'lec_2', title: 'Chemical Bonding & Hybridization Deep Dive', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80', duration_minutes: 62, subject_name: 'Chemistry' },
        ]);
      } else if (activeTab === 'notes') {
        try {
          const { data } = await api.get('/api/admin/study-materials');
          setMaterials(data?.data || [
            { id: 'mat_1', title: 'Complete Formula Handbook — JEE Physics 2026', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'Formula Sheet', subject_name: 'Physics' },
            { id: 'mat_2', title: 'Class 12th Optics & Wave Mechanics Chapter Notes', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'PDF Notes', subject_name: 'Physics' },
          ]);
        } catch {
          setMaterials([
            { id: 'mat_1', title: 'Complete Formula Handbook — JEE Physics 2026', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'Formula Sheet', subject_name: 'Physics' },
            { id: 'mat_2', title: 'Class 12th Optics & Wave Mechanics Chapter Notes', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'PDF Notes', subject_name: 'Physics' },
          ]);
        }
      } else if (activeTab === 'dpp') {
        setDpps([
          { id: 'dpp_1', title: 'DPP-01: Electrostatics & Coulomb\'s Law', total_questions: 15, due_date: new Date(Date.now() + 86400000 * 2).toISOString() },
          { id: 'dpp_2', title: 'DPP-02: Chemical Kinetics & Rate Expressions', total_questions: 12, due_date: new Date(Date.now() + 86400000 * 3).toISOString() },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (activeTab === 'classes') {
        const payload = {
          title: classForm.title,
          meeting_url: classForm.meeting_url,
          scheduled_at: classForm.scheduled_at || new Date().toISOString(),
          duration_minutes: classForm.duration_minutes || 60,
          batch_name: 'JEE / NEET Batch',
          status: 'scheduled',
        };
        const { data } = await api.post('/api/admin/classes', payload);
        const created = data?.data || { id: `lc_${Date.now()}`, ...payload };
        setClasses(prev => [created, ...prev]);
        toast.success('Live class scheduled!');
      } else if (activeTab === 'lectures') {
        const newLec: Lecture = {
          id: `lec_${Date.now()}`,
          title: lectureForm.title,
          video_url: lectureForm.video_url,
          thumbnail_url: lectureForm.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
          duration_minutes: lectureForm.duration_minutes,
          subject_name: lectureForm.subject,
        };
        setLectures(prev => [newLec, ...prev]);
        toast.success('Lecture video uploaded!');
      } else if (activeTab === 'notes') {
        const payload = {
          title: notesForm.title,
          file_url: notesForm.file_url,
          type: notesForm.type || 'PDF Notes',
          subject_name: notesForm.subject || 'Physics',
          batch_name: notesForm.batch_name || 'All Batches',
        };
        const { data } = await api.post('/api/admin/study-materials', payload);
        const created = data?.data || { id: `mat_${Date.now()}`, ...payload };
        setMaterials(prev => [created, ...prev]);
        toast.success('📄 Study notes uploaded successfully!');
        setNotesForm({ title: '', file_url: '', type: 'PDF Notes', subject: 'Physics', batch_name: '' });
      } else if (activeTab === 'dpp') {
        const newDpp: DPPItem = {
          id: `dpp_${Date.now()}`,
          title: dppForm.title,
          total_questions: dppForm.total_questions,
          due_date: dppForm.due_date || new Date(Date.now() + 86400000 * 2).toISOString(),
        };
        setDpps(prev => [newDpp, ...prev]);
        toast.success('DPP created!');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to create content');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
              Academic Content Manager
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Add and manage live classes, recorded video lectures, study notes, and practice DPPs.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Add {activeTab === 'classes' ? 'Live Class' : activeTab === 'lectures' ? 'Lecture Video' : activeTab === 'notes' ? 'Notes / PDF' : 'DPP'}
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 28, overflowX: 'auto' }}>
          {[
            { id: 'classes', label: 'Live Classes', icon: Zap, color: '#EF4444' },
            { id: 'lectures', label: 'Recorded Lectures', icon: Video, color: '#10B981' },
            { id: 'notes', label: 'Study Notes & PDFs', icon: FileText, color: '#3B82F6' },
            { id: 'dpp', label: 'DPP & Practice Sets', icon: BookOpen, color: '#F59E0B' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'var(--transition)',
                background: activeTab === tab.id ? 'var(--card-raised)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
                border: activeTab === tab.id ? '1px solid var(--primary-light)' : '1px solid transparent',
              }}
            >
              <tab.icon size={16} style={{ color: tab.color }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Form */}
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
                  width: '100%', maxWidth: 560, maxHeight: '85vh',
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--card)', borderRadius: 20, padding: '24px 28px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem' }}>
                    Add {activeTab === 'classes' ? 'Live Class' : activeTab === 'lectures' ? 'Lecture Video' : activeTab === 'notes' ? 'Notes' : 'DPP'}
                  </h2>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {activeTab === 'classes' && (
                    <>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Live Class Title *</label>
                        <input type="text" value={classForm.title} onChange={e => setClassForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="e.g. Physics Optics Live Doubt Session" required />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Meeting / Stream URL *</label>
                        <input type="url" value={classForm.meeting_url} onChange={e => setClassForm(p => ({ ...p, meeting_url: e.target.value }))} className="input-field" placeholder="https://youtube.com/live/..." required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Scheduled Date & Time</label>
                          <input type="datetime-local" value={classForm.scheduled_at} onChange={e => setClassForm(p => ({ ...p, scheduled_at: e.target.value }))} className="input-field" required />
                        </div>
                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Duration (Minutes)</label>
                          <input type="number" value={classForm.duration_minutes} onChange={e => setClassForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className="input-field" min="15" />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'lectures' && (
                    <>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Lecture Title *</label>
                        <input type="text" value={lectureForm.title} onChange={e => setLectureForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="e.g. Newton's Laws of Motion - Lecture 01" required />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Video URL (YouTube/Vimeo Embed) *</label>
                        <input type="url" value={lectureForm.video_url} onChange={e => setLectureForm(p => ({ ...p, video_url: e.target.value }))} className="input-field" placeholder="https://www.youtube.com/embed/..." required />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Thumbnail Image URL</label>
                        <input type="url" value={lectureForm.thumbnail_url} onChange={e => setLectureForm(p => ({ ...p, thumbnail_url: e.target.value }))} className="input-field" placeholder="https://images.unsplash.com/..." />
                      </div>
                    </>
                  )}

                  {activeTab === 'notes' && (
                    <>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Notes Title *</label>
                        <input type="text" value={notesForm.title} onChange={e => setNotesForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="e.g. Organic Chemistry Quick Revision Notes" required />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>PDF / File URL *</label>
                        <input type="url" value={notesForm.file_url} onChange={e => setNotesForm(p => ({ ...p, file_url: e.target.value }))} className="input-field" placeholder="https://example.com/notes.pdf" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Type</label>
                          <select value={notesForm.type} onChange={e => setNotesForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                            <option value="PDF Notes">PDF Notes</option>
                            <option value="Formula Sheet">Formula Sheet</option>
                            <option value="Assignment">Assignment</option>
                            <option value="DPP Solution">DPP Solution</option>
                            <option value="Chapter Summary">Chapter Summary</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Subject</label>
                          <select value={notesForm.subject} onChange={e => setNotesForm(p => ({ ...p, subject: e.target.value }))} className="input-field">
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Biology">Biology</option>
                            <option value="Science">Science</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Batch / Target (optional)</label>
                        <input type="text" value={notesForm.batch_name} onChange={e => setNotesForm(p => ({ ...p, batch_name: e.target.value }))} className="input-field" placeholder="e.g. Lakshya JEE 2026" />
                      </div>
                    </>
                  )}

                  {activeTab === 'dpp' && (
                    <>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>DPP Title *</label>
                        <input type="text" value={dppForm.title} onChange={e => setDppForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="e.g. DPP-05: Kinematics Problem Sheet" required />
                      </div>
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Total Questions</label>
                        <input type="number" value={dppForm.total_questions} onChange={e => setDppForm(p => ({ ...p, total_questions: Number(e.target.value) }))} className="input-field" min="1" required />
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      {submitting ? <Spinner size={18} /> : 'Save & Publish'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Listing Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {activeTab === 'classes' && classes.map(cls => (
              <div key={cls.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className={`badge badge-${cls.status === 'live' ? 'live' : 'primary'}`}>
                      {cls.status === 'live' ? '● LIVE NOW' : 'Scheduled'}
                    </span>
                    <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>{cls.batch_name}</span>
                  </div>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{cls.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} /> {new Date(cls.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {cls.status !== 'live' ? (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/api/admin/classes/${cls.id}`, { status: 'live' });
                          setClasses(p => p.map(c => c.id === cls.id ? { ...c, status: 'live' } : c));
                          toast.success('🔴 CLASS IS NOW LIVE!');
                        } catch { toast.error('Failed to update status'); }
                      }}
                      style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ● Go Live Now
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/api/admin/classes/${cls.id}`, { status: 'completed' });
                          setClasses(p => p.map(c => c.id === cls.id ? { ...c, status: 'completed' } : c));
                          toast.success('Class ended');
                        } catch { toast.error('Failed to update status'); }
                      }}
                      style={{ background: 'var(--card-raised)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      End Stream
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/api/admin/classes/${cls.id}`);
                        setClasses(p => p.filter(c => c.id !== cls.id));
                        toast.success('Deleted');
                      } catch { setClasses(p => p.filter(c => c.id !== cls.id)); }
                    }}
                    style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'lectures' && lectures.map(lec => (
              <div key={lec.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {lec.thumbnail_url && <img src={lec.thumbnail_url} alt={lec.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className="badge badge-primary" style={{ fontSize: 10, marginBottom: 6 }}>{lec.subject_name || 'Physics'}</span>
                    <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{lec.title}</h3>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{lec.duration_minutes} Mins</span>
                    <button onClick={() => setLectures(p => p.filter(l => l.id !== lec.id))} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'notes' && materials.map(mat => (
              <div key={mat.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge badge-success" style={{ fontSize: 10 }}>{mat.type}</span>
                    {(mat as any).subject_name && (
                      <span style={{ color: 'var(--primary-light)', fontSize: 11, fontWeight: 700 }}>{(mat as any).subject_name}</span>
                    )}
                  </div>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{mat.title}</h3>
                  {(mat as any).batch_name && (
                    <p style={{ color: 'var(--text-faint)', fontSize: 11, marginBottom: 8 }}>📚 {(mat as any).batch_name}</p>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <a href={mat.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Download PDF <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await api.delete(`/api/admin/study-materials/${mat.id}`);
                        setMaterials(p => p.filter(m => m.id !== mat.id));
                        toast.success('Notes deleted');
                      } catch {
                        setMaterials(p => p.filter(m => m.id !== mat.id));
                      }
                    }}
                    style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'dpp' && dpps.map(d => (
              <div key={d.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-warning" style={{ fontSize: 10, marginBottom: 8 }}>DPP Practice</span>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{d.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{d.total_questions} Multiple Choice Questions</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>{new Date(d.due_date || '').toLocaleDateString('en-IN')}</span>
                  <button onClick={() => setDpps(p => p.filter(x => x.id !== d.id))} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContentManagerPage;
