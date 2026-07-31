import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, ChevronDown, ChevronUp, CheckCircle, FileText,
  DownloadCloud, MessageSquare, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { batchService, progressService } from '../../services';
import { Batch, Lecture } from '../../types';
import { Skeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const LecturePlayer: React.FC = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const batchId = new URLSearchParams(window.location.search).get('batch');
  const videoRef = useRef<HTMLIFrameElement>(null);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [progress, setProgress] = useState<{ watched_seconds: number; is_completed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [allLectures, setAllLectures] = useState<Lecture[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'discussion'>('description');
  const [saveInterval, setSaveInterval] = useState<number | null>(null);

  useEffect(() => {
    if (batchId) loadBatch();
  }, [batchId, lectureId]);

  useEffect(() => {
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [saveInterval]);

  const loadBatch = async () => {
    try {
      // We need to load batch by id — for now use slug approach from URL
      // Load progress for current lecture
      if (lectureId) {
        const prog = await progressService.getLectureProgress(lectureId);
        setProgress(prog);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const markComplete = async () => {
    if (!lectureId) return;
    try {
      await progressService.saveProgress({
        lecture_id: lectureId,
        watched_seconds: currentLecture?.duration_seconds || 0,
        duration_seconds: currentLecture?.duration_seconds || 0,
        is_completed: true,
      });
      setProgress(prev => ({ ...prev!, is_completed: true }));
      toast.success('Lecture marked as complete! ✓');
    } catch {
      toast.error('Failed to save progress');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div style={{ padding: '12px 20px', background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/student/batches" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <ChevronLeft size={16} /> Back to Batch
        </Link>
        <span style={{ color: 'var(--border)', fontSize: 20 }}>|</span>
        <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
          {currentLecture?.title || 'Loading...'}
        </span>
        {progress?.is_completed && (
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
            <CheckCircle size={12} /> Completed
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', overflow: 'hidden' }}>
        {/* Video + Content */}
        <div style={{ overflow: 'auto' }}>
          {/* Video Player */}
          <div style={{ background: '#000', position: 'relative', paddingTop: '56.25%' }}>
            {loading ? (
              <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                {currentLecture?.video_url ? (
                  <iframe
                    ref={videoRef}
                    src={currentLecture.video_url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <Play size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
                    <p style={{ opacity: 0.7 }}>Select a lecture from the playlist</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lecture Info */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>
                  {currentLecture?.title || 'Select a lecture'}
                </h2>
              </div>
              {!progress?.is_completed && currentLecture && (
                <button onClick={markComplete} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}>
                  <CheckCircle size={14} /> Mark Complete
                </button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {(['description', 'notes', 'discussion'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 16px', fontSize: 13, fontWeight: 500,
                  color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                  background: 'none', cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'var(--transition)',
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 14 }}>
                {currentLecture?.description || 'No description available for this lecture.'}
              </p>
            )}
            {activeTab === 'notes' && (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                <p>Study notes and resources will appear here.</p>
              </div>
            )}
            {activeTab === 'discussion' && (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                <Link to="/student/doubts" className="btn-secondary" style={{ display: 'inline-flex' }}>
                  <MessageSquare size={14} /> Ask a Doubt
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div style={{ borderLeft: '1px solid var(--border)', overflow: 'auto', background: 'var(--card)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem' }}>Course Content</h3>
          </div>
          <div style={{ padding: 8 }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 6 }} />
              ))
            ) : allLectures.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 12px', textAlign: 'center' }}>
                Navigate to a batch to start watching lectures.
              </p>
            ) : (
              allLectures.map((lecture, i) => (
                <Link key={lecture.id} to={`/student/lecture/${lecture.id}?batch=${batchId}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                    background: lecture.id === lectureId ? 'rgba(124,58,237,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderLeft: lecture.id === lectureId ? '3px solid var(--primary)' : '3px solid transparent',
                    cursor: 'pointer', transition: 'var(--transition)',
                  }}>
                    <Play size={14} style={{ color: lecture.id === lectureId ? 'var(--primary-light)' : 'var(--text-faint)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: lecture.id === lectureId ? 'var(--text)' : 'var(--text-muted)', fontSize: 13, fontWeight: lecture.id === lectureId ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {i + 1}. {lecture.title}
                      </p>
                      {lecture.duration_seconds && (
                        <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>{Math.floor(lecture.duration_seconds / 60)} min</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturePlayer;
