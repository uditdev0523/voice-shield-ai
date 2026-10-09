"""
VoiceShield AI - Health & System Status Router
"""

import time
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.models.model_manager import model_manager
from backend.app.services.privacy_service import privacy_service

router = APIRouter(tags=["Health & Status"])
START_TIME = time.time()


@router.get("/health")
@router.get("/api/v1/health")
def health_check():
    """System health check and local PyTorch model availability status."""
    model_status = model_manager.get_status()
    privacy_status = privacy_service.get_privacy_status()

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "model": {
            "available": model_status["available"],
            "version": model_status["version"],
            "device": model_status["device"],
            "load_error": model_status["load_error"],
        },
        "privacy": {
            "zero_audio_retention": not privacy_status["audio_retention_enabled"],
            "active_temp_files": privacy_status["active_temp_audio_files"],
        },
    }
