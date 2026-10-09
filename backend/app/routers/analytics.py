"""
VoiceShield AI - Analytics & Metrics Router
"""

from fastapi import APIRouter
from backend.app.database import get_analytics_metrics
from backend.app.models.model_manager import model_manager
from backend.app.schemas.audit import AnalyticsSummaryResponse

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics & Reports"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary():
    """Returns aggregated audit metrics calculated strictly from actual SQLite records."""
    metrics = get_analytics_metrics()
    model_status = model_manager.get_status()

    return AnalyticsSummaryResponse(
        total_analyses=metrics["total_analyses"],
        genuine_count=metrics["genuine_count"],
        synthetic_count=metrics["synthetic_count"],
        inconclusive_count=metrics["inconclusive_count"],
        verification_required_count=metrics["verification_required_count"],
        avg_latency_ms=metrics["avg_latency_ms"],
        risk_distribution=metrics["risk_distribution"],
        recent_activity=metrics["recent_activity"],
        model_status=model_status,
    )
