import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'neutral',
  color = '#3b82f6',
}) => {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            padding: '0.625rem',
            borderRadius: '10px',
            backgroundColor: `${color}18`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: trendDirection === 'up' ? '#34d399' : trendDirection === 'down' ? '#f87171' : 'var(--text-muted)',
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
      return <span className="badge badge-success">Cleared (Low Risk)</span>;
    case 'STEP_UP_VERIFICATION':
      return <span className="badge badge-warning">Step-Up Verification</span>;
    case 'PAUSE_AND_VERIFY':
      return <span className="badge badge-danger">Pause & Out-of-Band Verify</span>;
    case 'INCONCLUSIVE_VERIFY':
      return <span className="badge badge-warning">Inconclusive Audio</span>;
    case 'MANUAL_REVIEW':
      return <span className="badge badge-danger">Fraud Desk Review</span>;
    case 'MODEL_UNAVAILABLE':
      return <span className="badge badge-neutral">Model Offline (Fallback)</span>;
    default:
      return <span className="badge badge-neutral">{action}</span>;
  }
};
