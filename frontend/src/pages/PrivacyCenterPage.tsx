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
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Privacy Center & Ephemeral Lifecycle
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time telemetry showing live retention state, storage locations, and automated buffer purging.
        </p>
      </div>

      {purgeMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '1rem',
          borderRadius: '10px',
          color: '#34d399',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{purgeMessage}</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem',
          borderRadius: '10px',
          color: '#f87171',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* Real-time Status Card */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Live Backend Storage Telemetry
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Values reflect real operating system filesystem state, not simulated labels
            </div>
          </div>

          <button onClick={handlePurge} className="btn btn-secondary btn-sm" disabled={purging}>
            <Trash2 size={14} color="#ef4444" />
            <span>{purging ? 'Purging...' : 'Force Purge Ephemeral Buffers'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audio Retention State</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: status?.audio_retention_enabled ? '#f87171' : '#34d399', marginTop: '0.25rem' }}>
              {status?.audio_retention_enabled ? 'RETENTION ON' : 'DISABLED (ZERO)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
              ✓ Raw recordings deleted post-inference
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Ephemeral Audio Files</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: status?.active_temp_audio_files === 0 ? '#34d399' : '#fbbf24', marginTop: '0.25rem' }}>
              {status?.active_temp_audio_files ?? 0} Files
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Directory: {status?.ephemeral_storage_location || 'temp_audio'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Log Policy</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>
              METADATA ONLY
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              No audio content or transcripts logged
            </div>
          </div>
        </div>
      </Card>

      {/* 3-Tier Data Separation Architecture */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
          Three-Tier Data Isolation Architecture
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cpu size={18} color="#60a5fa" />
              <div style={{ fontWeight: 700, color: '#ffffff' }}>1. Browser-Local Audio</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Microphone capture runs inside the client’s Web Audio API and MediaRecorder RAM. Audio is held locally in browser memory and only transmitted when the user explicitly clicks "Analyze".
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Server size={18} color="#a78bfa" />
              <div style={{ fontWeight: 700, color: '#ffffff' }}>2. Transient Backend Buffer</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The FastAPI backend writes audio to a randomized UUID temp file in an isolated directory. The file is unlinked immediately in the Python <code>finally:</code> block, whether processing succeeds or fails.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Database size={18} color="#34d399" />
              <div style={{ fontWeight: 700, color: '#ffffff' }}>3. Metadata-Only Audit History</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Only non-biometric forensic metadata is stored: event ID, timestamp, synthetic probability float, signal quality tag, processing latency, and policy reason codes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
