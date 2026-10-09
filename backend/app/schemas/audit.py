"""
VoiceShield AI - Audit, Privacy, and Evaluation Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AuditRecordItem(BaseModel):
    id: int
    event_id: str
    timestamp: str
    analysis_mode: str
    model_version: str
    model_status: str
    result_label: str
    synthetic_score: Optional[float]
    uncertainty_score: Optional[float]
    audio_quality: str
    audio_duration_seconds: Optional[float]
    processing_latency_ms: float
    risk_action: str
    reason_codes: List[str]
    transaction_amount: Optional[float]
    recipient_category: Optional[str]
    is_flagged_for_review: int


class AuditHistoryResponse(BaseModel):
    items: List[AuditRecordItem]
    total_count: int
    limit: int
    offset: int


class AnalyticsSummaryResponse(BaseModel):
    total_analyses: int
    genuine_count: int
    synthetic_count: int
    inconclusive_count: int
    verification_required_count: int
    avg_latency_ms: float
    risk_distribution: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
    model_status: Dict[str, Any]


class PrivacyStatusResponse(BaseModel):
    audio_retention_enabled: bool
    default_retention_policy: str
    ephemeral_storage_location: str
    active_temp_audio_files: int
    audit_logging_mode: str
    max_upload_size_mb: float
    max_duration_seconds: float
    data_separation: Dict[str, str]


class ModelEvaluationReportResponse(BaseModel):
    model_name: str
    model_version: str
    evaluation_status: str  # 'evaluated' or 'not_evaluated'
    dataset_info: Optional[Dict[str, Any]]
    metrics: Optional[Dict[str, Any]]
    confusion_matrix: Optional[Dict[str, int]]
    robustness_benchmarks: Optional[List[Dict[str, Any]]]
    limitations: List[str]
    disclaimer: str
