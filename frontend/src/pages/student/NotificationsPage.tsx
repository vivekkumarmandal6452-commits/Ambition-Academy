import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services';
import { Notification } from '../../types';
import { TableSkeleton, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.notifications || []);
      setUnread(res.unread_count || 0);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
    toast.success('All marked as read');
  };

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const typeIcons: Record<string, string> = {
    class: '🎥', lecture: '📹', dpp: '📝', test: '🧪',
    result: '🏆', announcement: '📢', general: '🔔',
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell size={48} />} title="No notifications" description="You're all caught up! Notifications will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((notif, i) => (
            <motion.div key={notif.id}
              className="card"
              style={{
                padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
                opacity: notif.is_read ? 0.7 : 1,
                borderLeft: notif.is_read ? '3px solid transparent' : '3px solid var(--primary)',
              }}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: notif.is_read ? 0.7 : 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{typeIcons[notif.type] || '🔔'}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text)', fontWeight: notif.is_read ? 400 : 600, fontSize: '0.9rem', marginBottom: 2 }}>{notif.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{notif.message}</p>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem', marginTop: 6 }}>
                  {new Date(notif.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              {!notif.is_read && (
                <button onClick={() => markRead(notif.id)} style={{ background: 'none', color: 'var(--primary-light)', cursor: 'pointer', flexShrink: 0 }} title="Mark as read">
                  <Check size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
