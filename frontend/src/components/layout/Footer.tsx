import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Youtube, Instagram, Mail } from 'lucide-react';
import AmbitionLogo from '../common/AmbitionLogo';

const Footer: React.FC = () => (
  <footer style={{
    background: 'var(--bg-deep)',
    borderTop: '1px solid var(--border)',
    padding: '60px 0 32px',
  }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, marginBottom: 48 }}>
        {/* Brand */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <AmbitionLogo variant="primary" size={32} showTagline={true} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
            Empowering students to aim high, achieve their goals, and excel in competitive & board exams.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {[Twitter, Youtube, Instagram, Mail].map((Icon, i) => (
              <a key={i} href="#" style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
              }}>
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 16 }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['All Batches', 'Live Classes', 'Test Series', 'Study Materials', 'DPP Practice'].map(item => (
              <li key={item}>
                <Link to="/batches" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'var(--transition)' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Exams */}
        <div>
          <h4 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 16 }}>Exams</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['JEE Mains & Advanced', 'NEET UG', 'UPSC CSE', 'Class 10 Boards', 'Class 12 Boards'].map(item => (
              <li key={item}>
                <Link to="/batches" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 16 }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
              <li key={item}>
                <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--border)', paddingTop: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
          © 2026 Ambition Academy. All rights reserved.
        </p>
        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
          Built with ❤️ for every aspiring student
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
