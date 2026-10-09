"""
VoiceShield AI - Privacy Lifecycle & File Cleanup Tests
"""

import time
from pathlib import Path
import pytest

from backend.app.services.privacy_service import PrivacyService


@pytest.fixture
def temp_privacy_service(tmp_path):
    return PrivacyService(temp_dir=tmp_path)


def test_generate_safe_temp_path_prevents_traversal(temp_privacy_service):
    # Attempt path traversal
    safe_path = temp_privacy_service.generate_safe_temp_path("../../etc/passwd.wav")
    assert safe_path.parent == temp_privacy_service.temp_dir
    assert ".." not in str(safe_path)
    assert safe_path.suffix == ".wav"


def test_cleanup_file_deletes_file(temp_privacy_service):
    file_path = temp_privacy_service.generate_safe_temp_path("test.wav")
    file_path.write_bytes(b"dummy_transient_audio_data")
    assert file_path.exists()

    result = temp_privacy_service.cleanup_file(file_path)
    assert result is True
    assert not file_path.exists()


def test_cleanup_nonexistent_file_returns_false(temp_privacy_service):
    fake_path = temp_privacy_service.temp_dir / "temp_fake_does_not_exist.wav"
    assert temp_privacy_service.cleanup_file(fake_path) is False


def test_purge_abandoned_temp_files(temp_privacy_service):
    f1 = temp_privacy_service.temp_dir / "temp_old.wav"
    f1.write_bytes(b"old")
    f2 = temp_privacy_service.temp_dir / "temp_new.wav"
    f2.write_bytes(b"new")

    # Artificially alter mtime of f1 to 10 minutes ago
    ten_min_ago = time.time() - 600
    import os
    os.utime(f1, (ten_min_ago, ten_min_ago))

    purged = temp_privacy_service.purge_abandoned_temp_files(max_age_seconds=300)
    assert purged == 1
    assert not f1.exists()
    assert f2.exists()


def test_privacy_status_telemetry(temp_privacy_service):
    status = temp_privacy_service.get_privacy_status()
    assert "audio_retention_enabled" in status
    assert status["audio_retention_enabled"] is False
    assert status["default_retention_policy"] == "STRICT_EPHEMERAL_ZERO_RETENTION"
    assert "browser_local" in status["data_separation"]
    assert "transient_backend" in status["data_separation"]
    assert "persistent_metadata" in status["data_separation"]
