import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import AmbitionLogo from '../../components/common/AmbitionLogo';

export const NotFoundPage: React.FC = () => (
  <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 460 }}>
      <div style={{ marginBottom: 24 }}>
        <AmbitionLogo variant="primary" size={48} showTagline={true} />
      </div>
      <h1 style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--primary-light)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: 700, marginTop: 8, marginBottom: 12 }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 32 }}>
        The page you are looking for doesn't exist, was removed, or is temporarily unavailable.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
          <Home size={16} /> Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </motion.div>
  </div>
);

export const ForbiddenPage: React.FC = () => (
  <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 460 }}>
      <div style={{ marginBottom: 24 }}>
        <AmbitionLogo variant="primary" size={48} showTagline={true} />
      </div>
      <h1 style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--danger)', lineHeight: 1 }}>
        403
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: 700, marginTop: 8, marginBottom: 12 }}>
        Access Forbidden
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 32 }}>
        You do not have administrative permissions to view this section. Please contact your system administrator.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/student" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
          <Home size={16} /> Student Dashboard
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
