"""
VoiceShield AI - Audit History & Forensic Telemetry Router
"""

import io
import csv
from typing import Optional
from fastapi import APIRouter, Query, Response
from fastapi.responses import StreamingResponse

from backend.app.database import query_audit_logs, clear_audit_history
from backend.app.schemas.audit import AuditHistoryResponse

router = APIRouter(prefix="/api/v1/audit", tags=["Audit & History"])


@router.get("/history", response_model=AuditHistoryResponse)
def get_audit_history(
    search: Optional[str] = Query(default=None, description="Search event ID or reasons"),
    risk_action: Optional[str] = Query(default=None),
    result_label: Optional[str] = Query(default=None),
    analysis_mode: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """Fetches paginated audit events with multi-criteria filtering."""
    items, total_count = query_audit_logs(
        search=search,
        risk_action=risk_action,
        result_label=result_label,
        analysis_mode=analysis_mode,
        limit=limit,
        offset=offset,
    )
    return AuditHistoryResponse(items=items, total_count=total_count, limit=limit, offset=offset)


@router.get("/export-csv")
def export_audit_csv():
    """
    Exports minimal metadata audit log as CSV format.
    STRICT PRIVACY: Audio content, biometric vectors, and transcripts are never present.
    """
    items, _ = query_audit_logs(limit=5000, offset=0)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "event_id",
        "timestamp",
        "analysis_mode",
        "model_version",
        "model_status",
        "result_label",
        "synthetic_score",
        "uncertainty_score",
        "audio_quality",
        "audio_duration_seconds",
        "processing_latency_ms",
        "risk_action",
        "reason_codes",
        "transaction_amount",
        "recipient_category",
        "is_flagged_for_review",
    ])

    for row in items:
        writer.writerow([
            row["event_id"],
            row["timestamp"],
            row["analysis_mode"],
            row["model_version"],
            row["model_status"],
            row["result_label"],
            row["synthetic_score"] if row["synthetic_score"] is not None else "",
            row["uncertainty_score"] if row["uncertainty_score"] is not None else "",
            row["audio_quality"],
            row["audio_duration_seconds"] if row["audio_duration_seconds"] is not None else "",
            row["processing_latency_ms"],
            row["risk_action"],
            ";".join(row["reason_codes"]) if isinstance(row["reason_codes"], list) else str(row["reason_codes"]),
            row["transaction_amount"] if row["transaction_amount"] is not None else "",
            row["recipient_category"] or "",
            row["is_flagged_for_review"],
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=voiceshield_audit_log.csv"},
    )


@router.post("/clear")
def clear_history():
    """Clears forensic audit records from SQLite."""
    count = clear_audit_history()
    return {"status": "cleared", "records_removed": count}
