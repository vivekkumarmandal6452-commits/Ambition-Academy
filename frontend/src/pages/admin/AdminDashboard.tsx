import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Video, TrendingUp, Zap, UserCheck, BarChart2, ArrowUp, Image as ImageIcon, Plus, FileText, HelpCircle } from 'lucide-react';
import { adminService } from '../../services';
import { Skeleton } from '../../components/ui';
import AdminLayout from './AdminLayout';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | Ambition Academy';
    adminService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: '#7C3AED' },
    { label: 'Active Batches', value: stats?.total_batches || 0, icon: BookOpen, color: '#3B82F6' },
    { label: 'Total Lectures', value: stats?.total_lectures || 0, icon: Video, color: '#10B981' },
    { label: 'Total Enrollments', value: stats?.total_enrollments || 0, icon: TrendingUp, color: '#F59E0B' },
    { label: 'Live Classes', value: stats?.live_classes || 0, icon: Zap, color: '#EF4444' },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 4 }}>
              Ambition Master Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage courses, live classes, lectures, study materials, and website gallery.</p>
          </div>
        </div>

        {/* ADMIN ACTION CONTROL HUB */}
        <div className="card" style={{ padding: 24, marginBottom: 32, background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h2 style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            ⚡ Master Admin Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
            {[
              { label: 'Add Gallery Photos', href: '/admin/gallery', icon: ImageIcon, color: '#9333EA', bg: 'rgba(147,51,234,0.15)' },
              { label: 'Create New Batch', href: '/admin/batches', icon: Plus, color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
              { label: 'Add Live Class', href: '/admin/batches', icon: Zap, color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
              { label: 'Add Lecture Video', href: '/admin/batches', icon: Video, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
              { label: 'Manage DPP & Notes', href: '/admin/batches', icon: FileText, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
            ].map(action => (
              <Link
                key={action.label}
                to={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                className="hover:scale-[1.02]"
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <action.icon size={18} style={{ color: action.color }} />
                </div>
                <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 700 }}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} className="card" style={{ padding: '20px' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              {loading ? (
                <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 6 }} />
              ) : (
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {stat.value.toLocaleString()}
                </p>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          {/* Recent Students */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: 'var(--text)', fontWeight: 700 }}>Recent Students</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Last 5 sign-ups</span>
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: 140, marginBottom: 6, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: 200, borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : (data?.recent_students || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent students</p>
            ) : (
              (data?.recent_students || []).map((student: any) => (
                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700 }}>
                    {student.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{student.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{student.email}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-faint)', fontSize: 11 }}>
                    {new Date(student.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Classes */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 20 }}>Upcoming Classes</h3>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 70, borderRadius: 10, marginBottom: 10 }} />
              ))
            ) : (data?.upcoming_classes || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming classes scheduled</p>
            ) : (
              (data?.upcoming_classes || []).map((cls: any) => (
                <div key={cls.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--card-raised)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--primary-light)', fontSize: 11, fontWeight: 700 }}>
                      {cls.status === 'live' ? '● LIVE' : 'Upcoming'}
                    </span>
                    <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>
                      {new Date(cls.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{cls.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{cls.batches?.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
