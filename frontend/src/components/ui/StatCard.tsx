import React from 'react';
import { Card } from './Card';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string; // Accent color hex
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'neutral',
  color = '#6366f1',
}) => {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle Ambient Tone Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.85,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginTop: '0.35rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            fontFamily: typeof value === 'number' || (typeof value === 'string' && value.includes('ms')) ? 'JetBrains Mono, sans-serif' : 'inherit',
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            padding: '0.625rem',
            borderRadius: '12px',
            background: `radial-gradient(circle at center, ${color}22 0%, ${color}0a 100%)`,
            border: `1px solid ${color}33`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 10px ${color}15`,
          }}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div style={{
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: trendDirection === 'up' ? '#34d399' : trendDirection === 'down' ? '#fb7185' : 'var(--text-muted)',
        }}>
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
};

export const RiskBadge: React.FC<{ action: string }> = ({ action }) => {
  switch (action) {
    case 'CONTINUE_SIMULATED_FLOW':
    case 'CLEARED':
      return (
        <span className="badge badge-success" style={{ gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}>
          <CheckCircle2 size={12} />
          <span>Cleared (Low Risk)</span>
        </span>
      );
    case 'STEP_UP_VERIFICATION':
      return (
        <span className="badge badge-warning" style={{ gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}>
          <AlertTriangle size={12} />
          <span>Step-Up Verification</span>
        </span>
      );
    case 'PAUSE_AND_VERIFY':
      return (
        <span className="badge badge-danger" style={{ gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}>
          <ShieldAlert size={12} />
          <span>Pause & Verify</span>
        </span>
      );
    case 'INCONCLUSIVE_VERIFY':
      return (
        <span className="badge badge-warning" style={{ gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}>
          <HelpCircle size={12} />
          <span>Inconclusive Audio</span>
        </span>
      );
    case 'MANUAL_REVIEW':
      return (
        <span className="badge badge-danger" style={{ gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}>
          <AlertCircle size={12} />
          <span>Fraud Desk Review</span>
        </span>
      );
    case 'MODEL_UNAVAILABLE':
      return (
        <span className="badge badge-neutral" style={{ gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}>
          <span>Model Offline (Fallback)</span>
        </span>
      );
    default:
      return <span className="badge badge-neutral">{action.replace(/_/g, ' ')}</span>;
  }
};
