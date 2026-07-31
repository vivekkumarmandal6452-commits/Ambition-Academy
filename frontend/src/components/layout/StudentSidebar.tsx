import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, Video, Zap, TestTube, FileText,
  HelpCircle, Bell, User, LogOut, ChevronLeft, ChevronRight,
  BarChart2, Menu, X, Image, Sparkles, Brain, PenLine, Mic,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui';
import AmbitionLogo from '../common/AmbitionLogo';

const navItems = [
  { label: 'Dashboard', href: '/student', icon: Home },
  { label: 'My Batches', href: '/student/batches', icon: BookOpen },
  { label: 'Live Classes', href: '/student/classes', icon: Zap },
  { label: 'Lectures', href: '/student/lectures', icon: Video },
  { label: 'Tests', href: '/student/tests', icon: TestTube },
  { label: 'Study Material', href: '/student/study-material', icon: FileText },
  { label: 'DPP', href: '/student/dpp', icon: BarChart2 },
  { label: 'Gallery', href: '/student/gallery', icon: Image },
  { label: 'Doubts', href: '/student/doubts', icon: HelpCircle },
  { label: 'Notifications', href: '/student/notifications', icon: Bell },
  { label: 'Profile', href: '/student/profile', icon: User },
];

const aiNavItems = [
  { label: 'AI Study Planner', href: '/student/ai/study-plan', icon: Sparkles },
  { label: 'AI Quiz Generator', href: '/student/ai/quiz', icon: Brain },
  { label: 'AI Smart Notes', href: '/student/ai/notes', icon: PenLine },
  { label: 'AI Viva Mode', href: '/student/ai/viva', icon: Mic },
];

const StudentSidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <AmbitionLogo variant="primary" size={28} showTagline={false} />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 28, height: 28, borderRadius: 6, background: 'var(--card-raised)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer',
              marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0,
            }}
            className="hidden md:flex"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* Admin Switcher Banner */}
      {profile?.role === 'admin' && (
        <Link
          to="/admin"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(245,158,11,0.2) 100%)',
            border: '1px solid rgba(245,158,11,0.4)',
            color: '#F59E0B', textDecoration: 'none',
            fontSize: 13, fontWeight: 700, margin: '8px 12px 16px',
          }}
        >
          <BarChart2 size={16} />
          {!collapsed && <span>Switch to Admin Panel</span>}
        </Link>
      )}

      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/student' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className="sidebar-item"
              style={{
                marginBottom: 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                paddingLeft: collapsed ? 10 : 13,
              }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* AI Section Divider */}
        <div style={{ margin: '10px 0 6px', padding: collapsed ? '0 6px' : '0 10px' }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-light)', whiteSpace: 'nowrap', padding: '2px 8px', background: 'rgba(124,58,237,0.15)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.3)' }}>
                ✨ AI TOOLS
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          ) : <div style={{ height: 1, background: 'var(--border)' }} />}
        </div>

        {aiNavItems.map(item => {
          const isActive = location.pathname === item.href ||
            location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className="sidebar-item"
              style={{
                marginBottom: 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                borderLeft: isActive ? '3px solid var(--primary-light)' : '3px solid transparent',
                paddingLeft: collapsed ? 10 : 13,
              }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--card-raised)', marginBottom: 8 }}>
            <Avatar name={profile?.name || 'S'} src={profile?.avatar_url} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || 'Student'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="sidebar-item"
          style={{
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--danger)', paddingLeft: collapsed ? 10 : 13,
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'var(--card)', borderRight: '1px solid var(--border)',
          height: '100vh', position: 'sticky', top: 0,
          flexShrink: 0, overflow: 'hidden',
        }}
        className="hidden md:block"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button — floated, non-intrusive */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 14, left: 14, zIndex: 60,
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="md:hidden"
        aria-label="Open menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }}
              className="md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
                background: 'var(--card)', zIndex: 100,
              }}
              className="md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentSidebar;
