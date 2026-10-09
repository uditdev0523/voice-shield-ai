"""
VoiceShield AI - Metadata-Only Audit Storage & Privacy Boundary Tests
"""

import uuid
import pytest
from backend.app.database import (
    init_db,
    insert_audit_event,
    query_audit_logs,
    get_analytics_metrics,
    clear_audit_history,
)


@pytest.fixture(autouse=True)
def setup_database():
    init_db()
    clear_audit_history()
    yield
    clear_audit_history()


def test_insert_and_query_minimal_metadata():
    event_id = f"test_{uuid.uuid4().hex[:8]}"
    insert_audit_event({
        "event_id": event_id,
        "analysis_mode": "upload",
        "model_version": "v1.0.0-cnn-bigru",
        "model_status": "active",
        "result_label": "GENUINE",
        "synthetic_score": 0.08,
        "uncertainty_score": 0.16,
        "audio_quality": "optimal",
        "audio_duration_seconds": 2.5,
        "processing_latency_ms": 120.0,
        "risk_action": "CONTINUE_SIMULATED_FLOW",
        "reason_codes": ["ACOUSTICALLY_CONSISTENT"],
        "transaction_amount": 500.0,
        "recipient_category": "existing_trusted",
        "is_flagged_for_review": False,
    })

    items, total = query_audit_logs(limit=10, offset=0)
    assert total >= 1
    found = [i for i in items if i["event_id"] == event_id]
    assert len(found) == 1
    record = found[0]

    assert record["result_label"] == "GENUINE"
    assert record["synthetic_score"] == 0.08
    assert "ACOUSTICALLY_CONSISTENT" in record["reason_codes"]


def test_strict_privacy_safeguard_rejects_audio_keys():
    # If any developer or route accidentally tries to insert raw audio into the audit log,
    # the database layer MUST throw a ValueError and reject it!
    with pytest.raises(ValueError) as exc:
        insert_audit_event({
            "event_id": "violation_test",
            "audio": b"raw_audio_leak_bytes",
            "risk_action": "CONTINUE_SIMULATED_FLOW",
            "reason_codes": [],
        })
    assert "Privacy violation" in str(exc.value)

    with pytest.raises(ValueError):
        insert_audit_event({
            "event_id": "violation_transcript",
            "transcript": "Hello bank transfer me money",
            "risk_action": "CONTINUE_SIMULATED_FLOW",
            "reason_codes": [],
        })


def test_query_filtering_and_analytics():
    # Insert one genuine and one synthetic
    insert_audit_event({
        "event_id": "ev_gen",
        "analysis_mode": "upload",
        "model_version": "v1.0.0-cnn-bigru",
        "model_status": "active",
        "result_label": "GENUINE",
        "synthetic_score": 0.05,
        "audio_quality": "optimal",
        "processing_latency_ms": 100.0,
        "risk_action": "CONTINUE_SIMULATED_FLOW",
        "reason_codes": ["ACOUSTICALLY_CONSISTENT"],
    })
    insert_audit_event({
        "event_id": "ev_syn",
        "analysis_mode": "upload",
        "model_version": "v1.0.0-cnn-bigru",
        "model_status": "active",
        "result_label": "SYNTHETIC_SUSPECTED",
        "synthetic_score": 0.95,
        "audio_quality": "optimal",
        "processing_latency_ms": 150.0,
        "risk_action": "PAUSE_AND_VERIFY",
        "reason_codes": ["HIGH_SYNTHETIC_PROBABILITY"],
    })

    gen_items, gen_count = query_audit_logs(result_label="GENUINE")
    assert gen_count == 1
    assert gen_items[0]["event_id"] == "ev_gen"

    metrics = get_analytics_metrics()
    assert metrics["total_analyses"] == 2
    assert metrics["genuine_count"] == 1
    assert metrics["synthetic_count"] == 1
