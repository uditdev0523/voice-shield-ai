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
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Audio Upload & Forensic Analysis
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Evaluate recorded calls for synthetic speech, metallic vocoder artifacts, and banking fraud risk.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          color: '#f87171',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertTriangle size={20} />
          <div>{error}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Upload Dropzone Card */}
        <Card>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Select Audio File
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Supported formats: WAV, MP3, OGG, FLAC (Max 10 MB, 60 seconds)
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#3b82f6' : 'var(--border-active)'}`,
              borderRadius: '12px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              accept=".wav,.mp3,.ogg,.flac"
              style={{ display: 'none' }}
            />
            <UploadCloud size={44} color="#60a5fa" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedFile ? selectedFile.name : 'Drag & drop an audio file here'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'or click to browse your local computer'}
            </div>
          </div>

          {selectedFile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <FileAudio size={16} color="#34d399" />
                <span style={{ fontWeight: 500 }}>{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </Card>

        {/* Simulated Banking Transaction Context Card */}
        <Card>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Simulated Banking Context
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Evaluate how financial amount and recipient profile modulate risk decisions
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Recipient Category
              </label>
              <select
                value={recipientCategory}
                onChange={(e) => setRecipientCategory(e.target.value)}
                className="form-select"
              >
                <option value="existing_trusted">Existing Trusted Payee (Low Base Risk)</option>
                <option value="new_unverified">Newly Added Recipient (Medium Risk)</option>
                <option value="high_risk_flagged">High Risk / Previously Flagged Account</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="isNewRecipientCheck"
                checked={isNewRecipient}
                onChange={(e) => setIsNewRecipient(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="isNewRecipientCheck" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                First-time transaction to this counterparty
              </label>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading || !selectedFile}
              >
                <Activity size={18} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Processing via Local PyTorch...' : 'Analyze Audio & Evaluate Risk'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* Analysis Results */}
      {result && (
        <Card style={{ borderLeft: `4px solid ${result.result_label === 'SYNTHETIC_SUSPECTED' ? '#ef4444' : result.result_label === 'GENUINE' ? '#10b981' : '#f59e0b'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Forensic Result for Event {result.event_id}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {result.result_label === 'SYNTHETIC_SUSPECTED' && '🚨 Synthetic Voice Cloning Suspected'}
                {result.result_label === 'GENUINE' && '✅ Acoustically Natural Human Speech'}
                {result.result_label === 'INCONCLUSIVE' && '⚠️ Inconclusive Acoustic Features'}
                {result.result_label === 'MODEL_UNAVAILABLE' && 'ℹ️ Inference Model Offline'}
              </div>
            </div>

            <RiskBadge action={result.risk_action} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Synthetic Speech Probability</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: (result.synthetic_score ?? 0) > 0.7 ? '#f87171' : '#34d399', marginTop: '0.2rem' }}>
                {result.synthetic_score !== null ? `${(result.synthetic_score * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audio Signal Integrity</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: result.audio_quality.status === 'optimal' ? '#34d399' : '#fbbf24', marginTop: '0.2rem' }}>
                {result.audio_quality.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                SNR: {result.audio_quality.snr_db} dB | Clipping: {(result.audio_quality.clipping_ratio * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processing Telemetry</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.2rem' }}>
                {result.processing_latency_ms} ms
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Duration: {result.audio_duration_seconds}s | Model: {result.model_version}
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              Recommended Mitigation Action
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {result.recommended_next_action}
            </div>
          </div>

          {result.reasons && result.reasons.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Forensic Reason Codes:
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {result.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{r.code}:</strong> {r.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
