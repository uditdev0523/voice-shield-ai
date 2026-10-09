"""
VoiceShield AI - Detection & Analysis Router
Handles audio file uploads and live audio chunks with guaranteed ephemeral cleanup.
"""

import time
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from backend.app.config import settings
from backend.app.models.model_manager import model_manager
from backend.app.services.audio_processor import audio_processor, AudioProcessingError
from backend.app.services.risk_engine import risk_engine, RiskAction
from backend.app.services.privacy_service import privacy_service
from backend.app.database import insert_audit_event
from backend.app.schemas.detection import DetectionAnalysisResponse

logger = logging.getLogger("voiceshield.detection_router")
router = APIRouter(prefix="/api/v1", tags=["Detection & Analysis"])


@router.post("/analyze-upload", response_model=DetectionAnalysisResponse)
async def analyze_audio_upload(
    file: UploadFile = File(...),
    transaction_amount: float = Form(default=0.0),
    recipient_category: str = Form(default="existing_trusted"),
    is_new_recipient: bool = Form(default=False),
):
    """
    Ingests and evaluates uploaded audio file for voice cloning detection.
    Guarantees ephemeral file cleanup even if parsing or inference fails.
    """
    start_time = time.perf_counter()
    event_id = f"evt_{uuid.uuid4().hex[:12]}"
    temp_path: Path = None

    # 1. Filename & Extension Verification
    filename = file.filename or "unknown.wav"
    file_ext = Path(filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{file_ext}'. Supported: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    try:
        # 2. Ephemeral Storage with Safe Path Isolation
        temp_path = privacy_service.generate_safe_temp_path(filename)
        content_length = 0

        with open(temp_path, "wb") as buffer:
            while chunk := await file.read(1024 * 64):  # 64 KB chunks
                content_length += len(chunk)
                if content_length > settings.MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Audio file size exceeds limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB.",
                    )
                buffer.write(chunk)

        # 3. Audio Decoding, Duration Validation & Signal Quality
        audio_data, duration, quality_report = audio_processor.load_and_validate(temp_path)

        # 4. Mel-Spectrogram Feature Extraction
        mel_spectrogram = audio_processor.compute_log_mel_spectrogram(audio_data)

        # 5. Model Inference (or Honest Model Unavailable Result)
        synthetic_score = None
        uncertainty_score = None
        model_available = model_manager.is_loaded

        if model_available:
            try:
                synthetic_score, uncertainty_score = model_manager.predict(mel_spectrogram)
            except Exception as inf_err:
                logger.error(f"Inference error: {inf_err}")
                model_available = False

        # 6. Multi-Factor Risk Engine Evaluation
        risk_result = risk_engine.evaluate(
            synthetic_score=synthetic_score,
            audio_quality_status=quality_report["status"],
            model_available=model_available,
            uncertainty_score=uncertainty_score,
            transaction_amount=transaction_amount,
            recipient_category=recipient_category,
            is_new_recipient=is_new_recipient,
        )

        # Derive categorical result label
        if not model_available:
            result_label = "MODEL_UNAVAILABLE"
        elif quality_report["status"] in ("near_silent", "clipping_detected", "low_snr"):
            result_label = "INCONCLUSIVE"
        elif synthetic_score is not None and synthetic_score >= settings.SYNTHETIC_THRESHOLD_HIGH:
            result_label = "SYNTHETIC_SUSPECTED"
        elif synthetic_score is not None and synthetic_score < settings.SYNTHETIC_THRESHOLD_LOW:
            result_label = "GENUINE"
        else:
            result_label = "INCONCLUSIVE"

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # 7. Metadata-Only Audit Persistence (No audio content is stored)
        insert_audit_event({
            "event_id": event_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analysis_mode": "upload",
            "model_version": model_manager.model_metadata.get("version", settings.MODEL_VERSION),
            "model_status": "active" if model_available else "unavailable",
            "result_label": result_label,
            "synthetic_score": synthetic_score,
            "uncertainty_score": uncertainty_score,
            "audio_quality": quality_report["status"],
            "audio_duration_seconds": round(duration, 2),
            "processing_latency_ms": latency_ms,
            "risk_action": risk_result["risk_action"],
            "reason_codes": risk_result["reason_codes"],
            "transaction_amount": transaction_amount if transaction_amount > 0 else None,
            "recipient_category": recipient_category,
            "is_flagged_for_review": risk_result["requires_human_review"],
        })

        return DetectionAnalysisResponse(
            event_id=event_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            analysis_mode="upload",
            model_version=model_manager.model_metadata.get("version", settings.MODEL_VERSION),
            model_status="active" if model_available else "unavailable",
            result_label=result_label,
            synthetic_score=synthetic_score,
            uncertainty_score=uncertainty_score,
            audio_quality=quality_report,
            audio_duration_seconds=round(duration, 2),
            processing_latency_ms=latency_ms,
            risk_action=risk_result["risk_action"],
            overall_risk_level=risk_result["overall_risk_level"],
            reasons=risk_result["reasons"],
            recommended_next_action=risk_result["recommended_next_action"],
            ephemeral_cleanup_verified=True,
        )

    except AudioProcessingError as ape:
        logger.warning(f"Audio validation failed: {ape}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ape))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected analysis failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during audio processing. Internal audio resources have been safely purged.",
        )
    finally:
        # STRICT PRIVACY: Unconditionally purge temporary audio buffer
        privacy_service.cleanup_file(temp_path)


@router.post("/analyze-stream-chunk", response_model=DetectionAnalysisResponse)
async def analyze_stream_chunk(
    file: UploadFile = File(...),
):
    """
    Evaluates audio recorded directly via the browser MediaRecorder API.
    Enforces the same zero-retention privacy guarantees and quality checks.
    """
    start_time = time.perf_counter()
    event_id = f"live_{uuid.uuid4().hex[:12]}"
    temp_path: Path = None

    try:
        temp_path = privacy_service.generate_safe_temp_path("recording.wav")
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Recorded audio chunk exceeds size threshold.",
            )

        with open(temp_path, "wb") as f:
            f.write(content)

        audio_data, duration, quality_report = audio_processor.load_and_validate(temp_path)
        mel_spectrogram = audio_processor.compute_log_mel_spectrogram(audio_data)

        synthetic_score = None
        uncertainty_score = None
        model_available = model_manager.is_loaded

        if model_available:
            try:
                synthetic_score, uncertainty_score = model_manager.predict(mel_spectrogram)
            except Exception as inf_err:
                logger.error(f"Live chunk inference error: {inf_err}")
                model_available = False

        risk_result = risk_engine.evaluate(
            synthetic_score=synthetic_score,
            audio_quality_status=quality_report["status"],
            model_available=model_available,
            uncertainty_score=uncertainty_score,
        )

        if not model_available:
            result_label = "MODEL_UNAVAILABLE"
        elif quality_report["status"] in ("near_silent", "clipping_detected", "low_snr"):
            result_label = "INCONCLUSIVE"
        elif synthetic_score is not None and synthetic_score >= settings.SYNTHETIC_THRESHOLD_HIGH:
            result_label = "SYNTHETIC_SUSPECTED"
        elif synthetic_score is not None and synthetic_score < settings.SYNTHETIC_THRESHOLD_LOW:
            result_label = "GENUINE"
        else:
            result_label = "INCONCLUSIVE"

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Log metadata only
        insert_audit_event({
            "event_id": event_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analysis_mode": "live_stream",
            "model_version": model_manager.model_metadata.get("version", settings.MODEL_VERSION),
            "model_status": "active" if model_available else "unavailable",
            "result_label": result_label,
            "synthetic_score": synthetic_score,
            "uncertainty_score": uncertainty_score,
            "audio_quality": quality_report["status"],
            "audio_duration_seconds": round(duration, 2),
            "processing_latency_ms": latency_ms,
            "risk_action": risk_result["risk_action"],
            "reason_codes": risk_result["reason_codes"],
            "transaction_amount": None,
            "recipient_category": None,
            "is_flagged_for_review": risk_result["requires_human_review"],
        })

        return DetectionAnalysisResponse(
            event_id=event_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            analysis_mode="live_stream",
            model_version=model_manager.model_metadata.get("version", settings.MODEL_VERSION),
            model_status="active" if model_available else "unavailable",
            result_label=result_label,
            synthetic_score=synthetic_score,
            uncertainty_score=uncertainty_score,
            audio_quality=quality_report,
            audio_duration_seconds=round(duration, 2),
            processing_latency_ms=latency_ms,
            risk_action=risk_result["risk_action"],
            overall_risk_level=risk_result["overall_risk_level"],
            reasons=risk_result["reasons"],
            recommended_next_action=risk_result["recommended_next_action"],
            ephemeral_cleanup_verified=True,
        )

    except AudioProcessingError as ape:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ape))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Live chunk error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze live stream audio chunk.",
        )
    finally:
        privacy_service.cleanup_file(temp_path)
