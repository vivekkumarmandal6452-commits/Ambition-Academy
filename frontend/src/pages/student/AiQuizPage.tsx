import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, RefreshCw, CheckCircle2, XCircle, Clock, Award,
  ChevronRight, BarChart2, Target, Zap
} from 'lucide-react';
import { aiService, AIQuestion } from '../../services/aiService';
import toast from 'react-hot-toast';

type QuizState = 'setup' | 'quiz' | 'result';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TYPES = ['MCQ', 'Multiple correct', 'True/False', 'Numerical'];

const AiQuizPage: React.FC = () => {
  const [state, setState] = useState<QuizState>('setup');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Kinematics');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [questionType, setQuestionType] = useState('MCQ');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  useEffect(() => {
    document.title = 'AI Quiz Generator | Ambition Academy';
    return () => clearInterval(timerInterval);
  }, [timerInterval]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const qs = await aiService.generateQuestions({ subject, topic, difficulty, count, questionType });
      setQuestions(qs);
      setCurrent(0);
      setAnswers({});
      setShowExplanation(false);
      setElapsedSeconds(0);
      setState('quiz');
      setStartTime(Date.now());
      const iv = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
      setTimerInterval(iv);
      toast.success(`🎯 ${qs.length} questions generated!`);
    } catch {
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (answers[questions[current].id]) return;
    setAnswers(prev => ({ ...prev, [questions[current].id]: option }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    clearInterval(timerInterval);
    setState('result');
    const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    aiService.saveQuizSession({
      subject, topic, difficulty, questions,
      userAnswers: answers, score: correct, completed: true,
    }).catch(() => {});
  };

  const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 8 }}>
          <Brain size={14} color="#3B82F6" />
          <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 700 }}>AI QUESTION GENERATOR & QUIZ</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
          Practice Quiz Generator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI-generated exam-quality questions tailored to your topic and difficulty.</p>
      </div>

      {/* SETUP STATE */}
      {state === 'setup' && (
        <motion.div className="card" style={{ padding: 32, maxWidth: 560, margin: '0 auto' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={20} color="var(--primary-light)" /> Configure Your Practice Quiz
          </h3>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 5 }}>No. of Questions</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))} className="input-field">
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={generating} className="btn-primary" style={{ padding: '13px', justifyContent: 'center', marginTop: 4 }}>
              {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating Questions...</> : <><Sparkles size={16} /> Generate AI Quiz</>}
            </button>
          </form>
        </motion.div>
      )}

      {/* QUIZ STATE */}
      {state === 'quiz' && questions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Progress Bar & Timer */}
          <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span style={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: 14 }}>
                Q {current + 1} / {questions.length}
              </span>
              <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'var(--primary)', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontWeight: 700, fontSize: 14, marginLeft: 16 }}>
              <Clock size={16} /> {formatTime(elapsedSeconds)}
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
              style={{ padding: '28px 30px', marginBottom: 18 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span className="badge badge-info" style={{ fontSize: 10 }}>{questions[current].difficulty?.toUpperCase()}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{questions[current].topic}</span>
              </div>
              <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: 22 }}>
                {questions[current].question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questions[current].options.map((opt, optIdx) => {
                  const selected = answers[questions[current].id];
                  const isCorrect = opt === questions[current].correctAnswer;
                  const isSelected = selected === opt;

                  let bg = 'var(--card-raised)';
                  let border = 'var(--border)';
                  let color = 'var(--text)';

                  if (selected) {
                    if (isCorrect) { bg = 'rgba(16,185,129,0.15)'; border = '#10B981'; color = '#10B981'; }
                    else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = '#EF4444'; color = '#EF4444'; }
                    else if (isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = '#10B981'; }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selected}
                      style={{
                        textAlign: 'left', padding: '14px 18px', borderRadius: 12, cursor: selected ? 'default' : 'pointer',
                        background: bg, border: `1.5px solid ${border}`, color, fontSize: 14, fontWeight: isSelected || isCorrect ? 700 : 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s',
                      }}
                    >
                      <span><span style={{ fontWeight: 800, marginRight: 10 }}>{String.fromCharCode(65 + optIdx)}.</span>{opt}</span>
                      {selected && isCorrect && <CheckCircle2 size={18} color="#10B981" />}
                      {selected && isSelected && !isCorrect && <XCircle size={18} color="#EF4444" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: 18, padding: 16, borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}
                  >
                    <p style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>💡 Explanation</p>
                    <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>{questions[current].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {showExplanation && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 28px' }}>
                {current + 1 < questions.length ? <>Next Question <ChevronRight size={16} /></> : <>Finish Quiz <Award size={16} /></>}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* RESULT STATE */}
      {state === 'result' && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="card" style={{ padding: 36, textAlign: 'center', background: 'var(--grad-primary)', border: 'none', marginBottom: 24 }}>
            <Award size={56} color="white" style={{ marginBottom: 16 }} />
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', marginBottom: 4 }}>
              {accuracy}% Accuracy
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
              You answered {correctCount} out of {questions.length} questions correctly • {formatTime(elapsedSeconds)}
            </p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
              <button onClick={() => { setState('setup'); setQuestions([]); }} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                New Quiz
              </button>
              <button onClick={() => { setState('quiz'); setCurrent(0); setAnswers({}); setShowExplanation(false); }} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                Retry Same
              </button>
            </div>
          </div>

          {/* Question Review */}
          <h3 style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 14 }}>📋 Question Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div key={q.id} className="card" style={{ padding: '16px 20px', borderLeft: `4px solid ${isCorrect ? '#10B981' : '#EF4444'}` }}>
                  <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Q{idx + 1}.</span> {q.question}</p>
                  {!isCorrect && (
                    <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 4 }}>❌ Your answer: {userAns || 'Not answered'}</div>
                  )}
                  <div style={{ fontSize: 12, color: '#10B981' }}>✅ Correct answer: {q.correctAnswer}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AiQuizPage;
