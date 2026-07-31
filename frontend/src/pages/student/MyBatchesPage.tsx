import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Clock, Users } from 'lucide-react';
import { enrollmentService } from '../../services';
import { Enrollment } from '../../types';
import { CardSkeleton, EmptyState, ProgressBar } from '../../components/ui';

const MyBatchesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentService.getMyEnrollments().then(data => {
      setEnrollments(data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
          My Batches
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>All your enrolled learning batches in one place.</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No batches enrolled"
          description="You haven't enrolled in any batch yet. Start your learning journey today!"
          action={
            <Link to="/batches" className="btn-primary">
              Explore Batches <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {enrollments.map((enrollment, i) => {
            const batch = enrollment.batches;
            if (!batch) return null;
            return (
              <motion.div key={enrollment.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
              >
                {/* Thumbnail */}
                <div style={{ height: 140, background: batch.thumbnail_url ? `url(${batch.thumbnail_url}) center/cover` : 'var(--grad-primary)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!batch.thumbnail_url && <BookOpen size={40} color="rgba(255,255,255,0.5)" />}
                  <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                    <span style={{ background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                      ENROLLED
                    </span>
                  </div>
                </div>

                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    {batch.target_exam}
                  </p>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>{batch.title}</h3>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Progress</span>
                      <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 600 }}>0%</span>
                    </div>
                    <ProgressBar value={0} max={100} />
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Clock size={12} />
                      {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                      <BookOpen size={12} />
                      {batch.total_lectures || 0} lectures
                    </div>
                  </div>

                  <Link to={`/student/batch/${batch.id}`} className="btn-primary" style={{ justifyContent: 'center', marginTop: 'auto' }}>
                    Continue Learning <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBatchesPage;
