import React from 'react';
import { BookOpen, Shield, Cpu, Lock, Layers, Landmark, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const DocumentationPage: React.FC = () => {
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
          <BookOpen size={12} color="#818cf8" />
          Technical Reference Manual
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
          VoiceShield AI — Architecture & Documentation
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Engineering specifications, neural network layer topology, multi-factor decision rules, and privacy invariants.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Core Architecture */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <Cpu size={22} color="var(--color-primary-light)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              1. Acoustic Anti-Spoofing Neural Architecture
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            VoiceShield AI utilizes a hybrid deep neural network consisting of a 3-stage 2D Convolutional frontend, a 2-layer Bidirectional Gated Recurrent Unit (Bi-GRU), and a temporal self-attention pooling layer.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#ffffff', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Feature Representation</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                80-bin Log-Mel filterbanks extracted via Short-Time Fourier Transform (STFT) with 1024-point FFT window, 512-point hop, and 16,000 Hz target sample rate.
              </span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#ffffff', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Spatial Convolution</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                2D CNN blocks extract spectral-temporal patterns sensitive to neural vocoder phase jitter, high-frequency metallic artifacts, and harmonic discontinuities.
              </span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#ffffff', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Sequential Modeling</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                128-dimensional Bi-GRU processes time-frame representations in forward and backward directions to detect unnatural prosody stability.
              </span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#ffffff', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Self-Attention Pooling</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Temporal self-attention weights compress variable-length utterances into a fixed-dimensional acoustic embedding for binary sigmoid classification.
              </span>
            </div>
          </div>
        </Card>

        {/* Banking Risk Decision Engine */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <Landmark size={22} color="#818cf8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              2. Multi-Factor Banking Risk Engine
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Voice classification outputs are combined with transaction parameters to produce defensible, human-interpretable outcomes:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  <th style={{ padding: '0.85rem 0.65rem' }}>Risk Action</th>
                  <th style={{ padding: '0.85rem 0.65rem' }}>Trigger Criteria</th>
                  <th style={{ padding: '0.85rem 0.65rem' }}>Enforced Mitigation</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 0.65rem', fontWeight: 700, color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>CONTINUE_SIMULATED_FLOW</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Low synthetic score (&lt;0.35), verified payee, clean SNR</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Automated simulated payment cleared</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 0.65rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>STEP_UP_VERIFICATION</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Moderate synthetic score (0.35 - 0.70) or new payee</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Out-of-band SMS or mobile push challenge</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 0.65rem', fontWeight: 700, color: '#fb7185', fontFamily: 'JetBrains Mono, monospace' }}>PAUSE_AND_VERIFY</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>High synthetic score (&gt;0.70) + high value or new payee</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Immediate payment hold & fraud desk callback</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 0.65rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace' }}>INCONCLUSIVE_VERIFY</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Clipping, near silence, low SNR, or high model uncertainty</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Prompt caller for quiet audio or backup auth</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.85rem 0.65rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>MODEL_UNAVAILABLE</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>PyTorch checkpoint absent or offline</td>
                  <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>Safe fallback to non-biometric banking controls</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Privacy & Zero-Retention Specification */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <ShieldCheck size={22} color="#10b981" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              3. Privacy by Design & Zero Retention Guarantee
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Raw caller voice recordings are never stored on disk permanently. Transient memory buffers are unlinked immediately after inference completion or error inside Python's guaranteed <code>finally:</code> block. No voiceprints, biometric templates, or audio transcripts are recorded in the database.
          </p>
        </Card>
      </div>
    </div>
  );
};
