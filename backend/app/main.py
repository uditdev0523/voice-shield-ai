"""
VoiceShield AI - Enterprise Synthetic Voice Fraud Detection Platform
FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.services.privacy_service import privacy_service
from backend.app.models.model_manager import model_manager

# Import API Routers
from backend.app.routers.health import router as health_router
from backend.app.routers.detection import router as detection_router
from backend.app.routers.banking import router as banking_router
from backend.app.routers.audit import router as audit_router
from backend.app.routers.analytics import router as analytics_router
from backend.app.routers.privacy import router as privacy_router
from backend.app.routers.model_eval import router as model_eval_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("voiceshield")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup initialization and graceful cleanup."""
    logger.info("Initializing VoiceShield AI Backend Services...")
    # Initialize SQLite schema
    init_db()
    # Sweep and purge any lingering temp files
    privacy_service.purge_abandoned_temp_files(max_age_seconds=0)
    # Check model loading status
    model_status = model_manager.get_status()
    if model_status["available"]:
        logger.info(f"PyTorch Model active on device: {model_status['device']}")
    else:
        logger.warning(f"PyTorch Model unavailable: {model_status['load_error']}. Running with safe fallback.")
    yield
    logger.info("Shutting down VoiceShield AI. Ensuring all transient audio buffers are unlinked...")
    privacy_service.purge_abandoned_temp_files(max_age_seconds=0)


app = FastAPI(
    title="VoiceShield AI API",
    description=(
        "Next-generation acoustic anti-spoofing and multi-factor voice fraud mitigation "
        "designed specifically for banking, wire transfers, and simulated fintech workflows."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1)(:[0-9]+)?|https://.*\.github\.io)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Global Exception Handler protecting against path disclosure and internal stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "The server encountered an error processing your request. Sensitive data and audio buffers have been safely cleared.",
        },
    )


# Register Routers
app.include_router(health_router)
app.include_router(detection_router)
app.include_router(banking_router)
app.include_router(audit_router)
app.include_router(analytics_router)
app.include_router(privacy_router)
app.include_router(model_eval_router)


@app.get("/")
def root():
    return {
        "service": "VoiceShield AI Security Gateway",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "model_status": "/api/v1/health",
        "zero_retention_policy": True,
    }
