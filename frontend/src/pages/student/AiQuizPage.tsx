import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, RefreshCw, CheckCircle2, XCircle, Clock, Award,
  ChevronRight, Target, History, RotateCcw, ChevronDown, ChevronUp,
  AlertCircle, BookOpen, Play
} from 'lucide-react';
import { aiService, AITestAttempt, AITestAttemptQuestion } from '../../services/aiService';
import toast from 'react-hot-toast';

type PageView = 'setup' | 'quiz' | 'result' | 'history' | 'review';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TYPES = ['MCQ', 'Multiple correct', 'True/False', 'Numerical'];

const ATTEMPT_KEY = 'ai_quiz_attempt_id'; // localStorage key for resume

const AiQuizPage: React.FC = () => {
  const [view, setView] = useState<PageView>('setup');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Kinematics');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(10);
  const [questionType, setQuestionType] = useState('MCQ');

  const [attempt, setAttempt] = useState<AITestAttempt | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id → answer
  const [showExplanation, setShowExplanation] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<any>(null);

  // History
  const [history, setHistory] = useState<AITestAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [reviewAttempt, setReviewAttempt] = useState<AITestAttempt | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  // Check if there's an in-progress attempt to resume on mount
  useEffect(() => {
    document.title = 'AI Practice Test | Ambition Academy';
    const savedId = localStorage.getItem(ATTEMPT_KEY);
    if (savedId) {
      aiService.resumeAITest(savedId).then(({ attempt: a }) => {
        if (a.status === 'in_progress') {
          setAttempt(a);
          setView('quiz');
          startTimer();
          toast.success('▶️ Resumed your previous test!');
        } else {
          localStorage.removeItem(ATTEMPT_KEY);
        }
      }).catch(() => localStorage.removeItem(ATTEMPT_KEY));
    }
  }, []);

  const startTimer = () => {
    const iv = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    setTimerRef(iv);
    return iv;
  };

  const stopTimer = () => {
    if (timerRef) clearInterval(timerRef);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleStart = async (e: React.FormEvent, forceNew = false) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const { attempt: a, resumed } = await aiService.startAITest({
        subject, topic, difficulty, count, questionType, force_new: forceNew,
      });
      setAttempt(a);
      setCurrentIdx(0);
      setAnswers({});
      setShowExplanation(false);
      setElapsedSeconds(0);
      setView('quiz');
      startTimer();
      localStorage.setItem(ATTEMPT_KEY, a.id);
      if (resumed) {
        toast.success('▶️ Resuming your existing test...');
      } else {
        toast.success(`🎯 Attempt #${a.attempt_number} — ${a.total_questions} unique questions ready!`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start test');
    } finally {
      setGenerating(false);
    }
  };

  const handleRetake = async () => {
    setGenerating(true);
    try {
      const { attempt: a } = await aiService.startAITest({
        subject: attempt?.subject || subject,
        topic: attempt?.topic || topic,
        difficulty: attempt?.difficulty || difficulty,
        count: attempt?.total_questions || count,
        questionType: attempt?.question_type || questionType,
        force_new: true, // ALWAYS force new attempt on retake
      });
      setAttempt(a);
      setCurrentIdx(0);
      setAnswers({});
      setShowExplanation(false);
      setElapsedSeconds(0);
      setView('quiz');
      startTimer();
      localStorage.setItem(ATTEMPT_KEY, a.id);
      toast.success(`🔄 Attempt #${a.attempt_number} — New unique questions generated!`);
    } catch {
      toast.error('Failed to generate new test');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (!attempt) return;
    const q = attempt.questions[currentIdx];
    if (answers[q.question_id]) return; // already answered
    setAnswers(prev => ({ ...prev, [q.question_id]: option }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (!attempt) return;
    if (currentIdx + 1 < attempt.questions.length) {
      setCurrentIdx(c => c + 1);
      setShowExplanation(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    stopTimer();
    setSubmitting(true);
    try {
      const result = await aiService.submitAITest(attempt.id, answers);
      setAttempt(result);
      setView('result');
      localStorage.removeItem(ATTEMPT_KEY);
      toast.success(`✅ Test submitted! Score: ${result.correct_count}/${result.total_questions} (${result.accuracy}%)`);
    } catch {
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const h = await aiService.getAITestHistory();
      setHistory(h);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  }, []);

  const openHistory = () => {
    setView('history');
    loadHistory();
  };

  const openReview = async (a: AITestAttempt) => {
    if (a.status === 'completed' && a.questions[0]?.selected_answer !== undefined) {
      setReviewAttempt(a);
      setView('review');
    } else {
      try {
        const full = await aiService.getAITestAttempt(a.id);
        setReviewAttempt(full);
        setView('review');
      } catch { toast.error('Could not load attempt detail'); }
    }
  };

  const currentQ = attempt?.questions[currentIdx];

  // ── SETUP VIEW ─────────────────────────────────────────────────────────────
  if (view === 'setup') return (
    <div style={{ padding: '24px 28px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 8 }}>
          <Brain size={14} color="#3B82F6" />
          <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 700 }}>AI PRACTICE TEST — NO REPEAT QUESTIONS</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>AI Practice Test Generator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Generates unique, exam-quality questions every time. Retakes always give you <strong>different questions</strong>.
          Your progress is saved across sessions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <motion.div className="card" style={{ padding: 32 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={20} color="var(--primary-light)" /> Configure Test
          </h3>
          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field">
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Topic *</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field" placeholder="e.g. Newton's Laws, Chemical Bonding, Integration" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Question Type</label>
                <select value={questionType} onChange={e => setQuestionType(e.target.value)} className="input-field">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Questions</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))} className="input-field">
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={generating} className="btn-primary" style={{ padding: '13px', justifyContent: 'center', marginTop: 4 }}>
              {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating Unique Questions...</> : <><Sparkles size={16} /> Start AI Test</>}
            </button>
          </form>
        </motion.div>

        {/* Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--primary)' }}>
            <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🔒 No Repeat Guarantee</p>
            <ul style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.8, paddingLeft: 16 }}>
              <li>Questions fingerprinted per student</li>
              <li>Retakes always get new questions</li>
              <li>Test resumes after browser close</li>
              <li>All attempts saved permanently</li>
            </ul>
          </div>
          <button onClick={openHistory} className="btn-secondary" style={{ padding: '12px', justifyContent: 'center', gap: 8 }}>
            <History size={16} /> View My Test History
          </button>
        </div>
      </div>
    </div>
  );

  // ── QUIZ VIEW ─────────────────────────────────────────────────────────────
  if (view === 'quiz' && attempt && currentQ) return (
    <div style={{ padding: '24px 28px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <span style={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: 14 }}>
            Q {currentIdx + 1}/{attempt.total_questions}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Attempt #{attempt.attempt_number}</span>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
            <div style={{ height: '100%', borderRadius: 3, background: 'var(--primary)', width: `${((currentIdx + 1) / attempt.total_questions) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontWeight: 700, fontSize: 14, marginLeft: 16 }}>
          <Clock size={16} /> {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="card" style={{ padding: '28px 30px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span className="badge badge-info" style={{ fontSize: 10 }}>{currentQ.difficulty?.toUpperCase()}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{currentQ.topic}</span>
          </div>
          <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: 22 }}>
            {currentQ.question_text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentQ.options.map((opt, optIdx) => {
              const selected = answers[currentQ.question_id];
              const isCorrect = opt === currentQ.correct_answer;
              const isSelected = selected === opt;
              let bg = 'var(--card-raised)'; let border = 'var(--border)'; let color = 'var(--text)';
              if (selected) {
                if (isCorrect) { bg = 'rgba(16,185,129,0.15)'; border = '#10B981'; color = '#10B981'; }
                else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = '#EF4444'; color = '#EF4444'; }
              }
              return (
                <button key={optIdx} onClick={() => handleAnswer(opt)} disabled={!!selected}
                  style={{ textAlign: 'left', padding: '14px 18px', borderRadius: 12, cursor: selected ? 'default' : 'pointer', background: bg, border: `1.5px solid ${border}`, color, fontSize: 14, fontWeight: (isSelected || (selected && isCorrect)) ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                  <span><span style={{ fontWeight: 800, marginRight: 10 }}>{String.fromCharCode(65 + optIdx)}.</span>{opt}</span>
                  {selected && isCorrect && <CheckCircle2 size={18} color="#10B981" />}
                  {selected && isSelected && !isCorrect && <XCircle size={18} color="#EF4444" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 18, padding: 16, borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}>
                <p style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>💡 Explanation</p>
                <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>{currentQ.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {showExplanation && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Answered: {Object.keys(answers).length}/{attempt.total_questions}
          </div>
          <button onClick={handleNext} disabled={submitting} className="btn-primary" style={{ padding: '12px 28px' }}>
            {submitting ? <><RefreshCw size={16} className="animate-spin" /> Submitting...</>
              : currentIdx + 1 < attempt.total_questions ? <>Next Question <ChevronRight size={16} /></>
              : <>Finish & Submit <Award size={16} /></>}
          </button>
        </div>
      )}

      {/* Skip button */}
      {!showExplanation && (
        <div style={{ textAlign: 'right' }}>
          <button onClick={handleNext} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13 }}>
            Skip →
          </button>
        </div>
      )}
    </div>
  );

  // ── RESULT VIEW ───────────────────────────────────────────────────────────
  if (view === 'result' && attempt) return (
    <div style={{ padding: '24px 28px', maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="card" style={{ padding: 36, textAlign: 'center', background: 'var(--grad-primary)', border: 'none', marginBottom: 24 }}>
          <Award size={56} color="white" style={{ marginBottom: 16 }} />
          <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', marginBottom: 4 }}>
            {attempt.accuracy}% Accuracy
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 4 }}>
            {attempt.correct_count}/{attempt.total_questions} correct · Attempt #{attempt.attempt_number}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            ✅ {attempt.correct_count} Correct · ❌ {attempt.incorrect_count} Wrong · ⏭️ {attempt.skipped_count} Skipped
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button onClick={handleRetake} disabled={generating} className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              {generating ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : <><RotateCcw size={14} /> Retake (New Questions)</>}
            </button>
            <button onClick={() => { setView('setup'); setAttempt(null); setAnswers({}); }} className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              New Topic
            </button>
            <button onClick={openHistory} className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              <History size={14} /> View History
            </button>
          </div>
        </div>

        {/* Q&A Review */}
        <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 14 }}>📋 Question Review</h3>
        {attempt.questions.map((q, idx) => {
          const isCorrect = q.selected_answer === q.correct_answer;
          const skipped = !q.selected_answer;
          return (
            <div key={q.question_id} className="card" style={{ padding: '16px 20px', marginBottom: 12, borderLeft: `4px solid ${skipped ? '#6B7280' : isCorrect ? '#10B981' : '#EF4444'}` }}>
              <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Q{idx + 1}. </span>{q.question_text}
              </p>
              {!isCorrect && !skipped && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 4 }}>❌ Your answer: {q.selected_answer}</div>}
              {skipped && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>⏭️ Skipped</div>}
              <div style={{ fontSize: 12, color: '#10B981' }}>✅ Correct: {q.correct_answer}</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{q.explanation}</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );

  // ── HISTORY VIEW ─────────────────────────────────────────────────────────
  if (view === 'history') return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>Test History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All your AI test attempts — never deleted, never reset.</p>
        </div>
        <button onClick={() => setView('setup')} className="btn-primary" style={{ padding: '10px 20px' }}>
          <Play size={14} /> New Test
        </button>
      </div>

      {historyLoading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <BookOpen size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--text)', fontWeight: 700 }}>No test attempts yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Start your first AI test to see history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((h, i) => (
            <motion.div key={h.id} className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 15 }}>{h.subject} — {h.topic}</span>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>#{h.attempt_number}</span>
                  <span className={`badge ${h.status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                    {h.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>📅 {new Date(h.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>❓ {h.total_questions} questions</span>
                  <span>⚡ {h.difficulty}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {h.status === 'completed' && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: (h.accuracy || 0) >= 70 ? '#10B981' : '#F59E0B', fontWeight: 800, fontSize: '1.3rem' }}>{h.accuracy}%</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{h.correct_count}/{h.total_questions} correct</p>
                  </div>
                )}
                <button onClick={() => openReview(h)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  {h.status === 'completed' ? 'Review' : 'Resume'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // ── REVIEW VIEW ───────────────────────────────────────────────────────────
  if (view === 'review' && reviewAttempt) return (
    <div style={{ padding: '24px 28px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
            {reviewAttempt.subject} — {reviewAttempt.topic}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Attempt #{reviewAttempt.attempt_number} · {new Date(reviewAttempt.started_at).toLocaleDateString('en-IN')} · {reviewAttempt.accuracy}%
          </p>
        </div>
        <button onClick={() => setView('history')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
          ← Back
        </button>
      </div>

      {/* Score summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Score', value: `${reviewAttempt.accuracy}%`, color: '#7C3AED' },
          { label: 'Correct', value: reviewAttempt.correct_count || 0, color: '#10B981' },
          { label: 'Wrong', value: reviewAttempt.incorrect_count || 0, color: '#EF4444' },
          { label: 'Skipped', value: reviewAttempt.skipped_count || 0, color: '#6B7280' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <p style={{ color: stat.color, fontWeight: 800, fontSize: '1.5rem' }}>{stat.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Questions */}
      {reviewAttempt.questions.map((q, idx) => {
        const isCorrect = q.selected_answer === q.correct_answer;
        const skipped = !q.selected_answer;
        const isExpanded = expandedQ === q.question_id;
        return (
          <div key={q.question_id} className="card" style={{ marginBottom: 10, borderLeft: `4px solid ${skipped ? '#6B7280' : isCorrect ? '#10B981' : '#EF4444'}` }}>
            <div onClick={() => setExpandedQ(isExpanded ? null : q.question_id)}
              style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                  {skipped ? '⏭️' : isCorrect ? '✅' : '❌'} Q{idx + 1}. {q.question_text.slice(0, 80)}{q.question_text.length > 80 ? '...' : ''}
                </p>
              </div>
              {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </div>
            {isExpanded && (
              <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 12 }}>{q.question_text}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, background: opt === q.correct_answer ? 'rgba(16,185,129,0.15)' : opt === q.selected_answer && !isCorrect ? 'rgba(239,68,68,0.1)' : 'var(--card-raised)', border: `1px solid ${opt === q.correct_answer ? '#10B981' : 'var(--border)'}`, color: 'var(--text)' }}>
                      {opt === q.correct_answer ? '✅ ' : opt === q.selected_answer ? '❌ ' : ''}{opt}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', fontSize: 13, color: 'var(--text)' }}>
                  💡 {q.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return null;
};

export default AiQuizPage;
