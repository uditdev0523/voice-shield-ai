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
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

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

  const PIE_COLORS = ['#34d399', '#fbbf24', '#f87171', '#818cf8', '#94a3b8'];

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Security Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Live acoustic anti-spoofing telemetry and banking transaction verification events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/banking-simulator" className="btn btn-primary btn-sm">
            <Landmark size={14} />
            <span>Simulate Transaction</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          color: '#f87171',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertCircle size={20} />
          <div>
            <div style={{ fontWeight: 600 }}>Backend Connection Issue</div>
            <div style={{ fontSize: '0.85rem' }}>{error} - Ensure FastAPI is running on port 8000.</div>
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          title="Total Analyses"
          value={analytics?.total_analyses ?? 0}
          subtitle="Acoustic evaluations performed"
          icon={<Activity size={20} />}
          color="#3b82f6"
        />

        <StatCard
          title="Genuine Cleared"
          value={analytics?.genuine_count ?? 0}
          subtitle="Biometrically natural speech"
          icon={<ShieldCheck size={20} />}
          color="#10b981"
        />

        <StatCard
          title="Synthetic Flagged"
          value={analytics?.synthetic_count ?? 0}
          subtitle="Voice clone artifacts detected"
          icon={<ShieldAlert size={20} />}
          color="#ef4444"
        />

        <StatCard
          title="Step-Up / Paused"
          value={analytics?.verification_required_count ?? 0}
          subtitle="Secondary auth required"
          icon={<AlertCircle size={20} />}
          color="#f59e0b"
        />

        <StatCard
          title="Average Latency"
          value={`${analytics?.avg_latency_ms ?? 0} ms`}
          subtitle="Spectrogram + GRU inference"
          icon={<Clock size={20} />}
          color="#8b5cf6"
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Risk Distribution Chart */}
        <Card>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Risk Action Distribution
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Breakdown of multi-factor banking policy outcomes
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
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {riskPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1424', borderColor: '#243356', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No audit actions recorded yet. Run a simulation to populate.
            </div>
          )}
        </Card>

        {/* Model & Privacy Telemetry Card */}
        <Card>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Inference Engine & Privacy State
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Real-time status of local PyTorch checkpoint and zero-retention safeguards
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model Checkpoint</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: analytics?.model_status.available ? '#34d399' : '#f87171' }}>
                {analytics?.model_status.available ? `Active (${analytics.model_status.version})` : 'Checkpoint Missing'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Execution Device</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>
                {analytics?.model_status.device?.toUpperCase() || 'CPU'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Raw Audio Retention</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
                STRICT ZERO (Never Retained)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Audit Logging Mode</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa' }}>
                Metadata-Only (No Audio/Transcripts)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Investigations Table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Recent Security Analyses
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Latest evaluated transactions and audio uploads
            </div>
          </div>
          <Link to="/investigation-history" className="btn btn-secondary btn-sm">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Event ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Mode</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Synthetic Score</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Risk Action</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(30, 43, 72, 0.4)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#60a5fa' }}>
                      {r.event_id}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge badge-neutral">{r.analysis_mode}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: (r.synthetic_score ?? 0) > 0.7 ? '#f87171' : '#34d399' }}>
                      {r.synthetic_score !== null ? `${(r.synthetic_score * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <RiskBadge action={r.risk_action} />
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                      {r.processing_latency_ms.toFixed(1)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <FileAudio size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Forensic Records in Audit Log</div>
            <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              Run a live mic detection or upload an audio sample to generate records.
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/upload-analysis" className="btn btn-primary btn-sm">
                Upload Test Audio
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
