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
  Sparkles,
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
      width: '268px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 0.85rem',
      flexShrink: 0,
      minHeight: 'calc(100vh - 65px)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          padding: '0.25rem 0.75rem 0.65rem 0.75rem',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }} />
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
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.08) 100%)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(99, 102, 241, 0.3)'
                  : '1px solid transparent',
                boxShadow: isActive
                  ? '0 2px 12px rgba(79, 70, 229, 0.12)'
                  : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    style={{
                      color: isActive ? 'var(--color-primary-light)' : 'var(--text-muted)',
                      transition: 'color 0.15s ease',
                    }}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Model & Privacy Footer Pill */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.9rem',
        background: 'linear-gradient(145deg, rgba(17, 22, 36, 0.7), rgba(11, 14, 23, 0.9))',
        backdropFilter: 'blur(16px)',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.25), transparent)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Inference Engine
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: modelAvailable ? '#10b981' : '#f43f5e',
              boxShadow: modelAvailable ? '0 0 8px #10b981' : '0 0 8px #f43f5e',
            }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: modelAvailable ? '#34d399' : '#fb7185' }}>
              {modelAvailable ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
          {modelAvailable ? (modelVersion || 'CNN-BiGRU v1.0') : 'Model Offline'}
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: 'var(--text-secondary)',
          marginTop: '0.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          <ShieldCheck size={12} color="#10b981" />
          <span>Zero Audio Retention</span>
        </div>
      </div>
    </aside>
  );
};
