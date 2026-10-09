import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Database,
  Cpu,
  RefreshCw,
  EyeOff,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { PrivacyStatus } from '../services/types';
import { Card } from '../components/ui/Card';

export const PrivacyCenterPage: React.FC = () => {
  const [status, setStatus] = useState<PrivacyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPrivacyStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load privacy status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handlePurge = async () => {
    setPurging(true);
    setPurgeMessage(null);
    try {
      const res = await api.purgeEphemeralAudio();
      setPurgeMessage(res.message || 'Ephemeral audio storage verified clean.');
      loadStatus();
    } catch (err: any) {
      setError(err.message || 'Purge failed.');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1160px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.65rem',
          borderRadius: '999px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#6ee7b7',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.5rem',
        }}>
          <EyeOff size={12} color="#10b981" />
          Zero-Knowledge Compliance
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
          Privacy Center & Ephemeral Lifecycle
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Real-time operating system filesystem telemetry verifying zero raw speech retention and automated buffer disposal.
        </p>
      </div>

      {purgeMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#34d399',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{purgeMessage}</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* Real-time Status Card */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Filesystem Buffer Verification
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time directory audit conducted directly on OS partition
            </div>
          </div>

          <button onClick={handlePurge} className="btn btn-secondary btn-sm" disabled={purging} style={{ color: '#fb7185' }}>
            <Trash2 size={14} />
            <span>{purging ? 'Purging Storage...' : 'Force Buffer Sweep'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.04)',
            padding: '1.1rem',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Raw Audio Retention
            </div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: status?.audio_retention_enabled ? '#fb7185' : '#34d399',
              marginTop: '0.35rem',
            }}>
              {status?.audio_retention_enabled ? 'RETENTION ENABLED' : 'STRICT ZERO (OFF)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} />
              <span>Unlinked in Python finally block</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1.1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Ephemeral Files
            </div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: status?.active_temp_audio_files === 0 ? '#34d399' : '#fbbf24',
              marginTop: '0.35rem',
            }}>
              {status?.active_temp_audio_files ?? 0} Buffers
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontFamily: 'JetBrains Mono, monospace' }}>
              Dir: {status?.ephemeral_storage_location || 'temp_audio'}
            </div>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.04)',
            padding: '1.1rem',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audit Logging Mode
            </div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--color-primary-light)',
              marginTop: '0.35rem',
            }}>
              METADATA ONLY
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              No audio wavs, samples, or transcripts logged
            </div>
          </div>
        </div>
      </Card>

      {/* 3-Tier Data Separation Architecture */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
          Three-Tier Data Isolation Framework
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1.35rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid var(--color-primary-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
              <Cpu size={18} color="var(--color-primary-light)" />
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>1. Browser-Local Audio</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Microphone stream is held strictly inside Web Audio API RAM. Raw audio is never transmitted across network interfaces until explicit user click initiation.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1.35rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid #818cf8',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
              <Server size={18} color="#818cf8" />
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>2. Ephemeral Backend Buffer</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Audio bytes are assigned a cryptographic UUID, analyzed by PyTorch, and immediately unlinked inside Python's guaranteed <code>finally:</code> block.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1.35rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid #10b981',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
              <Database size={18} color="#10b981" />
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>3. Metadata-Only SQLite</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Audit tables record non-biometric event IDs, execution timestamps, synthetic scores, channel SNR metrics, and rule codes. Zero voice vectors survive.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
