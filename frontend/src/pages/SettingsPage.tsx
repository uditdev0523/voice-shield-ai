import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';

export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState<string>(api.getBaseUrl());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      api.setBaseUrl(apiUrl);
      const health = await api.getHealth();
      setTestResult({
        success: true,
        message: `Successfully connected! Service: ${health.app_name} (${health.version}), Model Available: ${health.model.available ? 'ONLINE' : 'OFFLINE'}`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'Check if FastAPI is running on that port.'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    api.setBaseUrl(apiUrl);
    handleTestConnection();
  };

  return (
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1080px', margin: '0 auto' }}>
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
          <Settings size={12} color="#818cf8" />
          System Preferences
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
          Platform Settings & Environment
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Manage backend endpoints, risk threshold presets, and client-side operating parameters.
        </p>
      </div>

      {testResult && (
        <div style={{
          backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
          border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: testResult.success ? '#34d399' : '#fb7185',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}>
          {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Backend API Configuration */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} color="var(--color-primary-light)" />
          <span>FastAPI Backend Gateway</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Configures the HTTP address where local PyTorch inference and SQLite audit routes reside
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Backend API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="form-input"
              placeholder="http://localhost:8000"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={testing}>
              <Save size={14} />
              <span>Save & Connect</span>
            </button>
            <button type="button" onClick={handleTestConnection} className="btn btn-secondary btn-sm" disabled={testing}>
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Probing Gateway...' : 'Test Connection'}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Risk Threshold Policy Specifications */}
      <Card>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#818cf8" />
          <span>Active Policy Boundaries</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Multi-factor policy boundaries enforced by <code>backend/app/services/risk_engine.py</code>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.15rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Low Synthetic Threshold</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>0.35</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Scores below 0.35 indicate acoustically genuine human speech.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.15rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High Synthetic Threshold</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185', marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>0.70</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Scores above 0.70 prompt out-of-band verification steps.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.15rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High-Value Trigger</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>$5,000.00</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Transfers at or above $5,000 mandate secondary verification.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
