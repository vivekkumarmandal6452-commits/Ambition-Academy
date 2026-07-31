import React from 'react';

interface AmbitionLogoProps {
  variant?: 'primary' | 'compact' | 'icon' | 'wordmark';
  size?: number;
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  lightMode?: boolean;
}

export const AmbitionLogo: React.FC<AmbitionLogoProps> = ({
  variant = 'primary',
  size = 36,
  showTagline = false,
  tagline = 'Learn. Achieve. Go Beyond.',
  className = '',
  lightMode = false,
}) => {
  // Modern Geometric Icon Mark: AA Monogram + Upward Achievement Arrow
  const SymbolIcon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="aaGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="aaGradArrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Outer Squircle Container */}
      <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#aaGradPrimary)" />

      {/* Upward Growth Geometry / First 'A' Left Pillar */}
      <path
        d="M 26 74 L 46 22 L 54 22 L 40 74 Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Upward Growth Geometry / Second 'A' Right Pillar */}
      <path
        d="M 74 74 L 54 22 L 46 22 L 60 74 Z"
        fill="white"
        fillOpacity="0.8"
      />

      {/* Dynamic Ascending Apex Chevron / Crossbar */}
      <path
        d="M 28 54 L 50 32 L 72 54 L 62 54 L 50 42 L 38 54 Z"
        fill="url(#aaGradArrow)"
      />

      {/* Achievement Spark Star at Apex */}
      <circle cx="50" cy="22" r="4.5" fill="#F59E0B" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{SymbolIcon}</div>;
  }

  if (variant === 'compact') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.25 }} className={className}>
        {SymbolIcon}
        <span
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            fontSize: `${size * 0.62}px`,
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: lightMode ? '#0F172A' : 'var(--text, #F8FAFC)',
            lineHeight: 1,
          }}
        >
          AA
        </span>
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25em' }}>
          <span
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              fontSize: `${size * 0.58}px`,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: lightMode ? '#0F172A' : 'var(--text, #F8FAFC)',
              lineHeight: 1,
            }}
          >
            Ambition
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              fontSize: `${size * 0.54}px`,
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: 'var(--primary-light, #A78BFA)',
              lineHeight: 1,
            }}
          >
            Academy
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: `${Math.max(9, size * 0.22)}px`,
              fontWeight: 600,
              color: 'var(--text-muted, #94A3B8)',
              letterSpacing: '0.06em',
              marginTop: 3,
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    );
  }

  // Primary Variant: Symbol + "Ambition Academy" Wordmark
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.26, textDecoration: 'none' }} className={className}>
      {SymbolIcon}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25em' }}>
          <span
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              fontSize: `${size * 0.52}px`,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: lightMode ? '#0F172A' : 'var(--text, #F8FAFC)',
              lineHeight: 1.1,
            }}
          >
            Ambition
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              fontSize: `${size * 0.5}px`,
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: 'var(--primary-light, #A78BFA)',
              lineHeight: 1.1,
            }}
          >
            Academy
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: `${Math.max(9, size * 0.21)}px`,
              fontWeight: 600,
              color: 'var(--text-muted, #94A3B8)',
              letterSpacing: '0.05em',
              marginTop: 2,
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};

export default AmbitionLogo;
