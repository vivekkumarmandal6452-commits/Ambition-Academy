import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Book, Save, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    education: profile?.education || '',
    bio: profile?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account information and preferences.</p>
      </div>

      {/* Profile Card */}
      <motion.div className="card" style={{ padding: 28, marginBottom: 20 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <Avatar name={profile?.name || 'S'} src={profile?.avatar_url} size={72} />
          <div>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem' }}>{profile?.name || 'Student'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{profile?.email}</p>
            <span className="badge badge-primary" style={{ marginTop: 6, fontSize: 11, textTransform: 'capitalize' }}>
              {profile?.role || 'Student'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" style={{ paddingLeft: 38 }} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Education / Class</label>
            <div style={{ position: 'relative' }}>
              <Book size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input type="text" value={form.education} onChange={e => setForm(p => ({ ...p, education: e.target.value }))} className="input-field" style={{ paddingLeft: 38 }} placeholder="e.g., Class 12 / JEE Dropper" />
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="input-field" rows={3} style={{ resize: 'vertical' }} placeholder="Tell us a bit about yourself..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size={18} /> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Settings */}
      <motion.div className="card" style={{ padding: 24 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 20 }}>Preferences</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {theme === 'dark' ? <Moon size={18} style={{ color: 'var(--primary-light)' }} /> : <Sun size={18} style={{ color: '#F59E0B' }} />}
            <div>
              <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Current interface theme</p>
            </div>
          </div>
          <button onClick={toggleTheme} style={{
            width: 44, height: 24, borderRadius: 12,
            background: theme === 'dark' ? 'var(--primary)' : 'var(--text-faint)',
            position: 'relative', cursor: 'pointer', border: 'none', transition: 'var(--transition)',
          }}>
            <span style={{
              position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white',
              left: theme === 'dark' ? 22 : 2, transition: 'left 0.2s ease',
            }} />
          </button>
        </div>

        <div style={{ padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Mail size={18} style={{ color: 'var(--text-muted)' }} />
            <div>
              <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{profile?.email}</p>
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: 10 }}>Verified</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
