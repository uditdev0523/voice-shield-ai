import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  Clock,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileAudio,
  Landmark,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import { api } from '../services/api';
import { AnalyticsSummary, AuditRecord } from '../services/types';
import { StatCard, RiskBadge } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, history] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAuditHistory({ limit: 6, offset: 0 }),
      ]);
      setAnalytics(summary);
      setRecentRecords(history.items);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const riskPieData = analytics?.risk_distribution
    ? Object.entries(analytics.risk_distribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#64748b'];

  return (
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2.25rem',
      }}>
        <div>
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
            <Zap size={12} color="#818cf8" />
            Live SOC Telemetry
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}>
            Security Operations Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Real-time biometric acoustic anti-spoofing telemetry & banking fraud policy enforcement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync SOC</span>
          </button>
          <Link to="/banking-simulator" className="btn btn-primary btn-sm">
            <Landmark size={14} />
            <span>Simulate Flow</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertCircle size={20} />
          <div>
            <div style={{ fontWeight: 600 }}>Backend Connection Offline</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {error} — Ensure FastAPI backend is running on <code>http://127.0.0.1:8000</code>.
            </div>
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        <StatCard
          title="Total Analyses"
          value={analytics?.total_analyses ?? 0}
          subtitle="Acoustic evaluations performed"
          icon={<Activity size={20} />}
          color="#6366f1"
        />

        <StatCard
          title="Genuine Cleared"
          value={analytics?.genuine_count ?? 0}
          subtitle="Biometrically organic speech"
          icon={<ShieldCheck size={20} />}
          color="#10b981"
        />

        <StatCard
          title="Synthetic Flagged"
          value={analytics?.synthetic_count ?? 0}
          subtitle="Voice clone artifacts detected"
          icon={<ShieldAlert size={20} />}
          color="#f43f5e"
        />

        <StatCard
          title="Step-Up / Paused"
          value={analytics?.verification_required_count ?? 0}
          subtitle="Multi-factor challenge triggered"
          icon={<AlertCircle size={20} />}
          color="#f59e0b"
        />

        <StatCard
          title="Inference Latency"
          value={`${analytics?.avg_latency_ms ?? 0} ms`}
          subtitle="Log-Mel + GRU forward pass"
          icon={<Clock size={20} />}
          color="#06b6d4"
        />
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Risk Distribution Chart */}
        <Card>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Risk Policy Distribution
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Categorical breakdown of simulated transaction decisions
          </div>

          {riskPieData.length > 0 ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {riskPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="rgba(6, 8, 13, 0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 17, 26, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(16px)',
                    }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '0.85rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{
              height: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}>
              No policy actions recorded yet. Run a simulation to populate.
            </div>
          )}
        </Card>

        {/* Model & Privacy Telemetry Card */}
        <Card>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Acoustic Pipeline & Privacy State
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Real-time telemetry of local PyTorch checkpoint and zero-retention guarantee
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Neural Checkpoint</span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: analytics?.model_status.available ? '#34d399' : '#fb7185',
              }}>
                {analytics?.model_status.available ? `ONLINE (${analytics.model_status.version})` : 'CHECKPOINT OFFLINE'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Compute Device</span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#a5b4fc',
              }}>
                {analytics?.model_status.device?.toUpperCase() || 'CPU'} (PYTORCH)
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Audio Retention Policy</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
                STRICT ZERO (Ephemeral)
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              background: 'rgba(99, 102, 241, 0.04)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Audit Trail Mode</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c7d2fe' }}>
                Cryptographic Metadata Only
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Investigations Table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Recent Security Analyses
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Acoustic inference events and simulated banking policy executions
            </div>
          </div>
          <Link to="/investigation-history" className="btn btn-secondary btn-sm">
            <span>View Complete Log</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Event ID</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Mode</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Synthetic Score</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Risk Action</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{
                      padding: '0.85rem 0.75rem',
                      fontWeight: 600,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--color-primary-light)',
                    }}>
                      {r.event_id}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {r.analysis_mode}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.85rem 0.75rem',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: (r.synthetic_score ?? 0) > 0.7 ? '#fb7185' : (r.synthetic_score ?? 0) > 0.35 ? '#fbbf24' : '#34d399',
                    }}>
                      {r.synthetic_score !== null ? `${(r.synthetic_score * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <RiskBadge action={r.risk_action} />
                    </td>
                    <td style={{
                      padding: '0.85rem 0.75rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {r.processing_latency_ms.toFixed(1)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <FileAudio size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              No Forensic Records in Audit Log
            </div>
            <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              Perform a live microphone test or upload an audio sample to populate telemetry.
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/upload-analysis" className="btn btn-primary btn-sm">
                Upload Acoustic Sample
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
