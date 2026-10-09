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

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Banking Transaction Risk Simulator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Multi-factor decision engine testing sandbox. Demonstrates how voice acoustic scores, transaction value, and counterparty context interact to prevent fraud without blocking legitimate clients.
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        padding: '0.875rem 1.25rem',
        borderRadius: '10px',
        color: '#93c5fd',
        fontSize: '0.85rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Info size={18} color="#60a5fa" />
        <div>
          <strong>Simulation Sandbox Only:</strong> This module runs exclusively against simulated transaction variables. It never connects to live payment rails or bank credentials.
        </div>
      </div>

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

      {/* Preset Scenarios Carousel / Badges */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
          Preset Threat & Legitimate Scenarios
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => applyScenario(sc)}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? '#3b82f6' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                  padding: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                  {sc.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                  {sc.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <RiskBadge action={sc.expected_outcome} />
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>Load →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Form & Result Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Form Controls */}
        <Card>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="#3b82f6" />
            <span>Configure Transaction Parameters</span>
          </div>

          <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Simulated Transaction Type
              </label>
              <select
                value={form.transaction_type}
                onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
                className="form-select"
              >
                <option value="wire_transfer">High-Value Wire Transfer</option>
                <option value="peer_payment">Instant Peer-to-Peer Transfer (P2P)</option>
                <option value="account_change">Sensitive Profile Change (MFA/Phone)</option>
                <option value="loan_request">Line of Credit / Loan Disbursement</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Monetary Amount ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={form.transaction_amount}
                onChange={(e) => setForm({ ...form, transaction_amount: parseFloat(e.target.value) || 0 })}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Recipient Relationship
              </label>
              <select
                value={form.recipient_category}
                onChange={(e) => setForm({ ...form, recipient_category: e.target.value })}
                className="form-select"
              >
                <option value="existing_trusted">Verified Historical Payee</option>
                <option value="new_unverified">Newly Created / Unknown Payee</option>
                <option value="high_risk_flagged">High Risk / Flagged Entity</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Simulated Voice Synthesis Score (0.00 = Genuine, 1.00 = Deepfake Clone)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={form.simulated_voice_score ?? 0.5}
                  onChange={(e) => setForm({ ...form, simulated_voice_score: parseFloat(e.target.value) })}
                  style={{ flex: 1, accentColor: '#3b82f6' }}
                />
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: (form.simulated_voice_score ?? 0) > 0.7 ? '#f87171' : (form.simulated_voice_score ?? 0) < 0.35 ? '#34d399' : '#fbbf24',
                }}>
                  {form.simulated_voice_score !== null ? `${((form.simulated_voice_score ?? 0) * 100).toFixed(0)}%` : 'Model Default'}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Audio Quality & Channel Condition
              </label>
              <select
                value={form.audio_quality_override}
                onChange={(e) => setForm({ ...form, audio_quality_override: e.target.value })}
                className="form-select"
              >
                <option value="optimal">Optimal Clean Acoustic Quality</option>
                <option value="low_snr">Low SNR / Background Environmental Noise</option>
                <option value="clipping_detected">Digital Clipping / Distorted Mic Level</option>
                <option value="near_silent">Near Silence / Inaudible Caller</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="newRecipientToggle"
                  checked={form.is_new_recipient}
                  onChange={(e) => setForm({ ...form, is_new_recipient: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="newRecipientToggle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  First payment ever dispatched to this payee
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="flaggedCallerToggle"
                  checked={form.historical_caller_flagged}
                  onChange={(e) => setForm({ ...form, historical_caller_flagged: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="flaggedCallerToggle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Caller account has historical dispute flags
                </label>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading}
              >
                <Play size={16} />
                <span>{loading ? 'Evaluating Policy Rules...' : 'Run Simulation'}</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Evaluation Output Card */}
        <Card>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
            Risk Engine Decision & Explanations
          </div>

          {result ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated Action</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                    {result.risk_action.replace(/_/g, ' ')}
                  </div>
                </div>
                <RiskBadge action={result.risk_action} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall Risk Level</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: result.overall_risk_level === 'CRITICAL' ? '#f87171' : result.overall_risk_level === 'HIGH' ? '#fbbf24' : '#34d399' }}>
                    {result.overall_risk_level}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automated Release</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: result.allows_simulated_dispatch ? '#34d399' : '#f87171' }}>
                    {result.allows_simulated_dispatch ? 'Permitted' : 'Halted'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Human Desk Review</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: result.requires_human_review ? '#f87171' : 'var(--text-muted)' }}>
                    {result.requires_human_review ? 'Required' : 'Not Needed'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  Mandated Security Protocol
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {result.recommended_next_action}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Defensible Decision Reasons:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.reasons.map((r, i) => (
                    <div key={i} style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700, color: '#60a5fa' }}>{r.code}: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Landmark size={44} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <div>Configure parameters or click a preset scenario above to evaluate risk.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
