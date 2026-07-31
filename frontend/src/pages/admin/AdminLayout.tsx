import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Layers, Video,
  Zap, FileText, BarChart2, TestTube, HelpCircle, Bell,
  Megaphone, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AmbitionLogo from '../../components/common/AmbitionLogo';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Batches', href: '/admin/batches', icon: BookOpen },
  { label: 'Subjects & Chapters', href: '/admin/subjects', icon: Layers },
  { label: 'Lectures', href: '/admin/lectures', icon: Video },
  { label: 'Live Classes', href: '/admin/classes', icon: Zap },
  { label: 'Study Material', href: '/admin/study-material', icon: FileText },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { label: 'DPP', href: '/admin/dpp', icon: BarChart2 },
  { label: 'Tests', href: '/admin/tests', icon: TestTube },
  { label: 'Doubts', href: '/admin/doubts', icon: HelpCircle },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps { children: React.ReactNode; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AmbitionLogo variant="icon" size={28} />
            <div>
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem' }}>Ambition Academy</p>
              <p style={{ color: 'var(--primary-light)', fontSize: 10, fontWeight: 700 }}>Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--card-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}
          className="hidden md:flex"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Student View Switcher */}
      <div style={{ padding: '8px 12px', marginBottom: 12 }}>
        <Link
          to="/student"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            background: 'var(--card-raised)', border: '1px solid var(--border)',
            color: 'var(--primary-light)', textDecoration: 'none',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <BookOpen size={16} />
          {!collapsed && <span>Switch to Student View</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {adminNavItems.map(item => {
          const isActive = item.href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.href);
          return (
            <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
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
              <item.icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 13 }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--card-raised)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 700 }}>
              {profile?.name?.[0] || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || 'Admin'}
              </p>
              <p style={{ color: 'var(--danger)', fontSize: 10, fontWeight: 700 }}>ADMIN</p>
            </div>
          </div>
        )}
        <button onClick={handleSignOut} className="sidebar-item" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--danger)', paddingLeft: collapsed ? 10 : 13 }}>
          <LogOut size={17} />
          {!collapsed && <span style={{ fontSize: 13 }}>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <motion.aside animate={{ width: collapsed ? 64 : 240 }} transition={{ duration: 0.2 }}
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, overflow: 'hidden' }}
        className="hidden md:block"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile */}
      <div style={{ width: '100%', minWidth: 0 }}>
        {/* Mobile TopBar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }} className="md:hidden">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AmbitionLogo variant="icon" size={26} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>Ambition Admin</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--card-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }}
              className="md:hidden"
            />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, background: 'var(--card)', zIndex: 100 }}
              className="md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
