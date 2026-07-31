import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={{ borderRadius: 8, ...style }} />
);

export const CardSkeleton: React.FC = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4" style={{ background: 'var(--card)', borderRadius: 12 }}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    {icon && (
      <div className="text-5xl mb-6 opacity-40">{icon}</div>
    )}
    <h3 style={{ color: 'var(--text)', fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>{title}</h3>
    {description && (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400 }}>{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'live';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => (
  <span className={`badge badge-${variant} ${className}`}>{children}</span>
);

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, className = '', showLabel = false, style }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={style}>
      <div className={`progress-bar ${className}`}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>{pct}% complete</p>
      )}
    </div>
  );
};

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name = '?', src, size = 40, className = '' }) => {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
};

interface SpinnerProps { size?: number; }
export const Spinner: React.FC<SpinnerProps> = ({ size = 24 }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid var(--border)`,
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin-slow 0.8s linear infinite',
    }}
  />
);
