import React from 'react';
import { BookOpen, Shield, Cpu, Lock, Layers, Landmark, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const DocumentationPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          VoiceShield AI — Architecture & Documentation
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Technical specifications, neural network topology, privacy boundaries, and ethical guidelines.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Core Architecture */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Cpu size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              1. Acoustic Anti-Spoofing Architecture
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            VoiceShield AI utilizes a hybrid deep neural network consisting of a 3-stage 2D Convolutional frontend, a 2-layer Bidirectional Gated Recurrent Unit (Bi-GRU), and a temporal self-attention pooling layer.
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            <li><strong>Feature Representation:</strong> 80-bin Log-Mel filterbanks extracted via Short-Time Fourier Transform (STFT) with 1024-point FFT window, 512-point hop, and 16,000 Hz target sample rate.</li>
            <li><strong>Spatial Representation:</strong> 2D CNN blocks extract spectral-temporal patterns sensitive to neural vocoder phase jitter, high-frequency metallic artifacts, and harmonic discontinuities.</li>
            <li><strong>Sequential Modeling:</strong> 128-dimensional Bi-GRU processes time-frame representations in forward and backward directions to detect unnatural prosody stability.</li>
            <li><strong>Attention Pooling:</strong> Temporal self-attention weights compress variable-length utterances into a fixed-dimensional acoustic embedding for binary sigmoid classification.</li>
          </ul>
        </Card>

        {/* Banking Risk Decision Engine */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Landmark size={20} color="#6366f1" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              2. Multi-Factor Banking Risk Engine
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            Voice classification outputs are combined with transaction parameters to produce defensible, human-interpretable outcomes:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem' }}>Risk Action</th>
                  <th style={{ padding: '0.5rem' }}>Trigger Criteria</th>
                  <th style={{ padding: '0.5rem' }}>Enforced Mitigation</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(30, 43, 72, 0.4)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: '#34d399' }}>CONTINUE_SIMULATED_FLOW</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Low synthetic score (&lt;0.35), verified payee, clean SNR</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Automated simulated payment cleared</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(30, 43, 72, 0.4)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: '#fbbf24' }}>STEP_UP_VERIFICATION</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Moderate synthetic score (0.35 - 0.70) or new payee</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Out-of-band SMS or mobile push challenge</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(30, 43, 72, 0.4)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: '#f87171' }}>PAUSE_AND_VERIFY</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>High synthetic score (&gt;0.70) + high value or new payee</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Immediate payment hold & fraud desk callback</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(30, 43, 72, 0.4)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: '#fbbf24' }}>INCONCLUSIVE_VERIFY</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Clipping, near silence, low SNR, or high model uncertainty</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Prompt caller for quiet audio or backup auth</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>MODEL_UNAVAILABLE</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>PyTorch checkpoint absent or offline</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Safe fallback to non-biometric banking controls</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Privacy & Zero-Retention Specification */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lock size={20} color="#10b981" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              3. Privacy by Design & Zero Retention
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Raw caller voice recordings are never stored on disk permanently. Transient memory buffers are unlinked immediately after inference completion or error. No voiceprints, biometric templates, or audio transcripts are recorded in the database.
          </p>
        </Card>

        {/* Interactive API Docs Link */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Interactive FastAPI OpenAPI Documentation
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Explore live endpoints, schema models, and test requests using Swagger UI.
              </div>
            </div>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <span>Open /docs</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};
