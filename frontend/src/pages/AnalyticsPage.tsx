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
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Analytics & Investigation Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Authentic operational metrics aggregated strictly from SQLite metadata logs.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem',
          borderRadius: '10px',
          color: '#f87171',
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
          color="#3b82f6"
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
          color="#ef4444"
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
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Policy Decision Frequencies
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Count of mitigated events by categorized risk action
          </div>

          {riskBarData.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={riskBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2b48" />
                  <XAxis dataKey="action" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1424', borderColor: '#243356', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
            Analysis Volume Trend
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Daily breakdown of acoustic classifications
          </div>

          {data?.recent_activity && data.recent_activity.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={data.recent_activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2b48" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1424', borderColor: '#243356', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="rgba(99, 102, 241, 0.2)" name="Total Evaluations" />
                  <Area type="monotone" dataKey="synthetic" stroke="#ef4444" fill="rgba(239, 68, 68, 0.15)" name="Synthetic Flagged" />
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
