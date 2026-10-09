import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

import { api } from '../services/api';
import { AnalyticsSummary } from '../services/types';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await api.getAnalyticsSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const riskBarData = data?.risk_distribution
    ? Object.entries(data.risk_distribution).map(([action, count]) => ({
        action: action.replace(/_/g, ' '),
        count,
      }))
    : [];

  return (
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
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
            <BarChart3 size={12} color="#818cf8" />
            Audit Forensics Aggregation
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
            Analytics & Investigation Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Empirical security metrics aggregated strictly from SQLite metadata logs. Zero raw speech transcripts are stored.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '2rem',
        }}>
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          title="Total Ingestions"
          value={data?.total_analyses ?? 0}
          subtitle="Processed recordings"
          icon={<Activity size={20} />}
          color="#6366f1"
        />
        <StatCard
          title="Bonafide Cleared"
          value={data?.genuine_count ?? 0}
          subtitle="Natural vocal acoustics"
          icon={<ShieldCheck size={20} />}
          color="#10b981"
        />
        <StatCard
          title="Synthetic Clones"
          value={data?.synthetic_count ?? 0}
          subtitle="Deepfake vocoder detected"
          icon={<ShieldAlert size={20} />}
          color="#f43f5e"
        />
        <StatCard
          title="Inconclusive Audio"
          value={data?.inconclusive_count ?? 0}
          subtitle="High uncertainty or defect"
          icon={<Clock size={20} />}
          color="#f59e0b"
        />
      </div>

      {/* Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Risk Actions Bar Chart */}
        <Card>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Policy Decision Frequencies
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Count of mitigated events by categorized risk action
          </div>

          {riskBarData.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={riskBarData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="action" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 17, 26, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(16px)',
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recorded decisions in SQLite yet.
            </div>
          )}
        </Card>

        {/* Temporal Activity Trend Area Chart */}
        <Card>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Temporal Volume Trend
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Historical timeline of acoustic classifications
          </div>

          {data?.recent_activity && data.recent_activity.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={data.recent_activity}>
                  <defs>
                    <linearGradient id="areaTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaSynthetic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 17, 26, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(16px)',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#areaTotal)" name="Total Evaluations" />
                  <Area type="monotone" dataKey="synthetic" stroke="#f43f5e" strokeWidth={2} fill="url(#areaSynthetic)" name="Synthetic Flagged" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No temporal trend data recorded.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
