import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, BookOpen, Award, DollarSign, Brain, Clock, Shield, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { adminService } from '../../services';
import AdminLayout from './AdminLayout';

const AdminStudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Student Analytics | Ambition Admin';
    if (studentId) {
      adminService.getStudentDetail(studentId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>Loading student profile & learning history...</div>
      </AdminLayout>
    );
  }

  const profile = data?.profile;
  const enrollments = data?.enrollments || [];
  const purchases = data?.purchases || [];
  const aiSummary = data?.ai_summary;
  const aiHistory = data?.ai_test_history || [];

  return (
    <AdminLayout>
      <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary-light)', fontSize: 13, fontWeight: 600, marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Users
        </Link>

        {/* Profile Banner */}
        <div className="card" style={{ padding: 28, marginBottom: 28, background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 800 }}>
              {profile?.name?.[0] || 'S'}
            </div>
            <div>
              <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
                {profile?.name || 'Student Detail'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{profile?.email} · Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN') : 'N/A'}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>Role: {profile?.role || 'student'}</span>
                <span className={`badge ${profile?.is_active !== false ? 'badge-success' : 'badge-danger'}`}>
                  {profile?.is_active !== false ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Enrolled Batches', value: enrollments.length, icon: BookOpen, color: '#7C3AED' },
            { label: 'Total Paid', value: `₹${data?.total_paid || 0}`, icon: DollarSign, color: '#10B981' },
            { label: 'AI Tests Taken', value: aiSummary?.ai_test_attempts || 0, icon: Brain, color: '#3B82F6' },
            { label: 'Avg AI Test Accuracy', value: `${aiSummary?.avg_accuracy || 0}%`, icon: Award, color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{stat.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Enrollments & Purchases */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16 }}>Enrolled Batches & Payments</h3>
            {enrollments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No batch enrollments found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {enrollments.map((enr: any) => (
                  <div key={enr.id} style={{ padding: 12, borderRadius: 10, background: 'var(--card-raised)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>{enr.batches?.title || 'Batch'}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Enrolled: {new Date(enr.enrolled_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${enr.payment_status === 'paid' ? 'badge-success' : 'badge-info'}`}>
                        {enr.payment_status?.toUpperCase() || 'FREE'}
                      </span>
                      <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                        {enr.amount_paid ? `₹${enr.amount_paid}` : 'Free'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Practice History */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16 }}>AI Test Attempt History</h3>
            {aiHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No AI test attempts recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {aiHistory.map((a: any) => (
                  <div key={a.id} style={{ padding: 12, borderRadius: 10, background: 'var(--card-raised)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>{a.subject} — {a.topic}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Attempt #{a.attempt_number} · {a.difficulty}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: (a.accuracy || 0) >= 70 ? '#10B981' : '#F59E0B', fontWeight: 800, fontSize: 15 }}>
                        {a.accuracy}%
                      </span>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{a.correct_count}/{a.total_questions} correct</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudentDetailPage;
