import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  Info,
  Sliders,
  Sparkles,
  CheckCircle2,
  Lock,
  DollarSign,
  UserCheck,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import {
  BankingSimulationRequest,
  BankingSimulationResponse,
  BankingScenario,
} from '../services/types';
import { Card } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/StatCard';

export const BankingSimulatorPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<BankingScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [form, setForm] = useState<BankingSimulationRequest>({
    transaction_type: 'wire_transfer',
    transaction_amount: 15000.0,
    recipient_category: 'new_unverified',
    is_new_recipient: true,
    historical_caller_flagged: false,
    simulated_voice_score: 0.92,
    audio_quality_override: 'optimal',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BankingSimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getBankingScenarios()
      .then((data) => {
        setScenarios(data);
        if (data.length > 0) {
          applyScenario(data[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const applyScenario = (sc: BankingScenario) => {
    setSelectedScenarioId(sc.id);
    setForm(sc.request);
    setResult(null);
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.simulateBanking(form);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '#94a3b8';
    if (score > 0.7) return '#fb7185';
    if (score > 0.35) return '#fbbf24';
    return '#34d399';
  };

  return (
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1360px', margin: '0 auto' }}>
      {/* Title */}
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
          <Landmark size={12} color="#818cf8" />
          Multi-Factor Decision Sandbox
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.025em',
        }}>
          Banking Transaction Risk Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Evaluate how neural acoustic clone detection interacts with transaction value, payee pedigree, and channel SNR to stop fraud without unnecessary friction.
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div style={{
        backgroundColor: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        padding: '0.9rem 1.25rem',
        borderRadius: '12px',
        color: '#c7d2fe',
        fontSize: '0.85rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Info size={18} color="#818cf8" />
        <div>
          <strong style={{ color: '#ffffff' }}>Simulation Sandbox:</strong> Runs strictly against synthetic payment vectors. Never interacts with live ACH/SWIFT rails or client PII.
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* Preset Scenarios Carousel / Badges */}
      <div style={{ marginBottom: '2.25rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: '0.85rem',
          letterSpacing: '0.06em',
        }}>
          Benchmark Attack & Legitimate Scenarios
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => applyScenario(sc)}
                className="card card-interactive"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'rgba(99, 102, 241, 0.6)' : 'var(--border-subtle)',
                  background: isSelected
                    ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.14) 0%, rgba(13, 17, 26, 0.9) 100%)'
                    : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.18)' : 'var(--shadow-card)',
                  padding: '1.15rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                  {sc.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                  {sc.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <RiskBadge action={sc.expected_outcome} />
                  <span style={{ fontSize: '0.75rem', color: isSelected ? '#a5b4fc' : 'var(--text-muted)', fontWeight: 600 }}>
                    {isSelected ? 'Selected' : 'Load →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Form & Result Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Form Controls */}
        <Card>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Sliders size={18} color="#818cf8" />
            <span>Simulated Payment Parameters</span>
          </div>

          <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Payment Modality
              </label>
              <select
                value={form.transaction_type}
                onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
                className="form-select"
              >
                <option value="wire_transfer">High-Value International Wire Transfer</option>
                <option value="peer_payment">Instant Real-Time Payment (RTP / P2P)</option>
                <option value="account_change">Sensitive Credential Modification (SIM/MFA)</option>
                <option value="loan_request">Line of Credit / Emergency Drawdown</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Disbursement Amount ($ USD)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={form.transaction_amount}
                  onChange={(e) => setForm({ ...form, transaction_amount: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Counterparty Pedigree
              </label>
              <select
                value={form.recipient_category}
                onChange={(e) => setForm({ ...form, recipient_category: e.target.value })}
                className="form-select"
              >
                <option value="existing_trusted">Verified Historical Payee (Known)</option>
                <option value="new_unverified">Newly Created / Unknown Payee</option>
                <option value="high_risk_flagged">High Risk / Watchlist Match</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Acoustic Synthetic Score (0.00 = Natural, 1.00 = Clone)
                </label>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: getScoreColor(form.simulated_voice_score),
                }}>
                  {form.simulated_voice_score !== null ? `${((form.simulated_voice_score ?? 0) * 100).toFixed(0)}%` : 'Auto'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={form.simulated_voice_score ?? 0.5}
                onChange={(e) => setForm({ ...form, simulated_voice_score: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-primary-light)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Acoustic Quality / Telephony Channel
              </label>
              <select
                value={form.audio_quality_override}
                onChange={(e) => setForm({ ...form, audio_quality_override: e.target.value })}
                className="form-select"
              >
                <option value="optimal">Optimal Clean Acoustic Fidelity</option>
                <option value="low_snr">Low SNR / Street & Environmental Noise</option>
                <option value="clipping_detected">Digital Clipping / Distorted Mic Preamp</option>
                <option value="near_silent">Near Silence / Inaudible Caller</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  type="checkbox"
                  id="newRecipientToggle"
                  checked={form.is_new_recipient}
                  onChange={(e) => setForm({ ...form, is_new_recipient: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary-light)' }}
                />
                <label htmlFor="newRecipientToggle" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  First transfer ever dispatched to this payee account
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  type="checkbox"
                  id="flaggedCallerToggle"
                  checked={form.historical_caller_flagged}
                  onChange={(e) => setForm({ ...form, historical_caller_flagged: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary-light)' }}
                />
                <label htmlFor="flaggedCallerToggle" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Caller account exhibits past fraud chargeback disputes
                </label>
              </div>
            </div>

            <div style={{ marginTop: '0.35rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={loading}
              >
                <Play size={16} />
                <span>{loading ? 'Evaluating Policy Rules...' : 'Execute Multi-Factor Evaluation'}</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Evaluation Output Card */}
        <Card>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
            Risk Engine Decision & Enforcement
          </div>

          {result ? (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Policy Decision
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                    {result.risk_action.replace(/_/g, ' ')}
                  </div>
                </div>
                <RiskBadge action={result.risk_action} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Risk</div>
                  <div style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: result.overall_risk_level === 'CRITICAL' ? '#fb7185' : result.overall_risk_level === 'HIGH' ? '#fbbf24' : '#34d399',
                  }}>
                    {result.overall_risk_level}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auto Release</div>
                  <div style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: result.allows_simulated_dispatch ? '#34d399' : '#fb7185',
                  }}>
                    {result.allows_simulated_dispatch ? 'PERMITTED' : 'HALTED'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Desk Review</div>
                  <div style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: result.requires_human_review ? '#fb7185' : 'var(--text-muted)',
                  }}>
                    {result.requires_human_review ? 'REQUIRED' : 'STANDBY'}
                  </div>
                </div>
              </div>

              {/* Security Directive Card */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(13, 17, 26, 0.6) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '1.1rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: '0.35rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={14} />
                  <span>Mandated Protocol Directive</span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.885rem', lineHeight: 1.5 }}>
                  {result.recommended_next_action}
                </div>
              </div>

              {/* Reasons Breakdown */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  Defensible Decision Reasons:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.reasons.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: '3px solid var(--color-primary-light)',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-primary-light)' }}>
                        {r.code}:{' '}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4.5rem 1rem', color: 'var(--text-muted)' }}>
              <Landmark size={48} style={{ margin: '0 auto 1rem', opacity: 0.25 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Risk Policy Engine Awaiting Input
              </div>
              <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                Select a preset scenario above or tweak parameters to trigger decision logic.
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
