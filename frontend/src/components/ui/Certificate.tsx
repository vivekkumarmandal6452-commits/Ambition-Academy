import React from 'react';
import AmbitionLogo from '../common/AmbitionLogo';
import { Award, ShieldCheck } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate?: string;
  certificateId?: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseTitle,
  completionDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  certificateId = `AA-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
}) => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 800,
        margin: '0 auto',
        padding: 40,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
        borderRadius: 24,
        border: '4px double rgba(124,58,237,0.4)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        color: '#F8FAFC',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background Decorative Emblem */}
      <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.05, pointerEvents: 'none' }}>
        <AmbitionLogo variant="icon" size={360} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <AmbitionLogo variant="primary" size={38} showTagline={true} />
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            OFFICIAL CREDENTIAL
          </span>
          <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>ID: {certificateId}</p>
        </div>
      </div>

      {/* Certificate Body */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', marginBottom: 20 }}>
          <Award size={18} color="#F59E0B" />
          <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Certificate of Completion
          </span>
        </div>

        <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 12 }}>This is to certify that</p>
        
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#FFFFFF', marginBottom: 16, borderBottom: '2px solid #7C3AED', display: 'inline-block', paddingBottom: 8 }}>
          {studentName}
        </h2>

        <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.7 }}>
          has successfully completed the comprehensive curriculum and requirements for
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#A78BFA', marginBottom: 32 }}>
          {courseTitle}
        </h3>
      </div>

      {/* Footer / Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, marginTop: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>Issued Date</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>{completionDate}</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <ShieldCheck size={28} color="#10B981" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>VERIFIED ACADEMIC RECORD</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'serif', fontSize: '1.3rem', fontStyle: 'italic', color: '#A78BFA', marginBottom: 2 }}>
            Ambition Academic Council
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
