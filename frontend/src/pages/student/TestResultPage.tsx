import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';
import { testService } from '../../services';

const TestResultPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Test Performance Result | Ambition Academy';
    if (testId) {
      testService.getResult(testId)
        .then(setResult)
        .finally(() => setLoading(false));
    }
  }, [testId]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating test result breakdown...
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text)' }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Test result not found.</p>
        <Link to="/student/tests" className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Back to Tests
        </Link>
      </div>
    );
  }

  const score = result.score || 0;
  const totalMarks = result.total_marks || 60;
  const percentage = Math.round((score / totalMarks) * 100);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 880, margin: '0 auto' }}>
      <Link to="/student/tests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary-light)', fontSize: 13, fontWeight: 600, marginBottom: 18, textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Test Series
      </Link>

      {/* Score Header */}
      <motion.div className="card" style={{ padding: 36, textAlign: 'center', background: 'var(--grad-primary)', border: 'none', marginBottom: 28 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Award size={56} color="white" style={{ marginBottom: 16 }} />
        <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.4rem', marginBottom: 4 }}>
          {score} / {totalMarks} Marks
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          {percentage}% Overall Accuracy
        </p>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
          {result.test_title || 'Mock Test'} · Completed on {new Date(result.submitted_at || Date.now()).toLocaleDateString('en-IN')}
        </p>
      </motion.div>

      {/* Breakdown Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Correct Answers', value: result.correct_count || 0, color: '#10B981', icon: CheckCircle2 },
          { label: 'Incorrect Answers', value: result.incorrect_count || 0, color: '#EF4444', icon: XCircle },
          { label: 'Unattempted', value: result.unattempted_count || 0, color: '#F59E0B', icon: BookOpen },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
            <stat.icon size={22} color={stat.color} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Detailed Solutions */}
      <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 16 }}>Detailed Solutions & Explanations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(result.questions || []).map((q: any, idx: number) => {
          const selectedOptId = q.selected_option_id;
          const correctOpt = (q.test_options || []).find((o: any) => o.is_correct);
          const isCorrect = selectedOptId === correctOpt?.id || selectedOptId === correctOpt?.option_label;
          const skipped = !selectedOptId;

          return (
            <div key={q.id || idx} className="card" style={{ padding: 24, borderLeft: `4px solid ${skipped ? '#F59E0B' : isCorrect ? '#10B981' : '#EF4444'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>
                  Question #{idx + 1}
                </span>
                <span className={`badge badge-${skipped ? 'warning' : isCorrect ? 'success' : 'danger'}`}>
                  {skipped ? 'Skipped' : isCorrect ? 'Correct (+4)' : 'Incorrect (-1)'}
                </span>
              </div>
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
                {q.question_text}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {(q.test_options || []).map((opt: any) => {
                  const isThisSelected = selectedOptId === opt.id || selectedOptId === opt.option_label;
                  const isThisCorrect = opt.is_correct;
                  let bg = 'var(--card-raised)'; let border = 'var(--border)';
                  if (isThisCorrect) { bg = 'rgba(16,185,129,0.15)'; border = '#10B981'; }
                  else if (isThisSelected && !isThisCorrect) { bg = 'rgba(239,68,68,0.15)'; border = '#EF4444'; }

                  return (
                    <div key={opt.id} style={{ padding: '10px 14px', borderRadius: 8, background: bg, border: `1px solid ${border}`, fontSize: 13, color: 'var(--text)', fontWeight: (isThisSelected || isThisCorrect) ? 700 : 400 }}>
                      {opt.option_label || '•'}. {opt.option_text}
                      {isThisCorrect && ' ✅ (Correct Answer)'}
                      {isThisSelected && !isThisCorrect && ' ❌ (Your Choice)'}
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(124,58,237,0.1)', fontSize: 13, color: 'var(--text)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  💡 <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestResultPage;
