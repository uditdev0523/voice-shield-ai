import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Mic,
  Lock,
  ArrowRight,
  Landmark,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileAudio,
  AlertTriangle,
  Radio,
  Sliders,
  Terminal,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does VoiceShield AI detect cloned voices without third-party AI APIs?',
      a: 'VoiceShield runs a local PyTorch neural network (CNN + Bi-GRU with temporal self-attention) directly inside the FastAPI backend. It extracts 80-bin Log-Mel spectrogram features to uncover synthetic phase smearing, vocoder overtone glitches, unnatural pitch flatness, and spectral discontinuities characteristic of neural speech synthesis.',
    },
    {
      q: 'Is customer voice audio retained or stored on disk?',
      a: 'Zero raw audio is retained by default. Audio streams reside only in client RAM and ephemeral, short-lived operating system buffers with randomized UUID paths. These transient files are unlinked in a mandatory Python finally: block immediately after inference. Only anonymous, non-biometric forensic metadata is stored.',
    },
    {
      q: 'Does an elevated synthetic score automatically freeze a customer’s account?',
      a: 'No. The multi-factor banking risk engine treats acoustic scores as probabilistic risk signals, never proof of identity or fraud. When risk is elevated, the engine mandates secondary out-of-band verification (e.g. registered mobile push token, SMS challenge, or callback) to safeguard transactions without punitive false-positive harm.',
    },
    {
      q: 'Can VoiceShield AI connect to live banking networks or real credit cards?',
      a: 'No. VoiceShield is explicitly engineered as a security evaluation sandbox and fraud defense platform. It never asks for, connects to, or stores real financial credentials, credit card numbers, or live payment rails.',
    },
    {
      q: 'How does the system respond to degraded audio, such as cellular background noise?',
      a: 'Prior to deep inference, the audio processor runs automated signal integrity checks for digital clipping, silence, and low Signal-to-Noise Ratio (SNR). If the signal is compromised or the model is uncertain, the system triggers an INCONCLUSIVE_VERIFY policy rather than an overconfident guess.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6rem 1.5rem 4.5rem',
        overflow: 'hidden',
      }}>
        {/* Subtle Ambient Radial Glows */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.06) 45%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Top Pill Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            color: '#c7d2fe',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '2rem',
            letterSpacing: '0.02em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>Zero-Retention Acoustic Anti-Spoofing & Risk Engine</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            marginBottom: '1.6rem',
            color: '#ffffff',
          }}>
            Stop Voice Cloning Fraud <br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Before Payments Clear.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '740px',
            margin: '0 auto 2.8rem',
            fontWeight: 400,
          }}>
            Defend simulated banking workflows, wire authorizations, and phone verification against generative AI voice clones using localized PyTorch deep neural networks and contextual multi-factor risk policies.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <span>Launch Security Console</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/banking-simulator" className="btn btn-secondary btn-lg">
              <Landmark size={18} />
              <span>Simulate Threat Scenarios</span>
            </Link>
          </div>
        </div>

        {/* Live Interactive Sandbox Preview Card */}
        <div style={{ maxWidth: '1120px', margin: '4.5rem auto 0', padding: '0 0.5rem', position: 'relative', zIndex: 1 }}>
          <div className="card" style={{
            padding: '2rem',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            {/* Header bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.25rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f43f5e', opacity: 0.8 }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b', opacity: 0.8 }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', opacity: 0.8 }} />
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={14} color="#818cf8" />
                  <span>VOICESHIELD-GATEWAY // WIRE-TX-84920</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-success">Local PyTorch Engine Active</span>
                <span className="badge badge-neutral">Zero Audio Stored</span>
              </div>
            </div>

            {/* Split Inspection Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
              {/* Box 1: Signal */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  Signal Ingestion & Quality
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
                  16 kHz PCM Mono
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '18px' }}>
                    <span className="wave-bar" style={{ animationDelay: '0.1s' }} />
                    <span className="wave-bar" style={{ animationDelay: '0.3s' }} />
                    <span className="wave-bar" style={{ animationDelay: '0.2s' }} />
                    <span className="wave-bar" style={{ animationDelay: '0.5s' }} />
                    <span className="wave-bar" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>SNR: 24.2 dB (Clean)</span>
                </div>
              </div>

              {/* Box 2: Deep Learning */}
              <div style={{
                background: 'rgba(244, 63, 94, 0.03)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  PyTorch CNN-BiGRU Output
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.25rem' }}>
                  0.941 <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>(Synthetic)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '0.5rem', lineHeight: 1.4 }}>
                  Harmonic vocoder phase jitter detected
                </div>
              </div>

              {/* Box 3: Banking Context */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  Transaction Context
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
                  $45,000.00
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  New unverified overseas counterparty
                </div>
              </div>

              {/* Box 4: Multi-Factor Policy */}
              <div style={{
                background: 'rgba(79, 70, 229, 0.04)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                  Enforced Policy Action
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a5b4fc', marginTop: '0.35rem' }}>
                  PAUSE_AND_VERIFY
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                  Out-of-band callback & fraud desk review
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ padding: '5.5rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.8rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
              Engineered for Serious Financial Fraud Defense
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.65rem', maxWidth: '640px', margin: '0.65rem auto 0', fontSize: '0.98rem' }}>
              High-throughput acoustic defense designed to stop social engineering, executive voice impersonation, and fraudulent payment dispatches.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                marginBottom: '1.35rem',
              }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.55rem', color: '#ffffff' }}>
                Localized PyTorch Deep Learning
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Inference runs entirely in your FastAPI backend using a hybrid 3-stage 2D CNN + 2-layer Bi-GRU with self-attention. Never sends sensitive financial calls to external third-party cloud APIs.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                marginBottom: '1.35rem',
              }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.55rem', color: '#ffffff' }}>
                Zero-Retention Audio Privacy
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Caller audio is strictly ephemeral. Files are created under non-deterministic UUIDs and purged in Python <code>finally:</code> blocks immediately post-analysis. Only minimal mathematical metadata is logged.
              </p>
            </div>

            <div className="card">
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                marginBottom: '1.35rem',
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.55rem', color: '#ffffff' }}>
                Contextual Banking Risk Engine
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Acoustic model scores are cross-referenced with monetary amount, payee reputation, and audio quality. Enforces out-of-band verification without locking out legitimate customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Workflow */}
      <section style={{ padding: '5.5rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.8rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
              Four-Stage Mitigation Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Transforming transient acoustic signals into defensible banking safeguards
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(79, 70, 229, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                01
              </div>
              <h4 style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Acoustic Normalization</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Ingests audio, downmixes to mono, standardizes to 16 kHz, and checks for digital clipping and low SNR.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#67e8f9',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                02
              </div>
              <h4 style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Log-Mel Extraction</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Computes 80-bin Mel spectrograms capturing temporal texture, harmonic phase smearing, and vocoder artifacts.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#c4b5fd',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                03
              </div>
              <h4 style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.05rem' }}>CNN-BiGRU Classification</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Convolutional filters and bidirectional recurrence evaluate micro-prosody and yield calibrated synthetic probability.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                04
              </div>
              <h4 style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Policy Action Mapping</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Maps contextual variables to Continue, Step-Up SMS, or Pause & Verify with defensible audit codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Use Disclosure */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.04)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '14px',
            padding: '1.75rem',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
          }}>
            <div style={{ color: '#fbbf24', flexShrink: 0, marginTop: '0.2rem' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.45rem' }}>
                Ethical Use & Model Limitations Statement
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '0.5rem' }}>
                Acoustic deepfake detection provides a probabilistic indicator, never definitive proof of caller identity. Models may experience domain shift when processing unseen low-bitrate telecommunication codecs (such as cellular AMR or GSM). Legitimate users must never be subjected to irreversible account penalties solely based on acoustic inference; systems must always provide independent, out-of-band verification recourse.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                VoiceShield AI is designed for educational evaluation and simulated fraud prevention.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5.5rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.8rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    borderColor: isOpen ? 'rgba(99, 102, 241, 0.35)' : 'var(--border-subtle)',
                    backgroundColor: isOpen ? 'rgba(18, 24, 38, 0.95)' : 'var(--bg-card)',
                    padding: '1.35rem 1.5rem',
                  }}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.98rem', color: '#ffffff' }}>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#818cf8" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                  {isOpen && (
                    <p style={{ marginTop: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
