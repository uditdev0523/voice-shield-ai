"""
VoiceShield AI - Banking Simulation Router
Simulated payment authorization and scenario risk testing.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter

from backend.app.models.model_manager import model_manager
from backend.app.services.risk_engine import risk_engine, RiskAction
from backend.app.schemas.banking import BankingSimulationRequest, BankingSimulationResponse

router = APIRouter(prefix="/api/v1/banking", tags=["Banking Simulator"])


@router.post("/simulate", response_model=BankingSimulationResponse)
def simulate_banking_transaction(req: BankingSimulationRequest):
    """
    Evaluates multi-factor financial decision policies against a simulated transaction context.
    """
    simulation_id = f"sim_{uuid.uuid4().hex[:10]}"

    # Use explicitly passed simulated voice score if provided, else check model availability
    voice_score = req.simulated_voice_score
    model_available = True if voice_score is not None else model_manager.is_loaded

    # Calculate model uncertainty if score is present
    uncertainty = None
    if voice_score is not None:
        uncertainty = round(1.0 - (2.0 * abs(voice_score - 0.5)), 4)

    risk_eval = risk_engine.evaluate(
        synthetic_score=voice_score,
        audio_quality_status=req.audio_quality_override or "optimal",
        model_available=model_available,
        uncertainty_score=uncertainty,
        transaction_amount=req.transaction_amount,
        recipient_category=req.recipient_category,
        is_new_recipient=req.is_new_recipient,
        historical_caller_flagged=req.historical_caller_flagged,
    )

    return BankingSimulationResponse(
        simulation_id=simulation_id,
        timestamp=datetime.now(timezone.utc).isoformat(),
        transaction_type=req.transaction_type,
        transaction_amount=req.transaction_amount,
        recipient_category=req.recipient_category,
        is_new_recipient=req.is_new_recipient,
        voice_score_evaluated=voice_score,
        audio_quality_status=req.audio_quality_override or "optimal",
        risk_action=risk_eval["risk_action"],
        overall_risk_level=risk_eval["overall_risk_level"],
        reason_codes=risk_eval["reason_codes"],
        reasons=risk_eval["reasons"],
        recommended_next_action=risk_eval["recommended_next_action"],
        allows_simulated_dispatch=risk_eval["allows_simulated_dispatch"],
        requires_human_review=risk_eval["requires_human_review"],
    )


@router.get("/scenarios", response_model=List[Dict[str, Any]])
def get_preset_banking_scenarios():
    """
    Returns realistic educational test scenarios illustrating how the risk engine
    combines acoustic signals with transaction context to make fair, defensible decisions.
    """
    return [
        {
            "id": "scenario_ceo_fraud",
            "name": "Executive Impersonation (CEO Wire Fraud)",
            "description": "Urgent phone request from an executive voice requesting an expedited $45,000 international transfer to a newly formed entity.",
            "request": {
                "transaction_type": "wire_transfer",
                "transaction_amount": 45000.0,
                "recipient_category": "new_unverified",
                "is_new_recipient": True,
                "historical_caller_flagged": False,
                "simulated_voice_score": 0.94,
                "audio_quality_override": "optimal",
            },
            "expected_outcome": "PAUSE_AND_VERIFY",
            "takeaway": "High synthetic probability combined with a high-value new payee immediately halts automated release and triggers an out-of-band verification protocol.",
        },
        {
            "id": "scenario_grandparent_emergency",
            "name": "Family Emergency / Grandparent Impersonation",
            "description": "Distressed voice claiming to be a family member demanding an immediate $3,200 peer transfer to settle urgent medical bills.",
            "request": {
                "transaction_type": "peer_payment",
                "transaction_amount": 3200.0,
                "recipient_category": "new_unverified",
                "is_new_recipient": True,
                "historical_caller_flagged": False,
                "simulated_voice_score": 0.82,
                "audio_quality_override": "optimal",
            },
            "expected_outcome": "STEP_UP_VERIFICATION",
            "takeaway": "Elevated synthetic score prompts an SMS challenge to the known phone on file, frustrating the imposter without blocking the account.",
        },
        {
            "id": "scenario_legitimate_routine",
            "name": "Routine Domestic Bill Payment",
            "description": "Regular customer authorizing an ordinary $185 payment to their verified recurring utility provider.",
            "request": {
                "transaction_type": "peer_payment",
                "transaction_amount": 185.0,
                "recipient_category": "existing_trusted",
                "is_new_recipient": False,
                "historical_caller_flagged": False,
                "simulated_voice_score": 0.08,
                "audio_quality_override": "optimal",
            },
            "expected_outcome": "CONTINUE_SIMULATED_FLOW",
            "takeaway": "Genuine acoustic acoustics and established payee allow low friction without unnecessary security hurdles.",
        },
        {
            "id": "scenario_noisy_environment",
            "name": "Airport Background Noise (Degraded Audio)",
            "description": "Legitimate customer calling from a busy airport terminal; heavy background announcements cause high acoustic noise.",
            "request": {
                "transaction_type": "wire_transfer",
                "transaction_amount": 1200.0,
                "recipient_category": "existing_trusted",
                "is_new_recipient": False,
                "historical_caller_flagged": False,
                "simulated_voice_score": 0.52,
                "audio_quality_override": "low_snr",
            },
            "expected_outcome": "INCONCLUSIVE_VERIFY",
            "takeaway": "Poor SNR prevents false-positive overconfidence; system asks the user for a secondary verification without treating them like a criminal.",
        },
        {
            "id": "scenario_genuine_high_value",
            "name": "Legitimate High-Value Real Estate Deposit",
            "description": "Verified customer transferring $85,000 for escrow deposit with genuine acoustic biometric score.",
            "request": {
                "transaction_type": "wire_transfer",
                "transaction_amount": 85000.0,
                "recipient_category": "new_unverified",
                "is_new_recipient": True,
                "historical_caller_flagged": False,
                "simulated_voice_score": 0.05,
                "audio_quality_override": "optimal",
            },
            "expected_outcome": "STEP_UP_VERIFICATION",
            "takeaway": "Even with a 100% genuine voice, bank policy mandates step-up verification for any five-figure transfer to a brand-new payee.",
        },
    ]
