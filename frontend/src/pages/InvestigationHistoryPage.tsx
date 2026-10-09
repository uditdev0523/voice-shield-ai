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
  Database,
  ExternalLink,
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
            <Database size={12} color="#818cf8" />
            Audit Ledger
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
            Forensic Investigation History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Non-biometric operational logs preserving cryptographic proof of evaluation. Raw audio recordings are never stored.
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

          <button onClick={handleClearHistory} className="btn btn-secondary btn-sm" style={{ color: '#fb7185' }}>
            <Trash2 size={14} />
            <span>Clear Ledger</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1.15rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search Event ID or reason code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(0); }}
            className="form-select"
            style={{ width: 'auto', minWidth: '190px' }}
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
            style={{ width: 'auto', minWidth: '190px' }}
          >
            <option value="">All Classification Labels</option>
            <option value="GENUINE">GENUINE</option>
            <option value="SYNTHETIC_SUSPECTED">SYNTHETIC_SUSPECTED</option>
            <option value="INCONCLUSIVE">INCONCLUSIVE</option>
            <option value="MODEL_UNAVAILABLE">MODEL_UNAVAILABLE</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search Ledger
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
                  <tr style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    color: 'var(--text-muted)',
                    fontSize: '0.74rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Event ID</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Timestamp</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Mode</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Classification</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Score</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Channel SNR</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Risk Action</th>
                    <th style={{ padding: '0.85rem 0.65rem' }}>Latency</th>
                    <th style={{ padding: '0.85rem 0.65rem', textAlign: 'center' }}>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
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
                        padding: '0.85rem 0.65rem',
                        fontWeight: 600,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--color-primary-light)',
                      }}>
                        {r.event_id}
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)' }}>
                        {new Date(r.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {r.analysis_mode}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem', fontWeight: 600 }}>
                        <span style={{
                          color: r.result_label === 'GENUINE' ? '#34d399' : r.result_label === 'SYNTHETIC_SUSPECTED' ? '#fb7185' : '#fbbf24',
                          fontSize: '0.8rem',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {r.result_label}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.85rem 0.65rem',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: (r.synthetic_score ?? 0) > 0.7 ? '#fb7185' : (r.synthetic_score ?? 0) > 0.35 ? '#fbbf24' : '#34d399',
                      }}>
                        {r.synthetic_score !== null ? `${(r.synthetic_score * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {r.audio_quality}
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem' }}>
                        <RiskBadge action={r.risk_action} />
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {r.processing_latency_ms.toFixed(1)} ms
                      </td>
                      <td style={{ padding: '0.85rem 0.65rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
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
                Showing <strong style={{ color: '#ffffff' }}>{records.length}</strong> of {totalCount} total audit records
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
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <FileAudio size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No matching audit records in SQLite ledger.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Adjust search criteria or run a simulation.</div>
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
          backgroundColor: 'rgba(6, 8, 13, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem',
        }}>
          <div className="card" style={{ maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.85rem',
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Forensic Event Details
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedRecord.event_id}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp (UTC):</span>
                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{selectedRecord.timestamp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Classification:</span>
                <span style={{ fontWeight: 700, color: selectedRecord.result_label === 'GENUINE' ? '#34d399' : '#fb7185', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedRecord.result_label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Synthetic Voice Score:</span>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: (selectedRecord.synthetic_score ?? 0) > 0.7 ? '#fb7185' : '#34d399' }}>
                  {selectedRecord.synthetic_score !== null ? `${(selectedRecord.synthetic_score * 100).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audio Channel Status:</span>
                <span style={{ fontWeight: 600 }}>{selectedRecord.audio_quality}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pipeline Latency:</span>
                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{selectedRecord.processing_latency_ms} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Policy Risk Action:</span>
                <RiskBadge action={selectedRecord.risk_action} />
              </div>

              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Reason Codes:
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                  {selectedRecord.reason_codes.length > 0 ? (
                    selectedRecord.reason_codes.map((code, idx) => (
                      <div key={idx} style={{ color: 'var(--color-primary-light)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.825rem' }}>
                        • {code}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No explicit rules triggered</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', textAlign: 'right' }}>
              <button onClick={() => setSelectedRecord(null)} className="btn btn-secondary btn-sm">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
