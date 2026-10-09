"""
VoiceShield AI - Database Module
SQLite persistent storage for minimal metadata-only audit records.
STRICT PRIVACY GUARANTEE: Never stores raw audio, spectrograms, or biometric voiceprints.
"""

import sqlite3
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from backend.app.config import settings

logger = logging.getLogger("voiceshield.database")


def get_db_connection() -> sqlite3.Connection:
    """Creates a robust connection to the SQLite audit database with dictionary row factory."""
    conn = sqlite3.connect(str(settings.AUDIT_DB_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for high concurrency
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def init_db() -> None:
    """Initializes tables for privacy-compliant metadata logging."""
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT UNIQUE NOT NULL,
                timestamp TEXT NOT NULL,
                analysis_mode TEXT NOT NULL,         -- 'upload', 'live_stream', 'banking_sim'
                model_version TEXT NOT NULL,
                model_status TEXT NOT NULL,          -- 'active', 'unavailable'
                result_label TEXT NOT NULL,          -- 'GENUINE', 'SYNTHETIC_SUSPECTED', 'INCONCLUSIVE', 'MODEL_UNAVAILABLE'
                synthetic_score REAL,               -- Float [0.0, 1.0] or NULL if unavailable
                uncertainty_score REAL,             -- Float [0.0, 1.0] or NULL
                audio_quality TEXT NOT NULL,         -- 'optimal', 'clipping_detected', 'low_snr', 'near_silent', 'untested'
                audio_duration_seconds REAL,
                processing_latency_ms REAL NOT NULL,
                risk_action TEXT NOT NULL,           -- 'CONTINUE_SIMULATED_FLOW', 'STEP_UP_VERIFICATION', 'PAUSE_AND_VERIFY', etc.
                reason_codes TEXT NOT NULL,          -- JSON list of strings
                transaction_amount REAL,             -- Simulated transaction context, if applicable
                recipient_category TEXT,             -- Simulated recipient context
                is_flagged_for_review INTEGER DEFAULT 0
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_result_label ON audit_logs(result_label);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_risk_action ON audit_logs(risk_action);")
        conn.commit()
        logger.info("Audit database initialized successfully with metadata-only schema.")


def insert_audit_event(event_data: Dict[str, Any]) -> str:
    """
    Inserts a minimal metadata audit record.
    Rejects any payload containing sensitive audio or transcript keys.
    """
    # Strict privacy safeguard: raise error if audio content is accidentally passed
    forbidden_keys = {"audio", "raw_audio", "audio_bytes", "waveform", "transcript", "spectrogram"}
    for k in forbidden_keys:
        if k in event_data:
            raise ValueError(f"Privacy violation: audit log must not contain '{k}'")

    reason_codes_json = json.dumps(event_data.get("reason_codes", []))
    event_id = event_data.get("event_id")
    timestamp = event_data.get("timestamp") or datetime.now(timezone.utc).isoformat()

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO audit_logs (
                event_id, timestamp, analysis_mode, model_version, model_status,
                result_label, synthetic_score, uncertainty_score, audio_quality,
                audio_duration_seconds, processing_latency_ms, risk_action,
                reason_codes, transaction_amount, recipient_category, is_flagged_for_review
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_id,
                timestamp,
                event_data.get("analysis_mode", "upload"),
                event_data.get("model_version", settings.MODEL_VERSION),
                event_data.get("model_status", "unavailable"),
                event_data.get("result_label", "INCONCLUSIVE"),
                event_data.get("synthetic_score"),
                event_data.get("uncertainty_score"),
                event_data.get("audio_quality", "untested"),
                event_data.get("audio_duration_seconds"),
                event_data.get("processing_latency_ms", 0.0),
                event_data.get("risk_action", "MANUAL_REVIEW"),
                reason_codes_json,
                event_data.get("transaction_amount"),
                event_data.get("recipient_category"),
                1 if event_data.get("is_flagged_for_review") else 0,
            ),
        )
        conn.commit()
    return event_id


def query_audit_logs(
    search: Optional[str] = None,
    risk_action: Optional[str] = None,
    result_label: Optional[str] = None,
    analysis_mode: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[List[Dict[str, Any]], int]:
    """Queries audit logs with pagination and multi-parameter filtering."""
    query = "SELECT * FROM audit_logs WHERE 1=1"
    params: List[Any] = []

    if search:
        query += " AND (event_id LIKE ? OR reason_codes LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if risk_action:
        query += " AND risk_action = ?"
        params.append(risk_action)
    if result_label:
        query += " AND result_label = ?"
        params.append(result_label)
    if analysis_mode:
        query += " AND analysis_mode = ?"
        params.append(analysis_mode)

    # Get total count
    count_query = query.replace("SELECT *", "SELECT COUNT(*)", 1)
    with get_db_connection() as conn:
        total_count = conn.execute(count_query, params).fetchone()[0]

        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = conn.execute(query, params).fetchall()
        results = []
        for r in rows:
            d = dict(r)
            try:
                d["reason_codes"] = json.loads(d["reason_codes"])
            except Exception:
                d["reason_codes"] = []
            results.append(d)

    return results, total_count


def get_analytics_metrics() -> Dict[str, Any]:
    """Aggregates authentic counts and statistics from the audit history."""
    with get_db_connection() as conn:
        total_analyses = conn.execute("SELECT COUNT(*) FROM audit_logs").fetchone()[0]

        genuine_count = conn.execute(
            "SELECT COUNT(*) FROM audit_logs WHERE result_label = 'GENUINE'"
        ).fetchone()[0]

        synthetic_count = conn.execute(
            "SELECT COUNT(*) FROM audit_logs WHERE result_label = 'SYNTHETIC_SUSPECTED'"
        ).fetchone()[0]

        inconclusive_count = conn.execute(
            "SELECT COUNT(*) FROM audit_logs WHERE result_label IN ('INCONCLUSIVE', 'MODEL_UNAVAILABLE')"
        ).fetchone()[0]

        verification_required_count = conn.execute(
            "SELECT COUNT(*) FROM audit_logs WHERE risk_action IN ('STEP_UP_VERIFICATION', 'PAUSE_AND_VERIFY', 'MANUAL_REVIEW')"
        ).fetchone()[0]

        avg_latency = conn.execute(
            "SELECT AVG(processing_latency_ms) FROM audit_logs WHERE processing_latency_ms > 0"
        ).fetchone()[0] or 0.0

        # Risk distribution breakdown
        risk_dist = {}
        for row in conn.execute("SELECT risk_action, COUNT(*) as c FROM audit_logs GROUP BY risk_action"):
            risk_dist[row["risk_action"]] = row["c"]

        # Recent 7-day trend or hourly distribution
        recent_activity = []
        for row in conn.execute(
            """
            SELECT date(timestamp) as day, COUNT(*) as count,
                   SUM(CASE WHEN result_label = 'SYNTHETIC_SUSPECTED' THEN 1 ELSE 0 END) as synthetic,
                   SUM(CASE WHEN result_label = 'GENUINE' THEN 1 ELSE 0 END) as genuine
            FROM audit_logs
            GROUP BY date(timestamp)
            ORDER BY day DESC LIMIT 14
            """
        ):
            recent_activity.append(dict(row))

        return {
            "total_analyses": total_analyses,
            "genuine_count": genuine_count,
            "synthetic_count": synthetic_count,
            "inconclusive_count": inconclusive_count,
            "verification_required_count": verification_required_count,
            "avg_latency_ms": round(float(avg_latency), 2),
            "risk_distribution": risk_dist,
            "recent_activity": list(reversed(recent_activity)),
        }


def clear_audit_history() -> int:
    """Purges audit records. Returns count of deleted records."""
    with get_db_connection() as conn:
        cur = conn.execute("DELETE FROM audit_logs")
        conn.commit()
        return cur.rowcount
