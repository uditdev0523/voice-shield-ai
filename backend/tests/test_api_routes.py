"""
VoiceShield AI - API Endpoints Integration Tests
Tests routes with httpx TestClient
"""

import io
import pytest
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import init_db, clear_audit_history


@pytest.fixture
def client():
    init_db()
    clear_audit_history()
    with TestClient(app) as test_client:
        yield test_client
    clear_audit_history()


def create_test_wav_bytes(duration: float = 1.0, sr: int = 16000) -> bytes:
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    data = 0.5 * np.sin(2 * np.pi * 440.0 * t)
    buf = io.BytesIO()
    sf.write(buf, data.astype(np.float32), sr, format="WAV")
    buf.seek(0)
    return buf.read()


def test_health_endpoints(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "model" in data
    assert "privacy" in data


def test_banking_scenarios(client):
    res = client.get("/api/v1/banking/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 5
    assert scenarios[0]["id"] == "scenario_ceo_fraud"


def test_banking_simulation(client):
    payload = {
        "transaction_type": "wire_transfer",
        "transaction_amount": 12000.0,
        "recipient_category": "new_unverified",
        "is_new_recipient": True,
        "simulated_voice_score": 0.91,
        "audio_quality_override": "optimal",
    }
    res = client.post("/api/v1/banking/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_action"] == "PAUSE_AND_VERIFY"
    assert data["overall_risk_level"] == "CRITICAL"
    assert data["requires_human_review"] is True
    assert "HIGH_SYNTHETIC_PROBABILITY" in data["reason_codes"]


def test_privacy_endpoints(client):
    res = client.get("/api/v1/privacy/status")
    assert res.status_code == 200
    data = res.json()
    assert data["audio_retention_enabled"] is False
    assert data["default_retention_policy"] == "STRICT_EPHEMERAL_ZERO_RETENTION"

    purge_res = client.post("/api/v1/privacy/purge")
    assert purge_res.status_code == 200
    assert purge_res.json()["status"] == "purged"


def test_model_evaluation_report(client):
    res = client.get("/api/v1/model/evaluation-report")
    assert res.status_code == 200
    data = res.json()
    assert data["evaluation_status"] in ("evaluated", "not_evaluated")
    assert "limitations" in data


def test_analyze_upload_success(client):
    wav_bytes = create_test_wav_bytes(duration=1.2)
    files = {"file": ("sample.wav", wav_bytes, "audio/wav")}
    data = {
        "transaction_amount": 250.0,
        "recipient_category": "existing_trusted",
        "is_new_recipient": "false",
    }
    res = client.post("/api/v1/analyze-upload", files=files, data=data)
    assert res.status_code == 200
    resp_data = res.json()

    assert resp_data["analysis_mode"] == "upload"
    assert resp_data["ephemeral_cleanup_verified"] is True
    assert "risk_action" in resp_data
    assert "audio_quality" in resp_data


def test_analyze_upload_unsupported_format(client):
    files = {"file": ("malicious.exe", b"MZ_binary_content", "application/octet-stream")}
    res = client.post("/api/v1/analyze-upload", files=files)
    assert res.status_code == 400
    assert "Unsupported audio format" in res.json()["detail"]


def test_audit_history_and_export(client):
    # First trigger an upload so an audit record is created
    wav_bytes = create_test_wav_bytes(duration=1.0)
    client.post("/api/v1/analyze-upload", files={"file": ("test.wav", wav_bytes, "audio/wav")})

    history_res = client.get("/api/v1/audit/history")
    assert history_res.status_code == 200
    hist_data = history_res.json()
    assert hist_data["total_count"] >= 1

    csv_res = client.get("/api/v1/audit/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "event_id,timestamp" in csv_res.text
