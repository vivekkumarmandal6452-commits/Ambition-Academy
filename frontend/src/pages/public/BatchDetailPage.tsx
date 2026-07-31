import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Users, Clock, BookOpen, Zap, FileText, HelpCircle,
  BarChart2, Star, Calendar, ChevronDown, ChevronUp, ArrowLeft,
  Play, Award, TestTube, CreditCard, QrCode, ShieldCheck, X, Check,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Skeleton, Badge, Spinner } from '../../components/ui';
import { batchService, enrollmentService } from '../../services';
import { Batch, Subject } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BatchDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (slug) loadBatch();
  }, [slug]);

  const loadBatch = async () => {
    try {
      const data = await batchService.getBySlug(slug!);
      setBatch(data);
      if (data?.title) {
        document.title = `${data.title} | Ambition Academy`;
      }
      if (user) {
        const check = await batchService.checkEnrollment(data.id);
        setEnrolled(check.enrolled && check.enrollment?.status === 'active');
      }
    } catch {
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = async () => {
    if (!user) {
      toast.error('Please sign in to enroll');
      navigate('/login');
      return;
    }
    if (!batch) return;

    if (batch.price === 0) {
      // Free batch -> direct enrollment
      await executeEnrollment({ payment_confirmed: false });
    } else {
      // Paid batch -> open payment modal
      setShowPaymentModal(true);
    }
  };

  const executeEnrollment = async (payload?: { payment_confirmed?: boolean; payment_method?: string }) => {
    if (!batch) return;
    setEnrolling(true);
    setProcessingPayment(true);
    try {
      const res = await enrollmentService.enroll(batch.id, payload);
      if (res.success) {
        toast.success(batch.price === 0 ? '🎉 Successfully enrolled in free batch!' : '⚡ Payment successful! Welcome to the batch!');
        setEnrolled(true);
        setShowPaymentModal(false);
        setTimeout(() => navigate('/student/batches'), 600);
      } else {
        toast.error(res.message || 'Enrollment failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
      setProcessingPayment(false);
    }
  };

  const handleConfirmPayment = async () => {
    await executeEnrollment({
      payment_confirmed: true,
      payment_method: selectedMethod,
    });
  };

  const faqs = [
    { q: 'How can I access recorded lectures?', a: 'All recorded lectures are available 24/7 in your batch dashboard. You can watch anytime, from any device.' },
    { q: 'Can I download study materials?', a: 'Yes! All PDFs, notes, and formula sheets can be downloaded from the Study Material section.' },
    { q: 'How do live classes work?', a: 'Live classes are conducted via Zoom/Google Meet. You\'ll receive a join link in your class schedule.' },
    { q: 'Is there a refund policy?', a: 'We offer a 7-day money-back guarantee for paid batches. Contact support for assistance.' },
  ];

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ paddingTop: 80 }}>
          <div className="container" style={{ padding: '40px 24px' }}>
            <Skeleton className="h-64 w-full rounded-2xl mb-8" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ paddingTop: 140, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text)' }}>Batch not found</h2>
          <Link to="/batches" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        {/* Hero */}
        <div style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div className="container">
            <Link to="/batches" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              <ArrowLeft size={16} /> Back to Batches
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start' }}>
              <div>
                {batch.target_exam && (
                  <span style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>{batch.target_exam}</span>
                )}
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
                  {batch.title}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 600, marginBottom: 20 }}>
                  {batch.description}
                </p>

                {/* Instructors */}
                {batch.batch_instructors && batch.batch_instructors.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Faculty:</span>
                    {batch.batch_instructors.map(bi => (
                      <div key={bi.profiles.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700 }}>
                          {bi.profiles.name[0]}
                        </div>
                        <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{bi.profiles.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enroll Card */}
              <div className="card" style={{ padding: 28, width: 320, flexShrink: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  {batch.price === 0 ? (
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>FREE</div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>
                        ₹{batch.price.toLocaleString('en-IN')}
                      </div>
                      {batch.original_price && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--text-faint)', textDecoration: 'line-through', fontSize: 14 }}>₹{batch.original_price.toLocaleString('en-IN')}</span>
                          <span style={{ color: '#10B981', fontSize: 13, fontWeight: 700 }}>
                            {Math.round(((batch.original_price - batch.price) / batch.original_price) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {enrolled ? (
                  <Link to="/student/batches" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    <BookOpen size={16} /> Go to My Batch
                  </Link>
                ) : (
                  <button onClick={handleEnrollClick} disabled={enrolling} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {enrolling ? <Spinner size={18} /> : <><Zap size={16} /> {batch.price === 0 ? 'Enroll Now (Free)' : 'Enroll Now (Buy Batch)'}</>}
                  </button>
                )}

                <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: BookOpen, text: `${batch.total_lectures || 100}+ Video Lectures` },
                    { icon: Zap, text: 'Live Classes Included' },
                    { icon: FileText, text: 'Notes & Study Material' },
                    { icon: TestTube, text: 'Tests & Mock Exams' },
                    { icon: BarChart2, text: 'Daily Practice Problems' },
                    { icon: HelpCircle, text: '24/7 Doubt Support' },
                  ].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        {batch.what_you_learn && batch.what_you_learn.length > 0 && (
          <section style={{ padding: '48px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
              <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>What You'll Learn</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {batch.what_you_learn.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <CheckCircle size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Course Curriculum */}
        {batch.subjects && batch.subjects.length > 0 && (
          <section style={{ padding: '48px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
              <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>Course Structure</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {batch.subjects.map((subject: Subject) => (
                  <div key={subject.id} className="card" style={{ overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenSubject(openSubject === subject.id ? null : subject.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', background: 'none', cursor: 'pointer',
                        color: 'var(--text)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.3rem' }}>{subject.icon || '📖'}</span>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '1rem', textAlign: 'left' }}>{subject.name}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {subject.chapters?.length || 0} chapters
                          </p>
                        </div>
                      </div>
                      {openSubject === subject.id ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                    </button>

                    {openSubject === subject.id && subject.chapters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        {subject.chapters.map(chapter => (
                          <div key={chapter.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                            <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>
                              {chapter.title}
                            </p>
                            {chapter.lectures && chapter.lectures.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {chapter.lectures.map(lecture => (
                                  <div key={lecture.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
                                    <Play size={12} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{lecture.title}</span>
                                    {lecture.is_preview && (
                                      <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700, marginLeft: 'auto' }}>FREE PREVIEW</span>
                                    )}
                                    {lecture.duration_seconds && (
                                      <span style={{ color: 'var(--text-faint)', fontSize: 11, marginLeft: 'auto' }}>
                                        {Math.floor(lecture.duration_seconds / 60)}min
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        <section style={{ padding: '48px 0 80px' }}>
          <div className="container">
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>Frequently Asked Questions</h2>
            <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((faq, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', cursor: 'pointer', color: 'var(--text)', textAlign: 'left' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }}
                      style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}
                    >
                      <p style={{ color: 'var(--text-muted)', fontSize: 14, paddingTop: 12, lineHeight: 1.7 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Modern PW-style Payment Modal for Paid Batches */}
      <AnimatePresence>
        {showPaymentModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                width: '100%', maxWidth: 520, background: 'var(--card)',
                borderRadius: 24, border: '1px solid var(--border)',
                padding: '24px 28px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="var(--primary-light)" />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                      Checkout & Payment
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Ambition Academy Secure Gateway</p>
                  </div>
                </div>
                <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Order Summary */}
              <div style={{ background: 'var(--card-raised)', borderRadius: 16, padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Order Summary
                </p>
                <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 12 }}>
                  {batch.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Course Fee</span>
                  <span>₹{batch.original_price || (batch.price * 2)}</span>
                </div>
                {batch.original_price && batch.original_price > batch.price && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10B981', marginBottom: 6 }}>
                    <span>Special Scholarship Discount</span>
                    <span>-₹{batch.original_price - batch.price}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                  <span>Platform Fee & Tax</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15 }}>Total Payable</span>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 900, fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>
                    ₹{batch.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Select Payment Method</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { id: 'upi', label: 'UPI / QR Code', icon: QrCode },
                  { id: 'card', label: 'Debit/Credit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: BookOpen },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    style={{
                      padding: '12px 8px', borderRadius: 12,
                      background: selectedMethod === m.id ? 'rgba(124,58,237,0.15)' : 'var(--card-raised)',
                      border: selectedMethod === m.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      color: selectedMethod === m.id ? 'var(--primary-light)' : 'var(--text)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <m.icon size={20} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Method Detail View */}
              {selectedMethod === 'upi' && (
                <div style={{ textAlign: 'center', background: 'var(--card-raised)', padding: 16, borderRadius: 14, marginBottom: 20, border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Scan QR or Enter UPI ID (GPay / PhonePe / Paytm / BHIM)
                  </p>
                  <div style={{ width: 130, height: 130, margin: '0 auto 12px', background: 'white', padding: 8, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=ambitionacademy@upi%26pn=AmbitionAcademy%26am=${batch.price}`} alt="UPI QR" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 13, textTransform: 'lowercase' }}
                  />
                </div>
              )}

              {selectedMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  <input type="text" placeholder="Card Number (4000 0000 0000 0000)" className="input-field" defaultValue="4532 •••• •••• 8829" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input type="text" placeholder="MM/YY" className="input-field" defaultValue="12/28" />
                    <input type="password" placeholder="CVV" className="input-field" defaultValue="***" maxLength={3} />
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div style={{ marginBottom: 20 }}>
                  <select className="input-field">
                    <option>Select Bank (SBI / HDFC / ICICI / Axis)</option>
                    <option>State Bank of India (SBI)</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={processingPayment}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, fontWeight: 700 }}
              >
                {processingPayment ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Spinner size={20} /> Processing Payment...
                  </div>
                ) : (
                  <>Pay ₹{batch.price.toLocaleString('en-IN')} & Enroll Now</>
                )}
              </button>

              <p style={{ color: 'var(--text-faint)', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
                🔒 256-Bit SSL Encrypted. Guaranteed instant enrollment upon completion.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default BatchDetailPage;
