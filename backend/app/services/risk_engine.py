"""
VoiceShield AI - Multi-Factor Banking Risk Engine
Combines voice synthesis scores, audio signal quality, model uncertainty,
and financial transaction context into actionable, defensible mitigation decisions.

CRITICAL PRINCIPLES:
1. Synthetic voice score is a statistical signal, NEVER proof of fraud or identity.
2. Legitimate callers are NEVER summarily blocked without independent recourse.
3. Elevated risk prompts independent out-of-band verification (SMS, biometric token, callback).
4. Audio defects (clipping, silence) and model unavailability trigger safe fallback paths.
"""

from typing import Dict, Any, List, Optional
from backend.app.config import settings


class RiskAction:
    CONTINUE_SIMULATED_FLOW = "CONTINUE_SIMULATED_FLOW"
    STEP_UP_VERIFICATION = "STEP_UP_VERIFICATION"
    PAUSE_AND_VERIFY = "PAUSE_AND_VERIFY"
    INCONCLUSIVE_VERIFY = "INCONCLUSIVE_VERIFY"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"


class RiskDecisionEngine:
    """Evaluates multi-factor risk policies for simulated banking transactions."""

    def __init__(
        self,
        threshold_low: float = settings.SYNTHETIC_THRESHOLD_LOW,
        threshold_high: float = settings.SYNTHETIC_THRESHOLD_HIGH,
        high_amount_threshold: float = settings.HIGH_TRANSACTION_AMOUNT,
    ):
        self.threshold_low = threshold_low
        self.threshold_high = threshold_high
        self.high_amount_threshold = high_amount_threshold

    def evaluate(
        self,
        synthetic_score: Optional[float],
        audio_quality_status: str,
        model_available: bool,
        uncertainty_score: Optional[float] = None,
        transaction_amount: float = 0.0,
        recipient_category: str = "existing_trusted",
        is_new_recipient: bool = False,
        historical_caller_flagged: bool = False,
    ) -> Dict[str, Any]:
        """
        Calculates holistic risk decision and contextual explanations.
        """
        reasons: List[Dict[str, str]] = []
        is_high_value = transaction_amount >= self.high_amount_threshold
        is_new_payee = is_new_recipient or recipient_category in ("new_unverified", "high_risk_flagged")

        # 1. Check Model Availability First
        if not model_available or synthetic_score is None:
            reasons.append({
                "code": "MODEL_OFFLINE",
                "message": "Acoustic spoofing detection model is currently unavailable on this instance."
            })
            if is_high_value or is_new_payee:
                action = RiskAction.STEP_UP_VERIFICATION
                reasons.append({
                    "code": "HIGH_VALUE_FALLBACK",
                    "message": "High-value or new recipient transaction requires secondary verification channel."
                })
            else:
                action = RiskAction.MODEL_UNAVAILABLE
                reasons.append({
                    "code": "SAFE_CONTINUE_LOW_RISK",
                    "message": "Proceeding with standard non-biometric transaction safeguards."
                })

            return self._build_result(
                action=action,
                reasons=reasons,
                overall_risk="MEDIUM" if (is_high_value or is_new_payee) else "LOW",
                synthetic_score=None,
                uncertainty_score=None,
                suggested_step="Request secondary out-of-band confirmation via registered mobile app.",
            )

        # 2. Check Signal Quality Defects
        if audio_quality_status in ("near_silent", "clipping_detected", "low_snr"):
            reasons.append({
                "code": f"AUDIO_DEFECT_{audio_quality_status.upper()}",
                "message": f"Audio exhibits signal anomalies ({audio_quality_status}). Acoustic artifacts may impair reliable classification."
            })
            action = RiskAction.INCONCLUSIVE_VERIFY
            suggested_step = "Prompt caller to repeat the security phrase in a quiet environment, or use backup SMS OTP."
            return self._build_result(
                action=action,
                reasons=reasons,
                overall_risk="MEDIUM",
                synthetic_score=synthetic_score,
                uncertainty_score=uncertainty_score,
                suggested_step=suggested_step,
            )

        # 3. Check High Model Uncertainty
        if uncertainty_score is not None and uncertainty_score > 0.65:
            reasons.append({
                "code": "ELEVATED_UNCERTAINTY",
                "message": f"Model inference is near decision boundary (uncertainty index {uncertainty_score:.2f})."
            })
            action = RiskAction.INCONCLUSIVE_VERIFY
            suggested_step = "Initiate challenge-response phrase or verify caller through mobile push token."
            return self._build_result(
                action=action,
                reasons=reasons,
                overall_risk="MEDIUM",
                synthetic_score=synthetic_score,
                uncertainty_score=uncertainty_score,
                suggested_step=suggested_step,
            )

        # 4. Contextual Risk Factor Additions
        if is_high_value:
            reasons.append({
                "code": "TRANSACTION_AMOUNT_ELEVATED",
                "message": f"Simulated transaction amount (${transaction_amount:,.2f}) exceeds threshold (${self.high_amount_threshold:,.2f})."
            })
        if is_new_payee:
            reasons.append({
                "code": "NEW_RECIPIENT_RISK",
                "message": f"Recipient '{recipient_category}' is newly added or unverified."
            })
        if historical_caller_flagged:
            reasons.append({
                "code": "CALLER_ACCOUNT_FLAGGED",
                "message": "Account has previous dispute or suspicious access flags."
            })

        # 5. Core Voice Score Evaluation
        if synthetic_score >= self.threshold_high:
            # High Synthetic Voice Score
            reasons.append({
                "code": "HIGH_SYNTHETIC_PROBABILITY",
                "message": f"Voice analysis indicates high probability ({synthetic_score * 100:.1f}%) of synthetic speech or cloning."
            })

            if is_high_value or is_new_payee or historical_caller_flagged:
                action = RiskAction.PAUSE_AND_VERIFY
                suggested_step = "Temporarily pause payment dispatch. Require independent callback to registered customer phone number and fraud desk review."
                overall_risk = "CRITICAL"
            else:
                action = RiskAction.STEP_UP_VERIFICATION
                suggested_step = "Require secondary authentication (e.g. FIDO2 hardware token or live video biometric check)."
                overall_risk = "HIGH"

        elif synthetic_score >= self.threshold_low:
            # Medium / Ambiguous Synthetic Voice Score
            reasons.append({
                "code": "ELEVATED_SYNTHETIC_RISK",
                "message": f"Voice analysis indicates moderate synthetic speech probability ({synthetic_score * 100:.1f}%)."
            })

            if is_high_value or is_new_payee:
                action = RiskAction.STEP_UP_VERIFICATION
                suggested_step = "Request in-app banking approval notification before releasing funds."
                overall_risk = "HIGH"
            else:
                action = RiskAction.STEP_UP_VERIFICATION
                suggested_step = "Standard step-up verification via SMS one-time passcode."
                overall_risk = "MEDIUM"

        else:
            # Low Synthetic Voice Score (Acoustically Genuine)
            reasons.append({
                "code": "ACOUSTICALLY_CONSISTENT",
                "message": f"Acoustic features are consistent with genuine human speech (synthetic score: {synthetic_score * 100:.1f}%)."
            })

            if is_high_value and is_new_payee:
                # Even genuine voice should step up if sending $50k to an unknown account
                action = RiskAction.STEP_UP_VERIFICATION
                suggested_step = "Standard banking policy: new high-value payee requires SMS confirmation."
                overall_risk = "MEDIUM"
            else:
                action = RiskAction.CONTINUE_SIMULATED_FLOW
                suggested_step = "Transaction cleared to proceed through simulated payment processing pipeline."
                overall_risk = "LOW"

        return self._build_result(
            action=action,
            reasons=reasons,
            overall_risk=overall_risk,
            synthetic_score=synthetic_score,
            uncertainty_score=uncertainty_score,
            suggested_step=suggested_step,
        )

    def _build_result(
        self,
        action: str,
        reasons: List[Dict[str, str]],
        overall_risk: str,
        synthetic_score: Optional[float],
        uncertainty_score: Optional[float],
        suggested_step: str,
    ) -> Dict[str, Any]:
        return {
            "risk_action": action,
            "overall_risk_level": overall_risk,
            "synthetic_score": synthetic_score,
            "uncertainty_score": uncertainty_score,
            "reasons": reasons,
            "reason_codes": [r["code"] for r in reasons],
            "recommended_next_action": suggested_step,
            "requires_human_review": action in (RiskAction.PAUSE_AND_VERIFY, RiskAction.MANUAL_REVIEW),
            "allows_simulated_dispatch": action == RiskAction.CONTINUE_SIMULATED_FLOW,
        }


risk_engine = RiskDecisionEngine()
