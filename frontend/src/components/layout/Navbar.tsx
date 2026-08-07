import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Moon, Sun, ChevronDown, BookOpen,
  Users, Zap, TestTube, FileText, LogIn, UserPlus, Image,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui';
import AmbitionLogo from '../common/AmbitionLogo';

const navLinks = [
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Batches', href: '/batches', icon: Users },
  { label: 'Live Classes', href: '/batches', icon: Zap },
  { label: 'Test Series', href: '/batches', icon: TestTube },
  { label: 'Gallery', href: '/gallery', icon: Image },
];

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <header
      className="glass"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: `1px solid var(--border)`,
      }}
    >
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <AmbitionLogo variant="primary" size={34} showTagline={false} />
        </Link>

        {/* Desktop Nav */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }} className="hidden md:flex">
          {navLinks.map(link => (
            <li key={link.label}>
              <Link
                to={link.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: location.pathname === link.href ? 'var(--primary-light)' : 'var(--text-muted)',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  display: 'block',
                }}
                className="hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
              transition: 'var(--transition)',
            }}
            title="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 10,
                  background: 'var(--card)', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'var(--transition)',
                  color: 'var(--text)',
                }}
              >
                <Avatar name={profile?.name || user.email || 'U'} src={profile?.avatar_url} size={28} />
                <span style={{ fontSize: '14px', fontWeight: 500 }} className="hidden md:block">
                  {profile?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--card)', border: '1px solid var(--border)',
                      borderRadius: 12, padding: 8, minWidth: 180,
                      boxShadow: 'var(--shadow-md)', zIndex: 200,
                    }}
                  >
                    <Link to="/student" onClick={() => setProfileOpen(false)}
                      style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text)', textDecoration: 'none' }}
                      className="hover:bg-primary/10"
                    >
                      Dashboard
                    </Link>
                    <Link to="/student/profile" onClick={() => setProfileOpen(false)}
                      style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text)', textDecoration: 'none' }}
                    >
                      Profile
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--primary-light)', textDecoration: 'none' }}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={handleSignOut}
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--danger)', background: 'none', cursor: 'pointer' }}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary hidden md:flex" style={{ padding: '8px 16px', fontSize: 14 }}>
                <LogIn size={15} /> Login
              </Link>
              <Link to="/signup" className="btn-primary hidden md:flex" style={{ padding: '8px 16px', fontSize: 14 }}>
                <UserPlus size={15} /> Sign Up
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--card)', border: '1px solid var(--border)',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
            className="md:hidden flex"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--card)',
              padding: '16px 24px',
            }}
          >
            {navLinks.map(link => (
              <Link key={link.label} to={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 15 }}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
            {!user && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Link to="/login" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Login</Link>
                <Link to="/signup" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
