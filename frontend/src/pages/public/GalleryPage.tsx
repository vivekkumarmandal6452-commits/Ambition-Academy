import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Filter, Calendar } from 'lucide-react';
import api from '../../services/api';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  description?: string;
  created_at: string;
}

const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data } = await api.get('/api/gallery');
      if (data.success) {
        setItems(data.data || []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category || 'General')))];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => (i.category || 'General') === activeCategory);

  return (
    <div style={{ padding: '100px 0 60px', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>
            <Image size={14} /> Campus & Activity Gallery
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
            Life at <span className="grad-text">Ambition Academy</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Explore our interactive classrooms, student celebrations, rankers felicitations, and state-of-the-art learning environment.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
                background: activeCategory === cat ? 'var(--primary)' : 'var(--card)',
                color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                border: activeCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Image size={40} style={{ color: 'var(--text-faint)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>No photos in this category yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                className="card"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                whileHover={{ y: -6 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="hover:scale-105"
                  />
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: 12, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 100,
                  }}>
                    {item.category || 'Gallery'}
                  </span>
                </div>

                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, flex: 1, marginBottom: 12 }}>
                      {item.description}
                    </p>
                  )}
                  <p style={{ color: 'var(--text-faint)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
                    <Calendar size={13} /> {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
