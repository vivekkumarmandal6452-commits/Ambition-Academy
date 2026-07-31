import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, BookOpen, ExternalLink, Filter, CheckCircle, Award } from 'lucide-react';
import api from '../../services/api';
import { TableSkeleton, EmptyState, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

interface StudyNote {
  id: string;
  title: string;
  file_url: string;
  type: string;
  subject_name?: string;
  batch_name?: string;
  created_at?: string;
}

const StudyMaterialPage: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    document.title = 'Study Material | Ambition Academy';
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/study-materials');
      setNotes(data?.data || []);
    } catch {
      setNotes([
        {
          id: 'mat_1',
          title: 'Complete Formula Handbook — JEE Physics 2026',
          file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: 'Formula Sheet',
          subject_name: 'Physics',
          batch_name: 'Lakshya JEE 2026',
        },
        {
          id: 'mat_2',
          title: 'Class 12th Optics & Wave Mechanics Chapter Notes',
          file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: 'PDF Notes',
          subject_name: 'Physics',
          batch_name: 'Lakshya JEE 2026',
        },
        {
          id: 'mat_3',
          title: 'NEET Organic Chemistry Reactions & Mechanism Sheet',
          file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: 'PDF Notes',
          subject_name: 'Chemistry',
          batch_name: 'Yakeen NEET 2026',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) ||
                          (note.subject_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || note.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = ['PDF Notes', 'Formula Sheet', 'Assignment', 'DPP Solution'];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 8 }}>
          <FileText size={14} color="#3B82F6" />
          <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>ACADEMIC RESOURCE HUB</span>
        </div>
        <h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
          Study Notes & Materials
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Download chapterwise PDF notes, formula handbooks, and revision sheets uploaded by faculty.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search notes by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 40 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setSelectedType('')}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: selectedType === '' ? 'var(--primary)' : 'var(--card)',
              color: selectedType === '' ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            All Material
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: selectedType === t ? 'var(--primary)' : 'var(--card)',
                color: selectedType === t ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border)', whiteSpace: 'nowrap',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="No study materials found"
          description="Check back soon! Faculty members upload new notes and PDF handbooks regularly."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="badge badge-success" style={{ fontSize: 11, padding: '4px 10px' }}>
                    {item.type || 'PDF Notes'}
                  </span>
                  {item.subject_name && (
                    <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 700 }}>
                      {item.subject_name}
                    </span>
                  )}
                </div>

                <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem', marginBottom: 8, lineHeight: 1.4 }}>
                  {item.title}
                </h3>

                {item.batch_name && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
                    📚 Batch: {item.batch_name}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 10 }}>
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: 13 }}
                  onClick={() => toast.success(`Downloading ${item.title}`)}
                >
                  <Download size={15} /> Download PDF
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterialPage;
