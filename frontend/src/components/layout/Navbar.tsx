import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { SystemHealth } from '../../services/types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Overview' },
    { to: '/dashboard', label: 'Console' },
    { to: '/live-detection', label: 'Live Mic' },
    { to: '/upload-analysis', label: 'Audio Ingest' },
    { to: '/banking-simulator', label: 'Fraud Sandbox' },
    { to: '/analytics', label: 'Intelligence' },
    { to: '/privacy-center', label: 'Privacy Core' },
    { to: '/model-performance', label: 'Model Benchmarks' },
    { to: '/investigation-history', label: 'Audit Trail' },
    { to: '/documentation', label: 'Specs' },
  ];

  return (
    <nav style={{
      background: 'rgba(6, 8, 13, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.8rem 1.75rem',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '0.55rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}>
            <Shield size={20} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#ffffff' }}>VoiceShield</span>
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
              }}>AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              Synthetic Speech Defense
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.35rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Telemetry pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            background: health?.model.available ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
            border: `1px solid ${health?.model.available ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
            color: health?.model.available ? '#34d399' : '#fb7185',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: health?.model.available ? '#10b981' : '#f43f5e',
              boxShadow: health?.model.available ? '0 0 10px #10b981' : '0 0 10px #f43f5e',
              display: 'inline-block',
            }} />
            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
              {health?.model.available ? `CNN-BiGRU Local` : 'Model Standby'}
            </span>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
          >
            <span>API</span>
            <ExternalLink size={12} />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: '0.85rem',
          padding: '1rem',
          background: 'rgba(11, 14, 23, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.65rem 0.95rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === link.to ? '#ffffff' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};
