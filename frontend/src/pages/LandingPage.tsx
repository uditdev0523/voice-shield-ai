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
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does VoiceShield AI detect cloned voices without external cloud APIs?',
      a: 'VoiceShield runs an in-house PyTorch neural network (CNN + Bi-GRU with temporal self-attention) locally on the FastAPI backend. It extracts Log-Mel spectrogram features to detect phase discontinuities, vocoder smearing, unnatural pitch stability, and metallic overtones characteristic of synthetic speech models.',
    },
    {
      q: 'Is customer audio saved or stored on disk or used for training?',
      a: 'Strictly no. VoiceShield enforces zero audio retention by default. Ingested audio buffers reside only in transient RAM or short-lived temporary files that are immediately deleted upon inference completion or error. Only anonymous, minimal mathematical metadata is recorded.',
    },
    {
      q: 'Does a high synthetic score automatically block a caller’s bank account?',
      a: 'No. The multi-factor banking risk engine treats voice scores as probabilistic signals, never definitive identity proof. When risk is elevated, the system mandates an independent out-of-band verification (such as an SMS passcode or mobile push token) to protect both the customer and the institution without false-positive harm.',
    },
    {
      q: 'Can VoiceShield AI connect to live banking networks or real credit cards?',
      a: 'No. VoiceShield is explicitly designed as a security evaluation platform and simulation sandbox. It never requests or connects to real bank credentials, card numbers, or live payment rails.',
    },
    {
      q: 'How are degraded audio signals (such as airport background noise) handled?',
      a: 'Before running deep inference, the audio processor conducts signal quality checks for digital clipping, silence, and low SNR. If the audio is degraded or the model uncertainty is elevated, the engine triggers an INCONCLUSIVE_VERIFY action rather than making an overconfident guess.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem 4rem',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent 70%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
          }}>
            <Shield size={14} />
            <span>Next-Generation Voice Anti-Spoofing & Risk Mitigation</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            color: '#ffffff',
          }}>
            Stop Voice Cloning Fraud <br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Before It Happens.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
          }}>
            Protect simulated banking workflows, wire transfers, and identity authorization from generative deepfake voices using localized PyTorch acoustic neural networks and privacy-first multi-factor safeguards.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <span>Get Started</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/banking-simulator" className="btn btn-secondary btn-lg">
              <Landmark size={18} />
              <span>Explore Demo Simulator</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Glass Card */}
        <div style={{ maxWidth: '1100px', margin: '4rem auto 0', padding: '0 1rem' }}>
          <div className="glass-panel" style={{
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.15)',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  VoiceShield AI Security Console — Live Wire Authorization Sandbox
                </span>
              </div>
              <span className="badge badge-success">Local PyTorch Engine Active</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated Audio Ingestion</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>16 kHz PCM Mono</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>✓ Optimal SNR & Peak Checked</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PyTorch CNN-BiGRU Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171', marginTop: '0.25rem' }}>0.94 (Synthetic)</div>
                <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>Phase jitter & vocoder artifacts</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated Financial Risk</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem' }}>$45,000 Wire Transfer</div>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.25rem' }}>New unverified international payee</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Engine Action</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f87171', marginTop: '0.25rem' }}>PAUSE_AND_VERIFY</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Out-of-band callback required</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Engineered for Enterprise Fraud Prevention
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', maxWidth: '640px', margin: '0.75rem auto 0' }}>
              Built specifically to mitigate voice cloning attacks against wire transfers, customer service hotlines, and simulated payments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.25rem' }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Localized PyTorch Deep Learning
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Inference executes 100% locally on the FastAPI backend using a hybrid 3-stage CNN + Bi-GRU with self-attention. Never relies on third-party AI APIs or external clouds.
              </p>
            </div>

            <div className="card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.25rem' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Zero-Retention Audio Privacy
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Customer voice is never stored on disk or used for training. Transient memory buffers are purged immediately upon inference completion, recording only minimal metadata logs.
              </p>
            </div>

            <div className="card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Contextual Banking Risk Engine
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Voice synthesis scores are cross-referenced with transaction amounts, recipient reputation, and signal quality to determine fair, defensible actions without arbitrary lockouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              End-to-End Decision Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              How VoiceShield AI turns raw acoustic signals into defensible mitigation steps
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                1
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Audio Preprocessing</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Downmixes to mono, resamples to 16 kHz, and conducts clipping and SNR quality verification.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                2
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Log-Mel Feature Maps</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Computes 80-bin Mel spectrograms capturing temporal texture and neural vocoder glitches.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#8b5cf6', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                3
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Deep Anti-Spoofing</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                CNN-BiGRU evaluates sequential prosodic consistency and produces a calibrated synthetic probability.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#10b981', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                4
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Mitigation Policy</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Triggers Continue, Step-Up SMS, or Pause & Verify with full human-readable audit justification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Use & Limitations */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ color: '#fbbf24', flexShrink: 0, marginTop: '0.25rem' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Responsible Use & Acoustic Limitations Disclosure
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Voice synthesis detection is a probabilistic risk signal and never serves as definitive proof of identity or fraud. Acoustic models may exhibit domain shift when evaluated on unseen lossy telecommunication codecs (such as low-bitrate GSM or cellular AMR). Legitimate customers should never be summarily rejected solely because a voice model score is elevated; systems must always provide independent, out-of-band verification paths.
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                VoiceShield AI does not claim independent clinical or financial regulatory certification.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem', color: '#ffffff' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="card" style={{ cursor: 'pointer' }} onClick={() => setOpenFaq(isOpen ? null : idx)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: '#ffffff' }}>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                  {isOpen && (
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
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
