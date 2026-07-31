import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TestTube, Clock, CheckCircle, ArrowRight, Play, XCircle } from 'lucide-react';
import { testService } from '../../services';
import { Test } from '../../types';
import { TableSkeleton, EmptyState, Badge } from '../../components/ui';

const TestsPage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testService.getAll().then(res => {
      setTests(res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const notStarted = tests.filter(t => t.attempt_status === 'not_started');
  const completed = tests.filter(t => t.attempt_status === 'completed');

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
          Test Series
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Take tests, track your performance.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Tests', value: tests.length, color: '#7C3AED' },
          { label: 'Completed', value: completed.length, color: '#10B981' },
          { label: 'Pending', value: notStarted.length, color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : tests.length === 0 ? (
        <EmptyState icon={<TestTube size={48} />} title="No tests available" description="Tests will appear here once published by your instructor." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tests.map((test, i) => (
            <motion.div key={test.id} className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: test.attempt_status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {test.attempt_status === 'completed'
                    ? <CheckCircle size={22} style={{ color: '#10B981' }} />
                    : <TestTube size={22} style={{ color: 'var(--primary-light)' }} />
                  }
                </div>
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <span className="badge badge-primary" style={{ fontSize: 10, textTransform: 'capitalize' }}>{test.type}</span>
                  </div>
                  <p style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{test.title}</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {test.duration_minutes} min
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{test.total_questions} questions</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{test.total_marks} marks</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {test.attempt_status === 'completed' ? (
                  <>
                    <div style={{ textAlign: 'right', marginRight: 8 }}>
                      <p style={{ color: '#10B981', fontWeight: 700, fontSize: '1.1rem' }}>{test.score}/{test.total_marks}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Score</p>
                    </div>
                    <Link to={`/student/tests/${test.id}/result`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                      View Result
                    </Link>
                  </>
                ) : (
                  <Link to={`/student/tests/${test.id}`} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
                    <Play size={14} /> Start Test
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestsPage;
