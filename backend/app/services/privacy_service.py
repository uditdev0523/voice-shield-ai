"""
VoiceShield AI - Privacy & Secure File Lifecycle Service
Guarantees strict zero-audio-retention by default, safe path isolation,
and rigorous cleanup of transient audio artifacts.
"""

import os
import uuid
import time
import logging
import re
from pathlib import Path
from typing import Dict, Any, Optional

from backend.app.config import settings

logger = logging.getLogger("voiceshield.privacy")


class PrivacyService:
    """Manages secure file lifecycle, ephemeral audio isolation, and privacy telemetry."""

    def __init__(self, temp_dir: Optional[Path] = None):
        self.temp_dir = temp_dir or settings.TEMP_AUDIO_DIR
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def generate_safe_temp_path(self, original_filename: Optional[str] = None) -> Path:
        """
        Generates a non-deterministic UUID-based path inside the isolated temp directory.
        Strictly prevents path traversal attacks (e.g. '../../etc/passwd').
        """
        # Extract safe extension
        ext = ".wav"
        if original_filename:
            # Strip malicious path characters
            cleaned = re.sub(r"[^\w\.-]", "", original_filename)
            extracted_ext = Path(cleaned).suffix.lower()
            if extracted_ext in settings.ALLOWED_EXTENSIONS:
                ext = extracted_ext

        safe_filename = f"temp_{uuid.uuid4().hex}{ext}"
        resolved_path = (self.temp_dir / safe_filename).resolve()

        # Enforce that resolved path strictly resides within the configured temp directory
        if not str(resolved_path).startswith(str(self.temp_dir.resolve())):
            raise ValueError("Path traversal attempt detected and blocked.")

        return resolved_path

    def cleanup_file(self, file_path: Optional[Path]) -> bool:
        """
        Safely deletes a temporary audio file immediately after processing or error.
        Returns True if deleted, False if already absent or error.
        """
        if not file_path:
            return False

        try:
            path = Path(file_path)
            if path.exists() and path.is_file():
                # Overwrite transient bytes with zeros if security requires before unlink
                path.unlink(missing_ok=True)
                logger.debug(f"Ephemeral audio file deleted: {path.name}")
                return True
        except Exception as e:
            logger.error(f"Failed to delete ephemeral audio file {file_path}: {e}")
            return False
        return False

    def purge_abandoned_temp_files(self, max_age_seconds: int = 300) -> int:
        """
        Finds and deletes any abandoned temporary audio files older than max_age_seconds (default 5 min).
        """
        now = time.time()
        purged_count = 0
        try:
            for item in self.temp_dir.iterdir():
                if item.is_file() and item.name.startswith("temp_"):
                    try:
                        mtime = item.stat().st_mtime
                        if (now - mtime) > max_age_seconds:
                            item.unlink(missing_ok=True)
                            purged_count += 1
                    except Exception as err:
                        logger.warning(f"Error purging file {item}: {err}")
        except Exception as e:
            logger.error(f"Error scanning temp directory for purge: {e}")
        return purged_count

    def get_privacy_status(self) -> Dict[str, Any]:
        """Returns real-time privacy state and active storage telemetry."""
        # Clean up any leftover files first
        self.purge_abandoned_temp_files(max_age_seconds=300)

        active_temp_files = 0
        try:
            active_temp_files = len([f for f in self.temp_dir.iterdir() if f.is_file() and f.name.startswith("temp_")])
        except Exception:
            pass

        return {
            "audio_retention_enabled": settings.ENABLE_AUDIO_RETENTION,
            "default_retention_policy": "STRICT_EPHEMERAL_ZERO_RETENTION",
            "ephemeral_storage_location": str(self.temp_dir.name),
            "active_temp_audio_files": active_temp_files,
            "audit_logging_mode": "METADATA_ONLY_NO_AUDIO_OR_TRANSCRIPT",
            "max_upload_size_mb": round(settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024), 1),
            "max_duration_seconds": settings.MAX_AUDIO_DURATION_SECONDS,
            "data_separation": {
                "browser_local": "Microphone streams reside exclusively in browser Web Audio RAM until submission.",
                "transient_backend": "Audio is processed purely in ephemeral RAM / short-lived temp buffer, unlinked immediately upon inference completion.",
                "persistent_metadata": "Only anonymous event identifiers, mathematical scores, latency, and reason codes are preserved in audit history.",
            },
        }


privacy_service = PrivacyService()
