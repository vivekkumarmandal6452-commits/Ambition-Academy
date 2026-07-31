import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Clock, BookOpen, Star, ArrowRight, Zap } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { CardSkeleton, EmptyState, Badge } from '../../components/ui';
import { batchService } from '../../services';
import { Batch } from '../../types';

const levelColors = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

const BatchCard: React.FC<{ batch: Batch }> = ({ batch }) => {
  const instructors = batch.batch_instructors || [];
  const instructor = instructors[0]?.profiles;

  return (
    <motion.div
      className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 160, background: batch.thumbnail_url ? `url(${batch.thumbnail_url}) center/cover` : 'var(--grad-primary)',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        {batch.is_featured && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 700 }}>FEATURED</span>
          </div>
        )}
        <div style={{
          position: 'absolute', top: 12, right: 12,
        }}>
          <span className="badge" style={{
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            color: levelColors[batch.level], fontSize: 10, textTransform: 'capitalize',
          }}>
            {batch.level}
          </span>
        </div>
        {!batch.thumbnail_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={48} color="rgba(255,255,255,0.5)" />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {batch.target_exam && (
          <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>
            {batch.target_exam}
          </span>
        )}
        <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', marginBottom: 8, flex: 1 }}>
          {batch.title}
        </h3>

        {instructor && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            By {instructor.name}
          </p>
        )}

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
            <Users size={13} /> {batch.enrolled_count.toLocaleString()}
          </div>
          {batch.total_lectures && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
              <BookOpen size={13} /> {batch.total_lectures} lectures
            </div>
          )}
          {batch.start_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
              <Clock size={13} /> {new Date(batch.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            {batch.price === 0 ? (
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '1.1rem' }}>FREE</span>
            ) : (
              <div>
                <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>
                  ₹{batch.price.toLocaleString('en-IN')}
                </span>
                {batch.original_price && (
                  <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 6, textDecoration: 'line-through' }}>
                    ₹{batch.original_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>
          <Link
            to={`/batches/${batch.slug}`}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            View Batch <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.title = 'Batches | Ambition Academy';
    loadBatches();
  }, [search, level, page]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await batchService.getAll({ page, limit: 12, search: search || undefined, level: level || undefined });
      if (res.success) {
        setBatches(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        {/* Header */}
        <div style={{ background: 'var(--bg-deep)', padding: '48px 0', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-flex' }}>
                <BookOpen size={12} /> All Batches
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Find Your Perfect <span className="grad-text">Learning Batch</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', maxWidth: 500 }}>
                {total} batches available. Expert faculty, structured curriculum, and proven results.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '16px 0', position: 'sticky', top: 64, zIndex: 40 }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                />
              </div>

              {/* Level Filter */}
              <select
                value={level}
                onChange={e => { setLevel(e.target.value); setPage(1); }}
                className="input-field"
                style={{ width: 160 }}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batches Grid */}
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : batches.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={48} />}
              title="No batches found"
              description={search ? `No results for "${search}". Try different keywords.` : "No batches available right now. Check back soon!"}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {batches.map(b => <BatchCard key={b.id} batch={b} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BatchesPage;
