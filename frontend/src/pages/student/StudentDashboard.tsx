import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Zap, Clock, CheckCircle, TrendingUp, Bell, ArrowRight, Play,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentService, classService, notificationService } from '../../services';
import { Enrollment, LiveClass, Announcement } from '../../types';
import { Skeleton, ProgressBar } from '../../components/ui';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Learning | Ambition Academy';
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [enrollRes, classRes, notifRes, annoRes] = await Promise.allSettled([
        enrollmentService.getMyEnrollments(),
        classService.getAll({ limit: 5 } as any),
        notificationService.getAll(),
        notificationService.getAnnouncements(),
      ]);

      if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value || []);
      if (classRes.status === 'fulfilled') setClasses(classRes.value?.data || []);
      if (notifRes.status === 'fulfilled') setUnreadNotifs(notifRes.value?.unread_count || 0);
      if (annoRes.status === 'fulfilled') setAnnouncements(annoRes.value || []);
    } catch {
      // Handled by allSettled
    } finally {
      setLoading(false);
    }
  };

  const todayClasses = classes.filter(c => {
    const classDate = new Date(c.scheduled_at);
    const today = new Date();
    return classDate.toDateString() === today.toDateString();
  });

  const liveClasses = classes.filter(c => c.status === 'live');

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 4 }}>
          {getGreeting()}, {profile?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your learning today.</p>
      </motion.div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)
        ) : [
          { label: 'My Batches', value: enrollments.length, icon: BookOpen, color: '#7C3AED' },
          { label: 'Today\'s Classes', value: todayClasses.length, icon: Zap, color: '#3B82F6' },
          { label: 'Live Now', value: liveClasses.length, icon: Zap, color: '#EF4444' },
          { label: 'Notifications', value: unreadNotifs, icon: Bell, color: '#F59E0B' },
        ].map(stat => (
          <motion.div key={stat.label} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}
            whileHover={{ y: -2 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{stat.value}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Layout — Full Width */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* My Batches */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.15rem' }}>My Enrolled Batches</h2>
            <Link to="/student/batches" style={{ color: 'var(--primary-light)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              View all batches <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
          ) : enrollments.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center' }}>
              <BookOpen size={36} style={{ color: 'var(--primary-light)', margin: '0 auto 12px', opacity: 0.8 }} />
              <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>No Enrolled Batches Yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Explore our premium courses to begin your preparation.</p>
              <Link to="/batches" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', padding: '10px 20px', fontSize: 14 }}>
                Browse All Batches
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {enrollments.map(enrollment => (
                <Link key={enrollment.id} to={`/student/batch/${enrollment.batch_id}`} style={{ textDecoration: 'none' }}>
                  <motion.div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }} whileHover={{ y: -3 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={22} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {enrollment.batches?.title || 'Batch'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{enrollment.batches?.target_exam}</p>
                      <ProgressBar value={0} max={100} className="mt-3" />
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Live Classes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.15rem' }}>Today's Scheduled Classes</h2>
            <Link to="/student/classes" style={{ color: 'var(--primary-light)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              All classes <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12 }} />)
          ) : todayClasses.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No classes scheduled for today. Check your batch schedule for upcoming lectures.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {todayClasses.map(cls => (
                <motion.div key={cls.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} whileHover={{ y: -2 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {cls.status === 'live' && <span className="badge badge-live">● LIVE NOW</span>}
                      <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 700 }}>{cls.subjects?.name}</span>
                    </div>
                    <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{cls.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(cls.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {cls.profiles?.name || 'Faculty'}
                    </p>
                  </div>
                  {cls.status === 'live' ? (
                    <Link to="/student/classes" className="btn-primary" style={{ padding: '10px 18px', fontSize: 14, flexShrink: 0, background: '#EF4444', borderColor: '#EF4444' }}>
                      <Zap size={15} /> Join Live
                    </Link>
                  ) : (
                    <Link to="/student/classes" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
                      <Clock size={14} /> Schedule
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.15rem' }}>Learning Timeline & Practice</h2>
            <Link to="/student/activity" style={{ color: 'var(--primary-light)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              Full activity history <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <Link to="/student/ai/quiz" style={{ textDecoration: 'none' }}>
              <motion.div className="card" style={{ padding: 20, borderLeft: '4px solid #7C3AED' }} whileHover={{ y: -3 }}>
                <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🧠 AI Test Generator</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generate unique practice tests with zero repeated questions.</p>
              </motion.div>
            </Link>
            <Link to="/student/ai/study-plan" style={{ textDecoration: 'none' }}>
              <motion.div className="card" style={{ padding: 20, borderLeft: '4px solid #3B82F6' }} whileHover={{ y: -3 }}>
                <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>✨ AI Study Planner</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Personalized daily timetable adapted to your exam target.</p>
              </motion.div>
            </Link>
            <Link to="/student/activity" style={{ textDecoration: 'none' }}>
              <motion.div className="card" style={{ padding: 20, borderLeft: '4px solid #10B981' }} whileHover={{ y: -3 }}>
                <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⏱️ My Learning History</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Review all past test scores, enrolled courses, and activity.</p>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
