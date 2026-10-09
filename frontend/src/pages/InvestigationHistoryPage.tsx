import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  FileAudio,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { AuditRecord } from '../services/types';
import { Card } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/StatCard';

export const InvestigationHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAuditHistory({
        search: search.trim() || undefined,
        risk_action: riskFilter || undefined,
        result_label: resultFilter || undefined,
        limit,
        offset: page * limit,
      });
      setRecords(res.items);
      setTotalCount(res.total_count);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [page, riskFilter, resultFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadRecords();
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all metadata audit logs from SQLite?')) return;
    try {
      await api.clearAuditHistory();
      setPage(0);
      loadRecords();
    } catch (err: any) {
      setError(err.message || 'Failed to clear history.');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Forensic Investigation History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Minimal non-biometric audit logs. Raw audio recordings and transcripts are never stored.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href={api.getAuditExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          <button onClick={handleClearHistory} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
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

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search Event ID or reason code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem' }}
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(0); }}
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">All Risk Actions</option>
            <option value="CONTINUE_SIMULATED_FLOW">Cleared (Low Risk)</option>
            <option value="STEP_UP_VERIFICATION">Step-Up Verification</option>
            <option value="PAUSE_AND_VERIFY">Pause & Verify</option>
            <option value="INCONCLUSIVE_VERIFY">Inconclusive Audio</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => { setResultFilter(e.target.value); setPage(0); }}
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">All Classification Labels</option>
            <option value="GENUINE">GENUINE</option>
            <option value="SYNTHETIC_SUSPECTED">SYNTHETIC_SUSPECTED</option>
            <option value="INCONCLUSIVE">INCONCLUSIVE</option>
            <option value="MODEL_UNAVAILABLE">MODEL_UNAVAILABLE</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        {records.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Event ID</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Mode</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Classification</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Score</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Quality</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Risk Action</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Latency</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(30, 43, 72, 0.4)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#60a5fa' }}>
                        {r.event_id}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge badge-neutral">{r.analysis_mode}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                        <span style={{
                          color: r.result_label === 'GENUINE' ? '#34d399' : r.result_label === 'SYNTHETIC_SUSPECTED' ? '#f87171' : '#fbbf24'
                        }}>
                          {r.result_label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: (r.synthetic_score ?? 0) > 0.7 ? '#f87171' : '#34d399' }}>
                        {r.synthetic_score !== null ? `${(r.synthetic_score * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {r.audio_quality}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <RiskBadge action={r.risk_action} />
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                        {r.processing_latency_ms.toFixed(1)} ms
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>
                Showing {records.length} of {totalCount} total audit records
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <FileAudio size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div>No matching investigation records found in SQLite audit table.</div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem',
        }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event Forensic Inspection</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{selectedRecord.event_id}</div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp (UTC):</span>
                <span style={{ fontWeight: 600 }}>{selectedRecord.timestamp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Classification Label:</span>
                <span style={{ fontWeight: 700, color: selectedRecord.result_label === 'GENUINE' ? '#34d399' : '#f87171' }}>
                  {selectedRecord.result_label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Synthetic Voice Probability:</span>
                <span style={{ fontWeight: 700 }}>
                  {selectedRecord.synthetic_score !== null ? `${(selectedRecord.synthetic_score * 100).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audio Signal Integrity:</span>
                <span style={{ fontWeight: 600 }}>{selectedRecord.audio_quality}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Processing Latency:</span>
                <span style={{ fontWeight: 600 }}>{selectedRecord.processing_latency_ms} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Policy Action:</span>
                <RiskBadge action={selectedRecord.risk_action} />
              </div>

              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Reason Codes:</div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px' }}>
                  {selectedRecord.reason_codes.length > 0 ? (
                    selectedRecord.reason_codes.map((code, idx) => (
                      <div key={idx} style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '0.2rem' }}>
                        • {code}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>None recorded</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setSelectedRecord(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
