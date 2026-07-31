import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, ArrowRight, Shield, Award, ArrowLeft, RefreshCw } from 'lucide-react';
import { testService } from '../../services';
import toast from 'react-hot-toast';

const TestTakePage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // qId -> optId
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Practice Test | Ambition Academy';
    if (testId) {
      loadTest(testId);
    }
  }, [testId]);

  useEffect(() => {
    const iv = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const loadTest = async (id: string) => {
    try {
      // Start or get existing attempt
      const attemptData = await testService.start(id);
      setAttempt(attemptData);

      // Get test details & questions
      const res = await testService.getById(id);
      setTest(res.test);
      setQuestions(res.questions || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!testId || !attempt) return;
    setSubmitting(true);
    try {
      const answersArray = Object.entries(selectedAnswers).map(([question_id, selected_option_id]) => ({
        question_id,
        selected_option_id,
      }));

      await testService.submit(testId, {
        attempt_id: attempt.id,
        answers: answersArray,
      });

      toast.success('🎉 Test submitted successfully!');
      navigate(`/student/tests/${testId}/result`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading test environment...
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text)' }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Test not found or no questions available.</p>
        <Link to="/student/tests" className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Back to Tests
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header bar */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 2 }}>
            {test.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Question {currentIdx + 1} of {questions.length} · {test.total_marks || 60} Total Marks
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontWeight: 800, fontSize: 15 }}>
            <Clock size={18} /> {formatTime(elapsedSeconds)}
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            {submitting ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</> : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${((currentIdx + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Question Card */}
      {currentQ && (
        <motion.div key={currentQ.id} className="card" style={{ padding: 28, marginBottom: 24 }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: 13 }}>
              Question #{currentIdx + 1}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>+{currentQ.marks || 4} Marks</span>
          </div>

          <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: 24 }}>
            {currentQ.question_text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(currentQ.test_options || []).map((opt: any) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id || selectedAnswers[currentQ.id] === opt.option_label;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id || opt.option_label)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: isSelected ? 'rgba(124,58,237,0.15)' : 'var(--card-raised)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    color: isSelected ? 'var(--primary-light)' : 'var(--text)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>
                    <span style={{ fontWeight: 800, marginRight: 10 }}>{opt.option_label || '•'}.</span>
                    {opt.option_text}
                  </span>
                  {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="btn-secondary"
          style={{ padding: '10px 20px', fontSize: 13 }}
        >
          ← Previous
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Answered {Object.keys(selectedAnswers).length} of {questions.length}
        </span>
        {currentIdx + 1 < questions.length ? (
          <button
            onClick={() => setCurrentIdx(i => i + 1)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 13 }}
          >
            Next Question →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: 13, background: '#10B981', borderColor: '#10B981' }}
          >
            Finish & Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default TestTakePage;
