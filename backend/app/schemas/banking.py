"""
VoiceShield AI - Banking Simulation Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class BankingSimulationRequest(BaseModel):
    transaction_type: str = Field(default="wire_transfer", description="wire_transfer, peer_payment, account_change, loan_request")
    transaction_amount: float = Field(default=2500.0, ge=0.0, description="Simulated monetary amount")
    recipient_category: str = Field(default="existing_trusted", description="existing_trusted, new_unverified, high_risk_flagged")
    is_new_recipient: bool = Field(default=False)
    historical_caller_flagged: bool = Field(default=False)
    simulated_voice_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Override score or None to use default model")
    audio_quality_override: Optional[str] = Field(default="optimal", description="optimal, low_snr, clipping_detected, near_silent")


class BankingSimulationResponse(BaseModel):
    simulation_id: str
    timestamp: str
    transaction_type: str
    transaction_amount: float
    recipient_category: str
    is_new_recipient: bool
    voice_score_evaluated: Optional[float]
    audio_quality_status: str
    risk_action: str
    overall_risk_level: str
    reason_codes: List[str]
    reasons: List[dict]
    recommended_next_action: str
    allows_simulated_dispatch: bool
    requires_human_review: bool
    disclaimer: str = "SIMULATION ONLY. This sandbox never connects to real payment rails or live banking credentials."
