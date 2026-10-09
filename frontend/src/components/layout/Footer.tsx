import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              <Shield size={20} color="#3b82f6" />
              <span>VoiceShield AI</span>
            </div>
            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Anti-spoofing and voice-cloning fraud mitigation tailored for simulated banking, wire transfers, and identity authorization workflows.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
              <Lock size={14} />
              <span>Zero-Audio-Retention Architecture</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Platform Modules
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Live Security Dashboard</Link>
              <Link to="/live-detection" style={{ color: 'inherit', textDecoration: 'none' }}>Real-Time Mic Detection</Link>
              <Link to="/upload-analysis" style={{ color: 'inherit', textDecoration: 'none' }}>Forensic Audio Upload</Link>
              <Link to="/banking-simulator" style={{ color: 'inherit', textDecoration: 'none' }}>Banking Risk Simulator</Link>
              <Link to="/model-performance" style={{ color: 'inherit', textDecoration: 'none' }}>Model Robustness Lab</Link>
            </div>
          </div>

          {/* Privacy & Ethics */}
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Governance & Safety
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link to="/privacy-center" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy by Design</Link>
              <Link to="/documentation" style={{ color: 'inherit', textDecoration: 'none' }}>Model Limitations & Bias</Link>
              <span style={{ color: 'var(--text-muted)' }}>Simulation Rails Only</span>
              <span style={{ color: 'var(--text-muted)' }}>No Biometric Templates Stored</span>
            </div>
          </div>

          {/* Developer Resources */}
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Developer & API
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>Interactive OpenAPI Docs</span>
                <ExternalLink size={12} />
              </a>
              <Link to="/documentation" style={{ color: 'inherit', textDecoration: 'none' }}>Technical Whitepaper</Link>
              <span style={{ color: 'var(--text-muted)' }}>PyTorch CNN + Bi-GRU</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © {new Date().getFullYear()} VoiceShield AI. Engineered for educational and simulated enterprise fraud evaluation.
          </div>
          <div>
            Voice synthesis detection is a probabilistic risk signal and never serves as definitive proof of identity or fraud.
          </div>
        </div>
      </div>
    </footer>
  );
};
