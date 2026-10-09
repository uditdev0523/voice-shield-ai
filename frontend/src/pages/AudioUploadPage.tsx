import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileAudio,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Landmark,
  X,
  FileUp,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { DetectionResult } from '../services/types';
import { Card } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/StatCard';

export const AudioUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactionAmount, setTransactionAmount] = useState<number>(1500.0);
  const [recipientCategory, setRecipientCategory] = useState<string>('existing_trusted');
  const [isNewRecipient, setIsNewRecipient] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    setResult(null);

    // Validate size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['wav', 'mp3', 'ogg', 'flac'].includes(ext || '')) {
      setError('Invalid format. Please select a WAV, MP3, OGG, or FLAC file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an audio file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeUpload(selectedFile, {
        transaction_amount: transactionAmount,
        recipient_category: recipientCategory,
        is_new_recipient: isNewRecipient,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please verify the backend connection.');
    } finally {
      setLoading(false);
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
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#a5b4fc',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.5rem',
        }}>
          <FileUp size={12} color="#818cf8" />
          Acoustic Forensic Inspection
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
          Audio Upload & Deepfake Forensics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Evaluate recorded audio files against our local PyTorch CNN-BiGRU classifier for metallic vocoder artifacts and synthetic prosody anomalies.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertTriangle size={20} />
          <div>{error}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Upload Dropzone Card */}
        <Card>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
            Acoustic File Ingestion
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Standard audio container: WAV, MP3, OGG, or FLAC (Max 10 MB, ≤ 60 seconds)
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary-light)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '14px',
              padding: '2.75rem 1.5rem',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.015)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              accept=".wav,.mp3,.ogg,.flac"
              style={{ display: 'none' }}
            />
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--color-primary-light)',
            }}>
              <UploadCloud size={28} />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
              {selectedFile ? selectedFile.name : 'Drag & drop an audio file here'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'or click to browse your local device'}
            </div>
          </div>

          {selectedFile && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <FileCheck size={18} color="#34d399" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </Card>

        {/* Simulated Banking Transaction Context Card */}
        <Card>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
            Simulated Counterparty Context
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Optional contextual inputs to evaluate multi-factor banking policy response
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Transaction Amount ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(parseFloat(e.target.value) || 0)}
                className="form-input"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Payee Pedigree
              </label>
              <select
                value={recipientCategory}
                onChange={(e) => setRecipientCategory(e.target.value)}
                className="form-select"
              >
                <option value="existing_trusted">Existing Trusted Payee (Standard)</option>
                <option value="new_unverified">Newly Created / Unknown Payee</option>
                <option value="high_risk_flagged">High Risk / Watchlist Entity</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="isNewRecipientCheck"
                checked={isNewRecipient}
                onChange={(e) => setIsNewRecipient(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary-light)' }}
              />
              <label htmlFor="isNewRecipientCheck" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                First-time disbursement ever directed to this payee
              </label>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={loading || !selectedFile}
              >
                <Activity size={18} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Evaluating Log-Mel Spectrogram...' : 'Run Neural Forensic Analysis'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* Analysis Results */}
      {result && (
        <Card style={{
          borderLeft: `4px solid ${
            result.result_label === 'SYNTHETIC_SUSPECTED'
              ? '#f43f5e'
              : result.result_label === 'GENUINE'
              ? '#10b981'
              : '#f59e0b'
          }`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                FORENSIC EVENT: {result.event_id}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {result.result_label === 'SYNTHETIC_SUSPECTED' && '🚨 Voice Clone Artifacts Suspected'}
                {result.result_label === 'GENUINE' && '✅ Biometrically Natural Speech Cleared'}
                {result.result_label === 'INCONCLUSIVE' && '⚠️ Inconclusive Acoustic Features'}
                {result.result_label === 'MODEL_UNAVAILABLE' && 'ℹ️ Neural Model Offline'}
              </div>
            </div>

            <RiskBadge action={result.risk_action} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Synthetic Score</div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: (result.synthetic_score ?? 0) > 0.7 ? '#fb7185' : (result.synthetic_score ?? 0) > 0.35 ? '#fbbf24' : '#34d399',
                marginTop: '0.2rem',
              }}>
                {result.synthetic_score !== null ? `${(result.synthetic_score * 100).toFixed(1)}%` : 'OFFLINE'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Signal Integrity</div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: result.audio_quality.status === 'optimal' ? '#34d399' : '#fbbf24',
                marginTop: '0.2rem',
              }}>
                {result.audio_quality.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                SNR: {result.audio_quality.snr_db} dB | Clipping: {(result.audio_quality.clipping_ratio * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pipeline Latency</div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--color-primary-light)',
                marginTop: '0.2rem',
              }}>
                {result.processing_latency_ms} ms
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                Duration: {result.audio_duration_seconds}s | Model: {result.model_version}
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(13, 17, 26, 0.6) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '1.1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              Recommended Security Directive
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {result.recommended_next_action}
            </div>
          </div>

          {result.reasons && result.reasons.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Forensic Reason Codes:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {result.reasons.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <strong style={{ color: 'var(--color-primary-light)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {r.code}:
                    </strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
