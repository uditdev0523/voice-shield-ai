import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  Sliders,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { ModelEvaluationReport } from '../services/types';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';

export const ModelPerformancePage: React.FC = () => {
  const [report, setReport] = useState<ModelEvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getModelEvaluationReport();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch evaluation report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const isEvaluated = report?.evaluation_status === 'evaluated' && report?.metrics;

  return (
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1360px', margin: '0 auto' }}>
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
            <Cpu size={12} color="#818cf8" />
            Empirical Validation Telemetry
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
            Model Performance & Robustness Lab
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Empirical benchmark metrics derived exclusively from held-out test partitions. VoiceShield never fabricates performance numbers.
          </p>
        </div>

        <button onClick={loadReport} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Benchmark</span>
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#fb7185',
          marginBottom: '2rem',
        }}>
          {error}
        </div>
      )}

      {/* Model Spec Card */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
              Evaluated Checkpoint Architecture
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {report?.model_name || 'VoiceShield CNN-BiGRU'} ({report?.model_version || 'v1.0.0'})
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Evaluation Set: {report?.dataset_info?.name || 'Held-Out Test Subset'} ({report?.dataset_info?.test_sample_count ?? 0} Independent Test Samples)
            </div>
          </div>

          <div style={{
            padding: '0.5rem 1.15rem',
            borderRadius: '9999px',
            backgroundColor: isEvaluated ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${isEvaluated ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            color: isEvaluated ? '#34d399' : '#fbbf24',
            fontWeight: 700,
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <CheckCircle2 size={16} />
            <span>{isEvaluated ? 'HELD-OUT EVALUATION VERIFIED' : 'PENDING EVALUATION'}</span>
          </div>
        </div>
      </Card>

      {isEvaluated && report.metrics ? (
        <>
          {/* Key Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <StatCard
              title="F1 Score"
              value={(report.metrics.f1_score * 100).toFixed(1) + '%'}
              subtitle="Harmonic mean of precision & recall"
              icon={<Activity size={20} />}
              color="#6366f1"
            />
            <StatCard
              title="ROC-AUC"
              value={report.metrics.roc_auc.toFixed(3)}
              subtitle="Area under ROC curve"
              icon={<ShieldCheck size={20} />}
              color="#10b981"
            />
            <StatCard
              title="Equal Error Rate (EER)"
              value={(report.metrics.eer * 100).toFixed(1) + '%'}
              subtitle="Optimal decision threshold"
              icon={<Cpu size={20} />}
              color="#8b5cf6"
            />
            <StatCard
              title="False Positive Rate"
              value={(report.metrics.false_positive_rate * 100).toFixed(1) + '%'}
              subtitle="Genuine speech misflagged"
              icon={<AlertTriangle size={20} />}
              color="#f59e0b"
            />
            <StatCard
              title="Average Latency"
              value={`${report.metrics.avg_latency_ms} ms`}
              subtitle="Inference time per clip"
              icon={<Clock size={20} />}
              color="#06b6d4"
            />
          </div>

          {/* Confusion Matrix and Robustness split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Confusion Matrix */}
            <Card>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                Held-Out Confusion Matrix
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Strict classification outcomes on isolated test evaluation partition
              </div>

              {report.confusion_matrix && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', textAlign: 'center' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '1.35rem',
                    borderRadius: '12px',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                      True Negatives (Genuine)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.confusion_matrix.true_negatives}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(244, 63, 94, 0.05)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    padding: '1.35rem',
                    borderRadius: '12px',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: 700, textTransform: 'uppercase' }}>
                      False Positives (Type I)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.confusion_matrix.false_positives}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    padding: '1.35rem',
                    borderRadius: '12px',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                      False Negatives (Type II)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.confusion_matrix.false_negatives}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '1.35rem',
                    borderRadius: '12px',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
                      True Positives (Clone)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {report.confusion_matrix.true_positives}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Robustness Benchmarks */}
            <Card>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                Channel Robustness Stress Tests
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Evaluation under artificial environmental noise and volume perturbations
              </div>

              {report.robustness_benchmarks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {report.robustness_benchmarks.map((rb, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>{rb.condition}</span>
                        <span style={{
                          fontWeight: 700,
                          color: '#34d399',
                          fontSize: '0.9rem',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          F1: {(rb.f1_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Score Drift: {rb.mean_score_drift}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      ) : (
        <Card style={{ textAlign: 'center', padding: '4.5rem 1.5rem', marginBottom: '2rem' }}>
          <Cpu size={48} style={{ margin: '0 auto 1rem', opacity: 0.25 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            No Held-Out Evaluation Report Generated Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Execute the reproducible evaluation script in terminal: <br />
            <code>python -m backend.training.evaluate</code>
          </p>
        </Card>
      )}

      {/* Limitations Disclosures */}
      <Card>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="#fbbf24" />
          <span>Documented Model Limitations & Domain Shift Disclosures</span>
        </div>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65 }}>
          {report?.limitations.map((lim, i) => (
            <li key={i} style={{ marginBottom: '0.4rem' }}>{lim}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
