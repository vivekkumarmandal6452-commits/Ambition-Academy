import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Brain, Award, BookOpen, CheckCircle, FileText, Zap, MessageSquare, Target
} from 'lucide-react';
import { aiService, AIActivityEvent } from '../../services/aiService';

const EVENT_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  ai_chat: { icon: MessageSquare, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  ai_quiz_started: { icon: Target, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  ai_quiz_completed: { icon: Award, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  ai_notes_generated: { icon: FileText, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  ai_study_plan_created: { icon: Brain, color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
  ai_viva_completed: { icon: Zap, color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  batch_enrolled: { icon: BookOpen, color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
  test_completed: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
};

const AiActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<AIActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Activity & History | Ambition Academy';
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const data = await aiService.getActivity(100);
      setActivities(data || []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 8 }}>
          <Clock size={14} color="var(--primary-light)" />
          <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 700 }}>PERMANENT TIMELINE</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
          My Activity & Learning History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          A complete timeline of all your tests, AI practice sessions, study plans, and batch enrollments.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading activity log...</div>
      ) : activities.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Clock size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--text)', fontWeight: 700 }}>No activity logged yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Start taking AI tests, chatting with Ambition AI, or creating study plans!</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 24, borderLeft: '2px solid var(--border)' }}>
          {activities.map((act, i) => {
            const config = EVENT_ICONS[act.type] || { icon: Clock, color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' };
            const Icon = config.icon;
            const dateStr = new Date(act.created_at).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{ position: 'relative', marginBottom: 24, paddingLeft: 12 }}
              >
                {/* Timeline Node */}
                <div style={{
                  position: 'absolute',
                  left: -37,
                  top: 2,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: config.bg,
                  border: `2px solid ${config.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: config.color
                }}>
                  <Icon size={14} style={{ margin: 'auto' }} />
                </div>

                {/* Content Card */}
                <div className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15 }}>{act.title}</p>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>{dateStr}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{act.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiActivityPage;
