/**
 * VoiceShield AI - Frontend API & Domain Types
 */

export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  uptime_seconds: number;
  model: {
    available: boolean;
    version: string;
    device: string;
    load_error: string | null;
  };
  privacy: {
    zero_audio_retention: boolean;
    active_temp_files: number;
  };
}

export interface SignalQuality {
  status: 'optimal' | 'clipping_detected' | 'low_snr' | 'near_silent' | string;
  description: string;
  rms_energy: number;
  peak_amplitude: number;
  clipping_ratio: number;
  snr_db: number;
  has_clipping: boolean;
  is_near_silent: boolean;
  is_low_snr: boolean;
}

export interface ReasonItem {
  code: string;
  message: string;
}

export interface DetectionResult {
  event_id: string;
  timestamp: string;
  analysis_mode: 'upload' | 'live_stream';
  model_version: string;
  model_status: 'active' | 'unavailable';
  result_label: 'GENUINE' | 'SYNTHETIC_SUSPECTED' | 'INCONCLUSIVE' | 'MODEL_UNAVAILABLE';
  synthetic_score: number | null;
  uncertainty_score: number | null;
  audio_quality: SignalQuality;
  audio_duration_seconds: number;
  processing_latency_ms: number;
  risk_action: string;
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: ReasonItem[];
  recommended_next_action: string;
  ephemeral_cleanup_verified: boolean;
}

export interface BankingSimulationRequest {
  transaction_type: string;
  transaction_amount: number;
  recipient_category: string;
  is_new_recipient: boolean;
  historical_caller_flagged?: boolean;
  simulated_voice_score?: number | null;
  audio_quality_override?: string;
}

export interface BankingSimulationResponse {
  simulation_id: string;
  timestamp: string;
  transaction_type: string;
  transaction_amount: number;
  recipient_category: string;
  is_new_recipient: boolean;
  voice_score_evaluated: number | null;
  audio_quality_status: string;
  risk_action: string;
  overall_risk_level: string;
  reason_codes: string[];
  reasons: ReasonItem[];
  recommended_next_action: string;
  allows_simulated_dispatch: boolean;
  requires_human_review: boolean;
  disclaimer: string;
}

export interface BankingScenario {
  id: string;
  name: string;
  description: string;
  request: BankingSimulationRequest;
  expected_outcome: string;
  takeaway: string;
}

export interface AuditRecord {
  id: number;
  event_id: string;
  timestamp: string;
  analysis_mode: string;
  model_version: string;
  model_status: string;
  result_label: string;
  synthetic_score: number | null;
  uncertainty_score: number | null;
  audio_quality: string;
  audio_duration_seconds: number | null;
  processing_latency_ms: number;
  risk_action: string;
  reason_codes: string[];
  transaction_amount: number | null;
  recipient_category: string | null;
  is_flagged_for_review: number;
}

export interface AuditHistoryResponse {
  items: AuditRecord[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface AnalyticsSummary {
  total_analyses: number;
  genuine_count: number;
  synthetic_count: number;
  inconclusive_count: number;
  verification_required_count: number;
  avg_latency_ms: number;
  risk_distribution: Record<string, number>;
  recent_activity: Array<{
    day: string;
    count: number;
    synthetic: number;
    genuine: number;
  }>;
  model_status: {
    available: boolean;
    version: string;
    device: string;
    architecture: string;
    metadata: Record<string, any>;
  };
}

export interface PrivacyStatus {
  audio_retention_enabled: boolean;
  default_retention_policy: string;
  ephemeral_storage_location: string;
  active_temp_audio_files: number;
  audit_logging_mode: string;
  max_upload_size_mb: number;
  max_duration_seconds: number;
  data_separation: {
    browser_local: string;
    transient_backend: string;
    persistent_metadata: string;
  };
}

export interface ModelEvaluationReport {
  model_name: string;
  model_version: string;
  evaluation_status: 'evaluated' | 'not_evaluated';
  dataset_info?: {
    name: string;
    test_sample_count: number;
    genuine_samples: number;
    synthetic_samples: number;
  };
  metrics?: {
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    eer: number;
    false_positive_rate: number;
    false_negative_rate: number;
    avg_latency_ms: number;
  };
  confusion_matrix?: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  robustness_benchmarks?: Array<{
    condition: string;
    f1_score: number;
    mean_score_drift: number;
  }>;
  limitations: string[];
  disclaimer: string;
}
