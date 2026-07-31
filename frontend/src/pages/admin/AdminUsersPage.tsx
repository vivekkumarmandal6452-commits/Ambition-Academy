import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX, Shield } from 'lucide-react';
import { adminService } from '../../services';
import { Profile } from '../../types';
import { TableSkeleton, EmptyState, Avatar, Badge } from '../../components/ui';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: search || undefined, role: roleFilter || undefined });
      setUsers(res.data || []);
      setTotal(res.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (user: Profile) => {
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const changeRole = async (user: Profile, role: string) => {
    try {
      await adminService.updateUser(user.id, { role: role as any });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: role as any } : u));
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const roleColors: Record<string, string> = { student: 'primary', instructor: 'info', admin: 'danger' };

  return (
    <AdminLayout>
      <div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{total} total users</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: 40 }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field" style={{ width: 160 }}>
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton rows={6} />
        ) : users.length === 0 ? (
          <EmptyState icon={<Users size={48} />} title="No users found" description="No users match your search criteria." />
        ) : (
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--card-raised)' }}>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ background: 'var(--card)' }}
                  >
                    <td className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={user.name} src={user.avatar_url} size={36} />
                        <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: 14 }}>{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="table-cell" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.email}</td>
                    <td className="table-cell">
                      <select
                        value={user.role}
                        onChange={e => changeRole(user, e.target.value)}
                        style={{
                          background: 'var(--card-raised)', color: 'var(--text)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <span className={`badge badge-${user.is_active ? 'success' : 'danger'}`} style={{ fontSize: 11 }}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => toggleActive(user)}
                        style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--card-raised)', color: user.is_active ? 'var(--danger)' : '#10B981', transition: 'var(--transition)' }}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
