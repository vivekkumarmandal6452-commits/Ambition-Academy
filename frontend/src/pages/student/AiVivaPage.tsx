import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Send, Brain, RefreshCw, CheckCircle, Award, Sparkles, ChevronRight, Star
} from 'lucide-react';
import { aiService, AIVivaSession } from '../../services/aiService';
import toast from 'react-hot-toast';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const AiVivaPage: React.FC = () => {
  const [session, setSession] = useState<AIVivaSession | null>(null);
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Laws of Motion');
  const [difficulty, setDifficulty] = useState('medium');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => { document.title = 'AI Viva Mode | Ambition Academy'; }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sess = await aiService.submitVivaAnswer({ subject, topic, difficulty });
      setSession(sess);
      setStarted(true);
    } catch {
      toast.error('Failed to start Viva session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !session) return;
    setLoading(true);
    try {
      const updated = await aiService.submitVivaAnswer({ session_id: session.id, student_answer: answer });
      setSession(updated);
      setAnswer('');
      if (updated.completed) toast.success(`🎓 Viva Complete! Your score: ${updated.final_score}%`);
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = session?.history?.[session.history.length - 1];
  const lastEvaluated = session?.history?.filter(h => h.feedback).slice(-1)[0];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: 8 }}>
          <Mic size={14} color="#F59E0B" />
          <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700 }}>AI VIVA / ORAL EXAM MODE</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>AI Viva Voce Examiner</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Practice oral exams — AI asks questions, evaluates your answer, gives feedback, and asks the next question.</p>
      </div>

      {!started ? (
        <motion.div className="card" style={{ padding: 32, maxWidth: 500, margin: '0 auto' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 22 }}>⚙️ Configure Viva Session</h3>
          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Topic *</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field" placeholder="e.g. Thermodynamics, Organic Chemistry, Calculus" required />
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>Difficulty Level</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '13px', justifyContent: 'center' }}>
              {loading ? <><RefreshCw size={16} className="animate-spin" /> Starting Viva...</> : <><Brain size={16} /> Start AI Viva Voce</>}
            </button>
          </form>
        </motion.div>
      ) : session?.completed ? (
        /* Completed Result Screen */
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="card" style={{ padding: 36, textAlign: 'center', background: 'var(--grad-primary)', border: 'none', marginBottom: 24 }}>
            <Award size={56} color="white" style={{ marginBottom: 16 }} />
            <h2 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', marginBottom: 8 }}>Viva Complete!</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
              Overall Score: <strong>{session.final_score}%</strong>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={28} color={(session.final_score || 0) >= (i + 1) * 20 ? '#FCD34D' : 'rgba(255,255,255,0.3)'} fill={(session.final_score || 0) >= (i + 1) * 20 ? '#FCD34D' : 'none'} />
              ))}
            </div>
            <button onClick={() => { setSession(null); setStarted(false); }} className="btn-secondary" style={{ marginTop: 24, background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              Start New Viva
            </button>
          </div>

          {/* Q&A History */}
          <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 14 }}>📋 Q&A Review</h3>
          {session.history.filter(h => h.student_answer).map((h, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px', marginBottom: 12, borderLeft: `4px solid ${(h.score || 0) >= 70 ? '#10B981' : '#F59E0B'}` }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Q{i + 1}:</p>
              <p style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 10 }}>{h.question}</p>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card-raised)', marginBottom: 10, fontSize: 13, color: 'var(--text)' }}>
                <strong>Your Answer:</strong> {h.student_answer}
              </div>
              {h.feedback && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', fontSize: 13, color: 'var(--text)' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>🎓 Feedback:</span> {h.feedback}
                  {h.score !== undefined && <span style={{ float: 'right', fontWeight: 800, color: (h.score >= 70 ? '#10B981' : '#F59E0B') }}>{h.score}%</span>}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      ) : (
        /* Active Viva Interface */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Session Info Bar */}
          <div className="card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>📚 {session?.subject}</span>
              <span>📝 {session?.topic}</span>
              <span>⚡ {session?.difficulty}</span>
            </div>
            <span style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 700 }}>
              Q {session?.history?.length || 1} / 5
            </span>
          </div>

          {/* Last Feedback (if any) */}
          <AnimatePresence>
            {lastEvaluated?.feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="card"
                style={{ padding: '16px 20px', marginBottom: 16, borderLeft: '4px solid #10B981', background: 'rgba(16,185,129,0.08)' }}
              >
                <p style={{ color: '#10B981', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>🎓 Feedback on Previous Answer</p>
                <p style={{ color: 'var(--text)', fontSize: 14 }}>{lastEvaluated.feedback}</p>
                {lastEvaluated.score !== undefined && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Score:</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: lastEvaluated.score >= 70 ? '#10B981' : '#F59E0B' }}>{lastEvaluated.score}%</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Question */}
          {currentQuestion && !currentQuestion.student_answer && (
            <div className="card" style={{ padding: '24px 28px', marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
              <p style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 12, marginBottom: 10 }}>🤖 Examiner's Question</p>
              <p style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700, lineHeight: 1.6 }}>{currentQuestion.question}</p>
            </div>
          )}

          {/* Answer Input */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>📝 Your Answer</label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={5}
              className="input-field"
              placeholder="Type your full answer explaining the concept with any relevant examples, formulas, or reasoning..."
              style={{ resize: 'vertical', marginBottom: 14 }}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="btn-primary"
              style={{ padding: '12px 28px', opacity: loading || !answer.trim() ? 0.6 : 1 }}
            >
              {loading ? <><RefreshCw size={16} className="animate-spin" /> Evaluating...</> : <><Send size={16} /> Submit Answer</>}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AiVivaPage;
