import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Play, Star, Zap, BookOpen, Award, Users,
  CheckCircle, Clock, ChevronRight, TrendingUp, Shield,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// Animated counter hook
const useCounter = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
};

const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => {
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  const { count, ref } = useCounter(num);

  return (
    <div ref={ref} className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>{label}</p>
    </div>
  );
};

const features = [
  { icon: '🎥', title: 'Live Interactive Classes', desc: 'Join live sessions with expert faculty. Ask doubts in real-time via integrated chat.' },
  { icon: '📹', title: 'Recorded Lectures', desc: 'Access unlimited recorded lectures. Pause, rewind, and resume from where you left off.' },
  { icon: '📝', title: 'Daily Practice Problems', desc: 'Sharpen your skills with subject-wise DPPs designed by expert teachers.' },
  { icon: '🧪', title: 'Full-Length Mock Tests', desc: 'Timed tests with auto-evaluation, detailed solutions, and performance analytics.' },
  { icon: '📚', title: 'Study Materials', desc: 'Download notes, formula sheets, and assignments curated by subject experts.' },
  { icon: '💬', title: 'Doubt Resolution', desc: 'Ask doubts anytime. Get answers from instructors within 24 hours.' },
];

const exams = [
  { name: 'JEE Mains & Advanced', color: '#7C3AED', icon: '⚙️', count: '15 Batches' },
  { name: 'NEET UG', color: '#EF4444', icon: '🩺', count: '12 Batches' },
  { name: 'Class 12 Boards', color: '#3B82F6', icon: '📘', count: '8 Batches' },
  { name: 'Class 10 Boards', color: '#10B981', icon: '📗', count: '6 Batches' },
  { name: 'Foundation', color: '#F59E0B', icon: '📚', count: '10 Batches' },
  { name: 'UPSC CSE', color: '#8B5CF6', icon: '🏛️', count: '4 Batches' },
];

const testimonials = [
  { name: 'Priya Sharma', score: 'JEE Advanced AIR 847', text: 'Ambition Academy\'s structured approach and quality faculty helped me crack JEE Advanced. The live classes were incredibly interactive!', avatar: 'PS' },
  { name: 'Rahul Gupta', score: 'NEET 685/720', text: 'The DPP system and mock tests on Ambition Academy are exactly what I needed. I improved from 560 to 685 in just 4 months of preparation.', avatar: 'RG' },
  { name: 'Anjali Patel', score: 'Class 12 — 96.8%', text: 'The study material quality is unmatched. Every concept explained clearly with examples. Highly recommended!', avatar: 'AP' },
];

const LandingPage: React.FC = () => {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        paddingTop: 120, paddingBottom: 100,
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 24 }}>
              <Zap size={14} color="var(--primary-light)" />
              <span style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Learn. Achieve. Go Beyond.
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.1,
              marginBottom: 24,
            }}>
              Learn Better.<br />
              <span className="grad-text">Chase Your Ambition.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              maxWidth: 560,
              margin: '0 auto 40px',
              lineHeight: 1.8,
            }}>
              Expert faculty, live classes, recorded lectures, DPPs, and mock tests.
              Everything you need to crack JEE, NEET, and board exams — all in one place.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/batches" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                <Zap size={18} /> Explore Batches
              </Link>
              <Link to="/signup" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                <Play size={18} /> Start Free
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ marginTop: 64 }}
          >
            <div className="glass" style={{
              maxWidth: 800, margin: '0 auto', borderRadius: 24, padding: 24,
              boxShadow: 'var(--shadow-lg)',
            }}>
              {/* Mini Dashboard Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, minHeight: 300 }}>
                {/* Sidebar Preview */}
                <div style={{ background: 'var(--card)', borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={11} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Ambition Academy</span>
                  </div>
                  {['Dashboard', 'My Batches', 'Live Classes', 'Tests', 'Study Material'].map((item, i) => (
                    <div key={item} style={{
                      padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                      background: i === 0 ? 'rgba(124,58,237,0.15)' : 'transparent',
                      color: i === 0 ? 'var(--primary-light)' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 500,
                      borderLeft: i === 0 ? '2px solid var(--primary)' : '2px solid transparent',
                      paddingLeft: i === 0 ? 8 : 10,
                    }}>
                      {item}
                    </div>
                  ))}
                </div>
                {/* Content Preview */}
                <div>
                  <div style={{ background: 'var(--card)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Continue Learning</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Physics — Kinematics</p>
                    <div style={{ background: 'var(--border)', borderRadius: 4, height: 4, marginBottom: 4 }}>
                      <div style={{ width: '62%', height: '100%', background: 'var(--grad-primary)', borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--primary-light)' }}>62% Complete</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Live Now', value: 'Chemistry Class', color: '#EF4444', badge: 'LIVE' },
                      { label: 'Today\'s DPP', value: 'Mathematics Ch.3', color: '#F59E0B', badge: 'DUE' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--card)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</span>
                          <span style={{ fontSize: 9, color: item.color, fontWeight: 700, background: `${item.color}22`, padding: '2px 6px', borderRadius: 4 }}>{item.badge}</span>
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 0', background: 'var(--bg-deep)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <StatCard value="50000+" label="Students Enrolled" icon="👨‍🎓" />
            <StatCard value="120+" label="Courses Available" icon="📚" />
            <StatCard value="45+" label="Expert Educators" icon="👨‍🏫" />
            <StatCard value="5000+" label="Classes Delivered" icon="🎥" />
            <StatCard value="200000+" label="Learning Hours" icon="⏱️" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <Zap size={12} /> Platform Features
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
              Everything You Need to <span className="grad-text">Succeed</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
              A complete learning ecosystem designed for serious exam preparation.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="card" style={{ padding: 28 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM CATEGORIES */}
      <section style={{ padding: '80px 0', background: 'var(--bg-deep)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
              Prepare for <span className="grad-text">Top Exams</span>
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose your target exam and start your journey today</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {exams.map((exam, i) => (
              <motion.div key={exam.name}
                className="card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }}
                whileHover={{ y: -4, borderColor: exam.color + '80' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} viewport={{ once: true }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{exam.icon}</div>
                <p style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{exam.name}</p>
                <p style={{ color: exam.color, fontSize: '0.75rem', fontWeight: 600 }}>{exam.count}</p>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/batches" className="btn-primary">
              View All Batches <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
              How <span className="grad-text">Ambition Academy Works</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { step: '01', icon: BookOpen, title: 'Browse Batches', desc: 'Explore batches for your target exam' },
              { step: '02', icon: Users, title: 'Enroll & Start', desc: 'Enroll in a batch and access all content' },
              { step: '03', icon: Zap, title: 'Attend & Practice', desc: 'Attend live classes and practice DPPs daily' },
              { step: '04', icon: Award, title: 'Track & Succeed', desc: 'Monitor progress and ace your exams' },
            ].map((s, i) => (
              <motion.div key={s.step}
                className="card" style={{ padding: 28, position: 'relative' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 48, fontWeight: 900, color: 'var(--border)', fontFamily: 'var(--font-display)' }}>{s.step}</div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <s.icon size={22} style={{ color: 'var(--primary-light)' }} />
                </div>
                <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 0', background: 'var(--bg-deep)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
              Student <span className="grad-text">Success Stories</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                className="card" style={{ padding: 28 }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</p>
                    <p style={{ color: 'var(--primary-light)', fontSize: '0.8rem' }}>{t.score}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
                Why Students Choose <span className="grad-text">Ambition Academy</span>
              </h2>
              {[
                { icon: Shield, text: 'IIT/AIIMS alumni faculty' },
                { icon: TrendingUp, text: 'Proven track record of results' },
                { icon: Clock, text: 'Flexible learning — watch anytime' },
                { icon: CheckCircle, text: 'Regular performance assessment' },
                { icon: Zap, text: 'Live + recorded class combination' },
                { icon: Users, text: '50,000+ strong student community' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={14} style={{ color: 'var(--primary-light)' }} />
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="card" style={{ padding: 32, background: 'var(--grad-card)' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 24 }}>
                  🚀 Start Your Journey Today
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link to="/signup" className="btn-primary" style={{ justifyContent: 'center', padding: '14px' }}>
                    Create Free Account <ArrowRight size={16} />
                  </Link>
                  <Link to="/batches" className="btn-secondary" style={{ justifyContent: 'center', padding: '14px' }}>
                    <ChevronRight size={16} /> Browse All Batches
                  </Link>
                </div>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', textAlign: 'center', marginTop: 16 }}>
                  No credit card required for free batches
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'var(--grad-primary)',
            borderRadius: 24, padding: 'clamp(40px, 6vw, 64px)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <h2 style={{ color: 'white', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>
              Your Dream Score is One Step Away
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              Join thousands of students who are already on their path to success with Ambition Academy.
            </p>
            <Link to="/signup" style={{
              background: 'white', color: 'var(--primary)', padding: '14px 32px',
              borderRadius: 10, fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'var(--transition)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
