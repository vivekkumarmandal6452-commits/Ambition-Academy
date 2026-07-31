import React from 'react';

interface ShikshaLogoProps {
  variant?: 'primary' | 'icon' | 'wordmark';
  size?: number;
  showTagline?: boolean;
  className?: string;
}

export const ShikshaLogo: React.FC<ShikshaLogoProps> = ({
  variant = 'primary',
  size = 36,
  showTagline = false,
  className = '',
}) => {
  // Geometric Shiksha Symbol: Open book + S curve + Rising Flame of Knowledge
  const SymbolSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="shikshaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5722" />
          <stop offset="50%" stopColor="#9C27B0" />
          <stop offset="100%" stopColor="#673AB7" />
        </linearGradient>
        <linearGradient id="shikshaAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#FF5722" />
        </linearGradient>
        <filter id="shikshaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded Squircle Background */}
      <rect x="5" y="5" width="90" height="90" rx="26" fill="url(#shikshaGrad)" />

      {/* Book Base / Left Wing */}
      <path
        d="M 26 68 C 36 60, 46 64, 50 68 C 50 68, 50 34, 50 34 C 44 30, 34 28, 26 34 Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Book Base / Right Wing */}
      <path
        d="M 74 68 C 64 60, 54 64, 50 68 C 50 68, 50 34, 50 34 C 56 30, 66 28, 74 34 Z"
        fill="white"
        fillOpacity="0.8"
      />

      {/* Stylized 'S' Curve & Ascending Flame/Star */}
      <path
        d="M 50 20 C 53 28, 62 30, 62 38 C 62 44, 54 46, 50 50 C 44 54, 38 56, 38 64 C 38 72, 48 76, 50 78 C 42 76, 32 70, 32 60 C 32 50, 42 46, 48 42 C 54 38, 56 34, 54 28 Z"
        fill="url(#shikshaAccent)"
        filter="url(#shikshaGlow)"
      />

      {/* Spark of Wisdom Star at Top */}
      <polygon
        points="50,14 53,22 61,22 55,27 57,35 50,30 43,35 45,27 39,22 47,22"
        fill="#FFD54F"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{SymbolSvg}</div>;
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            fontSize: `${size * 0.7}px`,
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: 'var(--text)',
            lineHeight: 1,
          }}
        >
          SHIKSHA
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: `${Math.max(10, size * 0.26)}px`,
              fontWeight: 600,
              color: 'var(--primary-light)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Learn • Grow • Rise
          </span>
        )}
      </div>
    );
  }

  // Primary variant: Icon + Wordmark
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28, textDecoration: 'none' }} className={className}>
      {SymbolSvg}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            fontSize: `${size * 0.62}px`,
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: 'var(--text)',
            lineHeight: 1,
          }}
        >
          SHIKSHA
        </span>
        {showTagline ? (
          <span
            style={{
              fontSize: `${Math.max(9, size * 0.24)}px`,
              fontWeight: 600,
              color: 'var(--primary-light)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Learn • Grow • Rise
          </span>
        ) : (
          <span
            style={{
              fontSize: `${Math.max(9, size * 0.22)}px`,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 1,
            }}
          >
            Education Platform
          </span>
        )}
      </div>
    </div>
  );
};

export default ShikshaLogo;
