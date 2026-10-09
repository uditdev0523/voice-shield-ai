"""
VoiceShield AI - Privacy Center Router
"""

from fastapi import APIRouter
from backend.app.services.privacy_service import privacy_service
from backend.app.schemas.audit import PrivacyStatusResponse

router = APIRouter(prefix="/api/v1/privacy", tags=["Privacy Center"])


@router.get("/status", response_model=PrivacyStatusResponse)
def get_privacy_status():
    """Returns actual real-time privacy settings and transient file metrics."""
    return privacy_service.get_privacy_status()


@router.post("/purge")
def force_purge_transient_audio():
    """Forces immediate sweep and purge of any transient audio artifacts."""
    count = privacy_service.purge_abandoned_temp_files(max_age_seconds=0)
    return {
        "status": "purged",
        "purged_files_count": count,
        "message": "All transient audio buffers have been verified clean.",
    }
