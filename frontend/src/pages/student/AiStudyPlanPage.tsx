import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle2, Circle, AlertCircle, RefreshCw, Sparkles,
  BookOpen, Target, Check, ChevronRight, Award
} from 'lucide-react';
import { aiService, AIStudyPlan, AIStudyPlanTask } from '../../services/aiService';
import { ProgressBar, TableSkeleton, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const AiStudyPlanPage: React.FC = () => {
  const [plan, setPlan] = useState<AIStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [exam, setExam] = useState('JEE Main 2026');
  const [targetDate, setTargetDate] = useState('2026-05-15');
  const [dailyMinutes, setDailyMinutes] = useState(120);
  const [subjects, setSubjects] = useState<string[]>(['Physics', 'Chemistry', 'Mathematics']);
  const [level, setLevel] = useState('intermediate');
  const [targetScore, setTargetScore] = useState('240+');

  useEffect(() => {
    document.title = 'AI Study Planner | Ambition Academy';
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const data = await aiService.getStudyPlan();
      setPlan(data);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const generated = await aiService.generateStudyPlan({
        exam,
        target_date: targetDate,
        daily_minutes: dailyMinutes,
        subjects,
        current_level: level,
        target_score: targetScore,
      });
      setPlan(generated);
      toast.success('🎯 AI Study Plan generated and saved!');
    } catch {
      toast.error('Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTaskStatus = async (task: AIStudyPlanTask) => {
    const nextStatus: Record<string, 'pending' | 'in_progress' | 'completed' | 'skipped'> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
      skipped: 'pending',
    };

    const newStatus = nextStatus[task.status] || 'completed';
    try {
      const updated = await aiService.updateStudyPlanTask(task.id, newStatus);
      if (updated) setPlan(updated);
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const completedCount = plan?.tasks?.filter(t => t.status === 'completed').length || 0;
  const totalCount = plan?.tasks?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 8 }}>
          <Sparkles size={14} color="var(--primary-light)" />
          <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 700 }}>AI PERSONALIZED STUDY PLANNER</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
          Adaptive AI Study Schedule
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Generate a custom target schedule based on your exam goal, daily time availability, and target score.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {/* Generator Form Card */}
        <div className="card" style={{ padding: 24, height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Target size={20} color="var(--primary-light)" />
            <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.1rem' }}>Configure Your AI Goal</h3>
          </div>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Target Exam *</label>
              <select value={exam} onChange={e => setExam(e.target.value)} className="input-field">
                <option value="JEE Main 2026">JEE Main 2026</option>
                <option value="JEE Advanced 2026">JEE Advanced 2026</option>
                <option value="NEET UG 2026">NEET UG 2026</option>
                <option value="Class 12th Board Exam">Class 12th Board Exam</option>
                <option value="Class 10th Board Exam">Class 10th Board Exam</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Target Date</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Daily Time (Mins)</label>
                <input type="number" value={dailyMinutes} onChange={e => setDailyMinutes(Number(e.target.value))} className="input-field" min="30" step="15" />
              </div>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Preparation Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="input-field">
                <option value="beginner">Beginner (Foundations & Concepts)</option>
                <option value="intermediate">Intermediate (Problem Solving & DPP)</option>
                <option value="advanced">Advanced (Mock Tests & Speed)</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Target Score</label>
              <input type="text" value={targetScore} onChange={e => setTargetScore(e.target.value)} className="input-field" placeholder="e.g. 250+ / 300" />
            </div>

            <button type="submit" disabled={generating} className="btn-primary" style={{ padding: '12px', justifyContent: 'center', marginTop: 8 }}>
              {generating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Generating AI Plan...' : 'Generate AI Study Schedule'}
            </button>
          </form>
        </div>

        {/* Plan Display Column */}
        <div>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : !plan ? (
            <EmptyState
              icon={<Calendar size={48} />}
              title="No active study plan"
              description="Configure your exam goal on the left to generate your custom AI study schedule."
            />
          ) : (
            <div>
              {/* Progress Banner */}
              <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--grad-primary)', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                      ACTIVE GOAL
                    </span>
                    <h2 style={{ color: 'white', fontWeight: 900, fontSize: '1.4rem', marginTop: 6 }}>{plan.exam}</h2>
                  </div>
                  <div style={{ textAlign: 'right', color: 'white' }}>
                    <span style={{ fontSize: 24, fontWeight: 900 }}>{progressPercent}%</span>
                    <span style={{ fontSize: 12, display: 'block', opacity: 0.8 }}>Completed</span>
                  </div>
                </div>

                <ProgressBar value={progressPercent} max={100} />

                <div style={{ display: 'flex', gap: 16, marginTop: 14, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                  <span>⏱️ Daily: {plan.daily_minutes} mins</span>
                  <span>📅 Target: {new Date(plan.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>🏆 Goal: {plan.target_score || 'High'}</span>
                </div>
              </div>

              {/* Task Schedule List */}
              <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 14 }}>
                Daily Task Checklist ({completedCount}/{totalCount} Completed)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.tasks.map((task, i) => (
                  <motion.div
                    key={task.id || i}
                    className="card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      padding: '16px 20px', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 16, cursor: 'pointer',
                      borderLeft: `4px solid ${task.status === 'completed' ? '#10B981' : task.status === 'in_progress' ? '#3B82F6' : 'var(--primary-light)'}`,
                      opacity: task.status === 'completed' ? 0.75 : 1,
                    }}
                    onClick={() => toggleTaskStatus(task)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'completed' ? '#10B981' : 'var(--text-muted)' }}
                      >
                        {task.status === 'completed' ? <CheckCircle2 size={22} color="#10B981" /> : <Circle size={22} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ color: 'var(--primary-light)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                            {task.day} • {task.subject}
                          </span>
                          <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'primary'}`} style={{ fontSize: 10 }}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                          {task.topic}
                        </p>
                      </div>
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {task.duration_minutes}m
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiStudyPlanPage;
