"""
VoiceShield AI - Detection Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SignalQualityResponse(BaseModel):
    status: str = Field(..., description="Signal quality status: optimal, clipping_detected, low_snr, near_silent")
    description: str
    rms_energy: float
    peak_amplitude: float
    clipping_ratio: float
    snr_db: float
    has_clipping: bool
    is_near_silent: bool
    is_low_snr: bool


class ReasonItem(BaseModel):
    code: str
    message: str


class DetectionAnalysisResponse(BaseModel):
    event_id: str
    timestamp: str
    analysis_mode: str = Field(..., description="'upload' or 'live_stream'")
    model_version: str
    model_status: str = Field(..., description="'active' or 'unavailable'")
    result_label: str = Field(..., description="'GENUINE', 'SYNTHETIC_SUSPECTED', 'INCONCLUSIVE', 'MODEL_UNAVAILABLE'")
    synthetic_score: Optional[float] = None
    uncertainty_score: Optional[float] = None
    audio_quality: SignalQualityResponse
    audio_duration_seconds: float
    processing_latency_ms: float
    risk_action: str
    overall_risk_level: str
    reasons: List[ReasonItem]
    recommended_next_action: str
    ephemeral_cleanup_verified: bool = True
