"""
VoiceShield AI - Banking Risk Decision Engine Unit Tests
"""

import pytest
from backend.app.services.risk_engine import RiskDecisionEngine, RiskAction


@pytest.fixture
def engine():
    return RiskDecisionEngine(threshold_low=0.35, threshold_high=0.70, high_amount_threshold=5000.0)


def test_genuine_routine_transaction_clears(engine):
    # Low synthetic score, low amount, trusted recipient -> CONTINUE_SIMULATED_FLOW
    res = engine.evaluate(
        synthetic_score=0.10,
        audio_quality_status="optimal",
        model_available=True,
        transaction_amount=250.0,
        recipient_category="existing_trusted",
        is_new_recipient=False,
    )
    assert res["risk_action"] == RiskAction.CONTINUE_SIMULATED_FLOW
    assert res["overall_risk_level"] == "LOW"
    assert res["allows_simulated_dispatch"] is True
    assert "ACOUSTICALLY_CONSISTENT" in res["reason_codes"]


def test_high_synthetic_score_high_amount_triggers_pause(engine):
    # High score (0.92) + High amount ($15,000) -> PAUSE_AND_VERIFY
    res = engine.evaluate(
        synthetic_score=0.92,
        audio_quality_status="optimal",
        model_available=True,
        transaction_amount=15000.0,
        recipient_category="new_unverified",
        is_new_recipient=True,
    )
    assert res["risk_action"] == RiskAction.PAUSE_AND_VERIFY
    assert res["overall_risk_level"] == "CRITICAL"
    assert res["requires_human_review"] is True
    assert res["allows_simulated_dispatch"] is False
    assert "HIGH_SYNTHETIC_PROBABILITY" in res["reason_codes"]
    assert "TRANSACTION_AMOUNT_ELEVATED" in res["reason_codes"]


def test_high_synthetic_score_never_auto_blocks_user(engine):
    # Even if synthetic score is 0.99, it requires verification, NOT permanent account destruction
    res = engine.evaluate(
        synthetic_score=0.99,
        audio_quality_status="optimal",
        model_available=True,
        transaction_amount=100.0,
        recipient_category="existing_trusted",
    )
    # Recommended step must propose out-of-band verification
    assert "secondary" in res["recommended_next_action"].lower() or "callback" in res["recommended_next_action"].lower()


def test_poor_audio_quality_triggers_inconclusive(engine):
    # Clipping detected
    res = engine.evaluate(
        synthetic_score=0.15,
        audio_quality_status="clipping_detected",
        model_available=True,
        transaction_amount=500.0,
    )
    assert res["risk_action"] == RiskAction.INCONCLUSIVE_VERIFY
    assert "AUDIO_DEFECT_CLIPPING_DETECTED" in res["reason_codes"]


def test_high_uncertainty_triggers_inconclusive(engine):
    # Ambiguous model inference near 0.5 boundary (uncertainty > 0.65)
    res = engine.evaluate(
        synthetic_score=0.48,
        audio_quality_status="optimal",
        model_available=True,
        uncertainty_score=0.96,
        transaction_amount=500.0,
    )
    assert res["risk_action"] == RiskAction.INCONCLUSIVE_VERIFY
    assert "ELEVATED_UNCERTAINTY" in res["reason_codes"]


def test_model_offline_fails_safely(engine):
    # When model is unavailable, it must fail safely
    res_low = engine.evaluate(
        synthetic_score=None,
        audio_quality_status="optimal",
        model_available=False,
        transaction_amount=200.0,
    )
    assert res_low["risk_action"] == RiskAction.MODEL_UNAVAILABLE
    assert "MODEL_OFFLINE" in res_low["reason_codes"]

    # High amount when model is offline triggers STEP_UP_VERIFICATION
    res_high = engine.evaluate(
        synthetic_score=None,
        audio_quality_status="optimal",
        model_available=False,
        transaction_amount=10000.0,
        is_new_recipient=True,
    )
    assert res_high["risk_action"] == RiskAction.STEP_UP_VERIFICATION
    assert "HIGH_VALUE_FALLBACK" in res_high["reason_codes"]
