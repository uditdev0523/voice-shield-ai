import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic,
  UploadCloud,
  Landmark,
  BarChart3,
  ShieldCheck,
  Cpu,
  History,
  Settings,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  modelAvailable?: boolean;
  modelVersion?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ modelAvailable, modelVersion }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live-detection', label: 'Live Mic Detection', icon: Mic },
    { to: '/upload-analysis', label: 'Audio Upload & Forensics', icon: UploadCloud },
    { to: '/banking-simulator', label: 'Banking Simulator', icon: Landmark },
    { to: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { to: '/privacy-center', label: 'Privacy Center', icon: ShieldCheck },
    { to: '/model-performance', label: 'Model Performance Lab', icon: Cpu },
    { to: '/investigation-history', label: 'Investigation History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/documentation', label: 'About & Docs', icon: BookOpen },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 0.75rem',
      flexShrink: 0,
      minHeight: 'calc(100vh - 65px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          padding: '0 0.75rem 0.75rem 0.75rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Security Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Model & Privacy Footer Pill */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.875rem',
        background: 'var(--bg-card)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Inference Engine
          </span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: modelAvailable ? '#10b981' : '#ef4444',
          }} />
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {modelAvailable ? (modelVersion || 'CNN-BiGRU v1.0') : 'Model Offline'}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Zero Audio Retention Active
        </div>
      </div>
    </aside>
  );
};
