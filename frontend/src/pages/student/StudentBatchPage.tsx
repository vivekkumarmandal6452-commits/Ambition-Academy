import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowLeft, Play, Zap, FileText, Clock, Calendar,
  CheckCircle, Users, Award, Video, Download, Radio, ChevronRight, Star
} from 'lucide-react';
import { batchService, classService } from '../../services';
import api from '../../services/api';
import { Batch, LiveClass } from '../../types';
import { Skeleton, Badge, Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const StudentBatchPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'notes'>('overview');

  useEffect(() => {
    if (batchId) loadAll();
  }, [batchId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Load batch by ID
      const batchData = await batchService.getById(batchId!);
      setBatch(batchData);
      if (batchData?.title) document.title = `${batchData.title} | Ambition Academy`;

      // Load classes for this batch
      const classRes = await classService.getAll({ batch_id: batchId } as any);
      setClasses(classRes?.data || []);

      // Load study notes
      const notesRes = await api.get('/api/admin/study-materials');
      setNotes(notesRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
        <Skeleton style={{ height: 240, borderRadius: 16, marginBottom: 24 }} />
        <Skeleton style={{ height: 40, width: '60%', marginBottom: 16 }} />
        <Skeleton style={{ height: 20, width: '80%', marginBottom: 8 }} />
        <Skeleton style={{ height: 20, width: '70%' }} />
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Batch not found"
          description="This batch doesn't exist or you don't have access to it."
          action={<Link to="/student/batches" className="btn-primary">← Back to My Batches</Link>}
        />
      </div>
    );
  }

  const liveClasses = classes.filter(c => c.status === 'live');
  const upcomingClasses = classes.filter(c => c.status === 'scheduled');
  const completedClasses = classes.filter(c => c.status === 'completed');

  const tabs = [
    { id: 'overview', label: '📋 Overview', icon: BookOpen },
    { id: 'classes', label: `🔴 Live Classes (${classes.length})`, icon: Zap },
    { id: 'notes', label: `📄 Study Material (${notes.length})`, icon: FileText },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/batches')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 20, fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> Back to My Batches
      </button>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: batch.thumbnail_url
            ? `linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.7)), url(${batch.thumbnail_url}) center/cover`
            : 'var(--grad-primary)',
          borderRadius: 20,
          padding: '36px 40px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        {/* ENROLLED Badge */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <span style={{ background: '#10B981', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>
            ✓ ENROLLED
          </span>
          {batch.target_exam && (
            <span style={{ background: 'rgba(124,58,237,0.9)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
              {batch.target_exam}
            </span>
          )}
          <span style={{ background: `${batch.price === 0 ? '#10B981' : '#F59E0B'}22`, color: batch.price === 0 ? '#10B981' : '#F59E0B', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, border: `1px solid ${batch.price === 0 ? '#10B981' : '#F59E0B'}44` }}>
            {batch.price === 0 ? 'FREE BATCH' : `₹${batch.price.toLocaleString('en-IN')}`}
          </span>
        </div>

        <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 10, lineHeight: 1.3 }}>
          {batch.title}
        </h1>

        {batch.description && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, maxWidth: 700 }}>
            {batch.description}
          </p>
        )}

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            { icon: Video, label: `${batch.total_lectures || 0} Lectures` },
            { icon: Users, label: `${(batch.enrolled_count || 0).toLocaleString('en-IN')} Students` },
            { icon: Clock, label: `${batch.total_duration_hours || 0}+ Hours` },
            { icon: Star, label: batch.level ? (batch.level.charAt(0).toUpperCase() + batch.level.slice(1)) : 'Beginner' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              <stat.icon size={14} />
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--primary)' : 'var(--card)',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
              whiteSpace: 'nowrap', transition: 'var(--transition)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {/* Live Now Card */}
          {liveClasses.length > 0 && (
            <div
              className="card"
              style={{ padding: 24, border: '2px solid #EF4444', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', gridColumn: '1 / -1' }}
              onClick={() => setActiveTab('classes')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} className="animate-ping" />
                <span style={{ color: '#EF4444', fontWeight: 800, fontSize: 13 }}>🔴 CLASS LIVE RIGHT NOW</span>
              </div>
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>{liveClasses[0].title}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, marginBottom: 16 }}>Click to join the live classroom</p>
              <button onClick={() => setActiveTab('classes')} className="btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444' }}>
                <Zap size={14} /> Join Live Now
              </button>
            </div>
          )}

          {/* Stats Cards */}
          {[
            { label: 'Live & Upcoming Classes', value: liveClasses.length + upcomingClasses.length, icon: Radio, color: '#EF4444' },
            { label: 'Recorded Sessions', value: completedClasses.length, icon: Video, color: '#10B981' },
            { label: 'Study Materials', value: notes.length, icon: FileText, color: '#3B82F6' },
            { label: 'Total Lectures', value: batch.total_lectures || 0, icon: BookOpen, color: '#7C3AED' },
          ].map(stat => (
            <motion.div key={stat.label} className="card" style={{ padding: 24 }} whileHover={{ y: -2 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <stat.icon size={22} style={{ color: stat.color }} />
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{stat.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{stat.label}</p>
            </motion.div>
          ))}

          {/* Quick Links */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16 }}>Quick Access</h3>
            {[
              { label: 'Go to Live Classes', icon: Zap, action: () => setActiveTab('classes'), color: '#EF4444' },
              { label: 'Download Study Notes', icon: Download, action: () => setActiveTab('notes'), color: '#3B82F6' },
              { label: 'All Batches', icon: BookOpen, action: () => navigate('/student/batches'), color: '#7C3AED' },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <item.icon size={16} style={{ color: item.color }} />
                  <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                </div>
                <ChevronRight size={15} style={{ color: 'var(--text-faint)' }} />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {classes.length === 0 ? (
            <EmptyState
              icon={<Zap size={48} />}
              title="No classes scheduled yet"
              description="Faculty will schedule live classes soon. Check back later!"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {classes.map((cls, i) => (
                <motion.div
                  key={cls.id}
                  className="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, border: cls.status === 'live' ? '2px solid #EF4444' : '1px solid var(--border)' }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: cls.status === 'live' ? 'rgba(239,68,68,0.15)' : cls.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {cls.status === 'completed' ? <CheckCircle size={22} style={{ color: '#10B981' }} /> : <Video size={22} style={{ color: cls.status === 'live' ? '#EF4444' : '#3B82F6' }} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {cls.status === 'live' && <span className="badge badge-live">● LIVE NOW</span>}
                        {cls.status === 'scheduled' && <span className="badge badge-info">UPCOMING</span>}
                        {cls.status === 'completed' && <span className="badge badge-success">RECORDED</span>}
                        {cls.subject_name && <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 600 }}>{cls.subject_name}</span>}
                      </div>
                      <p style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{cls.title}</p>
                      <div style={{ display: 'flex', gap: 14, color: 'var(--text-muted)', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> {new Date(cls.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {new Date(cls.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{cls.duration_minutes || 60} min</span>
                      </div>
                    </div>
                  </div>

                  {cls.status === 'live' && (
                    <Link to="/student/classes" className="btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444', padding: '10px 20px', fontSize: 14, flexShrink: 0 }}>
                      <Zap size={14} /> Join Classroom
                    </Link>
                  )}
                  {cls.status === 'completed' && cls.recording_url && (
                    <a href={cls.recording_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14, flexShrink: 0 }}>
                      <Play size={14} /> Watch Recording
                    </a>
                  )}
                  {cls.status === 'scheduled' && (
                    <button onClick={() => toast.success('Reminder set!')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
                      <Clock size={14} /> Set Reminder
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {notes.length === 0 ? (
            <EmptyState
              icon={<FileText size={48} />}
              title="No study materials yet"
              description="Faculty will upload notes and PDFs soon. Check back later!"
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {notes.map((note: any, i: number) => (
                <motion.div
                  key={note.id}
                  className="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>{note.type || 'PDF Notes'}</span>
                      {note.subject_name && <span style={{ color: 'var(--primary-light)', fontSize: 11, fontWeight: 700 }}>{note.subject_name}</span>}
                    </div>
                    <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.4 }}>{note.title}</h3>
                    {note.batch_name && <p style={{ color: 'var(--text-faint)', fontSize: 11, marginBottom: 12 }}>📚 {note.batch_name}</p>}
                  </div>
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ justifyContent: 'center', padding: '10px', fontSize: 13 }}
                    onClick={() => toast.success(`Downloading ${note.title}`)}
                  >
                    <Download size={14} /> Download PDF
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default StudentBatchPage;
