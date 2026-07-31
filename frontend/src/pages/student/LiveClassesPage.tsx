import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Clock, CheckCircle, Video, Calendar, Play, X, MessageSquare,
  Send, Users, Radio, AlertCircle, Share2, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { classService } from '../../services';
import { LiveClass } from '../../types';
import { TableSkeleton, EmptyState, Badge, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

// Countdown Component for Scheduled Classes
const LiveCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPast: boolean }>({
    hours: 0, minutes: 0, seconds: 0, isPast: false,
  });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isPast: false });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <span className="badge badge-warning" style={{ fontSize: 12, padding: '4px 10px', animation: 'pulse 1.5s infinite' }}>
        Starting Any Second...
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', padding: '4px 12px', borderRadius: 20 }}>
      <Clock size={13} color="var(--primary-light)" />
      <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
        Starts in {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// YouTube Live Video Embed helper
const getEmbedUrl = (url: string) => {
  if (!url) return 'https://www.youtube.com/embed/live_stream?channel=UCdemo';
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  return url;
};

const LiveClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  // Live Chat state inside stream modal
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; text: string; time: string; isTeacher?: boolean }>>([
    { id: '1', user: 'Ambition Academy Bot', text: 'Welcome to the live session! Ask your questions here.', time: '16:00', isTeacher: true },
    { id: '2', user: 'Rahul Kumar', text: 'Good evening sir! Ready for today’s lecture.', time: '16:01' },
    { id: '3', user: 'Anjali Sharma', text: 'Sir will you solve previous year JEE questions today?', time: '16:02' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    loadClasses();
  }, [filter]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await classService.getAll({ status: filter || undefined } as any);
      setClasses(res.data || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      user: 'You',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputMsg('');
  };

  const liveNow = classes.filter(c => c.status === 'live');
  const upcoming = classes.filter(c => c.status === 'scheduled');
  const completed = classes.filter(c => c.status === 'completed');

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 8 }}>
            <Radio size={14} color="#EF4444" className="animate-pulse" />
            <span style={{ color: '#EF4444', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE CLASS PORTAL</span>
          </div>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
            Live Interactive Classes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            PW-Style Live Streaming, Interactive Chat, and On-Demand Video Recordings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '10px 18px', borderRadius: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', display: 'block' }}>{liveNow.length}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>LIVE NOW</span>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '10px 18px', borderRadius: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-light)', display: 'block' }}>{upcoming.length}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>UPCOMING</span>
          </div>
        </div>
      </div>

      {/* Featured LIVE NOW Hero Player Card */}
      {liveNow.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(124,58,237,0.15) 100%)',
            border: '2px solid #EF4444',
            borderRadius: 24,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 20px 40px rgba(239,68,68,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 10px #EF4444' }} className="animate-ping" />
              <span style={{ color: '#EF4444', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em' }}>
                STREAMING LIVE RIGHT NOW
              </span>
            </div>
            <Badge variant="live">● HIGH PRIORITY CLASS</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                {liveNow[0].batch_name || 'Physics & Competitive Exam Batch'}
              </span>
              <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                {liveNow[0].title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                Join the interactive live classroom. Participate in live polls, clear doubt concepts with faculty, and chat in real-time.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setSelectedClass(liveNow[0])}
                  className="btn-primary"
                  style={{ background: '#EF4444', borderColor: '#EF4444', padding: '12px 24px', fontSize: 15, fontWeight: 700 }}
                >
                  <Play size={18} fill="white" /> Join Live Classroom Now
                </button>
              </div>
            </div>

            {/* Live Video Preview Thumbnail */}
            <div
              onClick={() => setSelectedClass(liveNow[0])}
              style={{
                position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                aspectRatio: '16/9', background: '#000', border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={liveNow[0].thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80'}
                alt="Live"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px #EF4444' }}>
                  <Play size={24} fill="white" color="white" style={{ marginLeft: 4 }} />
                </div>
              </div>
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(239,68,68,0.9)', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>
                ● LIVE STREAM
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { label: 'All Classes', value: '' },
          { label: '🔥 Live Now', value: 'live' },
          { label: '⏰ Scheduled / Upcoming', value: 'scheduled' },
          { label: '📹 Recorded Sessions', value: 'completed' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === tab.value ? 'var(--primary)' : 'var(--card)',
              color: filter === tab.value ? 'white' : 'var(--text-muted)',
              border: filter === tab.value ? '1px solid var(--primary)' : '1px solid var(--border)',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<Video size={48} />}
          title="No live classes scheduled"
          description="Check back soon! Faculty members schedule new live classes daily."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                border: cls.status === 'live' ? '2px solid #EF4444' : '1px solid var(--border)',
                boxShadow: cls.status === 'live' ? '0 10px 30px rgba(239,68,68,0.15)' : 'none',
              }}
            >
              {/* Thumbnail Header */}
              <div style={{ position: 'relative', height: 160, background: '#000' }}>
                <img
                  src={cls.thumbnail_url || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80'}
                  alt={cls.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />

                {/* Status Badges */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                  {cls.status === 'live' && (
                    <span className="badge badge-live" style={{ fontSize: 11, padding: '4px 10px' }}>● LIVE NOW</span>
                  )}
                  {cls.status === 'scheduled' && (
                    <span style={{ background: 'rgba(59,130,246,0.9)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                      UPCOMING
                    </span>
                  )}
                  {cls.status === 'completed' && (
                    <span style={{ background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                      RECORDING AVAILABLE
                    </span>
                  )}
                </div>

                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ color: '#A78BFA', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cls.subject_name || 'Subject'}
                  </span>
                  {cls.status === 'scheduled' && <LiveCountdown targetDate={cls.scheduled_at} />}
                </div>
              </div>

              {/* Content Body */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, lineHeight: 1.4 }}>
                    {cls.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} />
                      {new Date(cls.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {new Date(cls.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({cls.duration_minutes || 60}m)
                    </span>
                    {cls.instructor_name && (
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                        👨‍🏫 {cls.instructor_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {cls.status === 'live' && (
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', background: '#EF4444', borderColor: '#EF4444', padding: '10px' }}
                    >
                      <Zap size={16} /> Join Classroom & Chat
                    </button>
                  )}

                  {cls.status === 'completed' && (
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    >
                      <Play size={16} /> Play Recorded Lecture
                    </button>
                  )}

                  {cls.status === 'scheduled' && (
                    <button
                      onClick={() => toast.success(`Reminder set for ${cls.title}`)}
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    >
                      <Clock size={15} /> Set Reminder
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PW-STYLE EMBEDDED LIVE STREAMING & CHAT MODAL */}
      <AnimatePresence>
        {selectedClass && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
            display: 'flex', flexDirection: 'column', padding: 16,
          }}>
            {/* Modal Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {selectedClass.status === 'live' ? (
                  <span className="badge badge-live">● LIVE NOW</span>
                ) : (
                  <span className="badge badge-info">RECORDED SESSION</span>
                )}
                <div>
                  <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{selectedClass.title}</h3>
                  <p style={{ color: '#94A3B8', fontSize: 12 }}>Ambition Academy Digital Classroom</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Player + Live Chat Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, minHeight: 0 }} className="responsive-video-grid">
              {/* Video Player */}
              <div style={{ background: '#000', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                <iframe
                  src={getEmbedUrl(selectedClass.meeting_url)}
                  title={selectedClass.title}
                  style={{ width: '100%', height: '100%', border: 'none', minHeight: 400 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Live Chat Drawer */}
              <div style={{ background: '#0F172A', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} color="#A78BFA" />
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Live Classroom Chat</span>
                  <span style={{ color: '#10B981', fontSize: 11, marginLeft: 'auto', fontWeight: 700 }}>● 1,420 online</span>
                </div>

                {/* Chat Feed */}
                <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: msg.isTeacher ? '#F59E0B' : '#A78BFA', fontWeight: 700, fontSize: 12 }}>
                          {msg.user} {msg.isTeacher && '⭐ [FACULTY]'}
                        </span>
                        <span style={{ color: '#64748B', fontSize: 10 }}>{msg.time}</span>
                      </div>
                      <p style={{ color: '#E2E8F0', fontSize: 13, background: msg.isTeacher ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 8, border: msg.isTeacher ? '1px solid rgba(245,158,11,0.3)' : 'none' }}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Input box */}
                <form onSubmit={handleSendMessage} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ask a doubt or question..."
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    style={{ flex: 1, background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: 'white', fontSize: 13 }}
                  />
                  <button type="submit" style={{ background: '#7C3AED', border: 'none', color: 'white', borderRadius: 10, padding: '8px 14px', cursor: 'pointer' }}>
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveClassesPage;
