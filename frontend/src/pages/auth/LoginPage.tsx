import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui';
import AmbitionLogo from '../../components/common/AmbitionLogo';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      const lowerEmail = email.trim().toLowerCase();
      if (lowerEmail === 'ambitionacademy00@gmail.com' || lowerEmail.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <AmbitionLogo variant="primary" size={44} showTagline={true} />
          </Link>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 8, textAlign: 'center' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28, fontSize: 14 }}>
            Continue your learning journey with Ambition Academy.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Password</label>
                <Link to="/forgot-password" style={{ color: 'var(--primary-light)', fontSize: 13 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-faint)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '13px', fontSize: '1rem', marginTop: 4 }}>
              {loading ? <Spinner size={20} /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 14, marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>

        <p style={{ color: 'var(--text-faint)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
