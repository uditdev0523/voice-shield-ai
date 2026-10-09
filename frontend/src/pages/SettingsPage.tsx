import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
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
        message: `Successfully connected! Service: ${health.app_name} (${health.version}), Model Available: ${health.model.available ? 'YES' : 'NO'}`,
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
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Platform Settings & Environment
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage backend endpoints, risk threshold presets, and client-side operating parameters.
        </p>
      </div>

      {testResult && (
        <div style={{
          backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          padding: '1rem',
          borderRadius: '10px',
          color: testResult.success ? '#34d399' : '#f87171',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Backend API Configuration */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} color="#3b82f6" />
          <span>FastAPI Backend Gateway</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Configures the HTTP address where local PyTorch inference and SQLite audit routes reside
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Backend URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="form-input"
              placeholder="http://localhost:8000"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={testing}>
              <Save size={14} />
              <span>Save & Reconnect</span>
            </button>
            <button type="button" onClick={handleTestConnection} className="btn btn-secondary btn-sm" disabled={testing}>
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Risk Threshold Policy Specifications */}
      <Card>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#8b5cf6" />
          <span>Active Decision Thresholds</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Multi-factor policy boundaries enforced by <code>backend/app/services/risk_engine.py</code>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Synthetic Threshold</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>0.35</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Scores below 0.35 indicate acoustically genuine human speech.
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Synthetic Threshold</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>0.70</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Scores above 0.70 prompt out-of-band verification steps.
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High-Value Amount Trigger</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>$5,000.00</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Transfers at or above $5k mandate secondary verification.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
