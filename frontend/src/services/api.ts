/**
 * VoiceShield AI - API Client Service
 * Connects frontend directly to the local FastAPI backend.
 */

import {
  SystemHealth,
  DetectionResult,
  BankingSimulationRequest,
  BankingSimulationResponse,
  BankingScenario,
  AuditHistoryResponse,
  AnalyticsSummary,
  PrivacyStatus,
  ModelEvaluationReport,
} from './types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private base: string;

  constructor(base: string = API_BASE) {
    this.base = base.replace(/\/$/, '');
  }

  setBaseUrl(url: string) {
    this.base = url.replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.base;
  }

  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${this.base}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  async analyzeUpload(
    file: File,
    context?: {
      transaction_amount?: number;
      recipient_category?: string;
      is_new_recipient?: boolean;
    }
  ): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (context?.transaction_amount !== undefined) {
      formData.append('transaction_amount', context.transaction_amount.toString());
    }
    if (context?.recipient_category) {
      formData.append('recipient_category', context.recipient_category);
    }
    if (context?.is_new_recipient !== undefined) {
      formData.append('is_new_recipient', context.is_new_recipient ? 'true' : 'false');
    }

    const res = await fetch(`${this.base}/api/v1/analyze-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload analysis failed with HTTP ${res.status}`);
    }
    return res.json();
  }

  async analyzeLiveChunk(blob: Blob): Promise<DetectionResult> {
    const formData = new FormData();
    const file = new File([blob], 'microphone_chunk.wav', { type: 'audio/wav' });
    formData.append('file', file);

    const res = await fetch(`${this.base}/api/v1/analyze-stream-chunk`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Live audio analysis failed with HTTP ${res.status}`);
    }
    return res.json();
  }

  async simulateBanking(req: BankingSimulationRequest): Promise<BankingSimulationResponse> {
    const res = await fetch(`${this.base}/api/v1/banking/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Simulation failed with HTTP ${res.status}`);
    }
    return res.json();
  }

  async getBankingScenarios(): Promise<BankingScenario[]> {
    const res = await fetch(`${this.base}/api/v1/banking/scenarios`);
    if (!res.ok) throw new Error('Failed to load banking scenarios.');
    return res.json();
  }

  async getAuditHistory(params?: {
    search?: string;
    risk_action?: string;
    result_label?: string;
    analysis_mode?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditHistoryResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.risk_action) query.append('risk_action', params.risk_action);
    if (params?.result_label) query.append('result_label', params.result_label);
    if (params?.analysis_mode) query.append('analysis_mode', params.analysis_mode);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const res = await fetch(`${this.base}/api/v1/audit/history?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit history.');
    return res.json();
  }

  getAuditExportUrl(): string {
    return `${this.base}/api/v1/audit/export-csv`;
  }

  async clearAuditHistory(): Promise<{ status: string; records_removed: number }> {
    const res = await fetch(`${this.base}/api/v1/audit/clear`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear audit history.');
    return res.json();
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${this.base}/api/v1/analytics/summary`);
    if (!res.ok) throw new Error('Failed to load analytics summary.');
    return res.json();
  }

  async getPrivacyStatus(): Promise<PrivacyStatus> {
    const res = await fetch(`${this.base}/api/v1/privacy/status`);
    if (!res.ok) throw new Error('Failed to load privacy status.');
    return res.json();
  }

  async purgeEphemeralAudio(): Promise<{ status: string; purged_files_count: number; message: string }> {
    const res = await fetch(`${this.base}/api/v1/privacy/purge`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to purge ephemeral audio.');
    return res.json();
  }

  async getModelEvaluationReport(): Promise<ModelEvaluationReport> {
    const res = await fetch(`${this.base}/api/v1/model/evaluation-report`);
    if (!res.ok) throw new Error('Failed to fetch model evaluation report.');
    return res.json();
  }
}

export const api = new ApiClient();
