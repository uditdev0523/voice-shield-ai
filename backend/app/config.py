"""
VoiceShield AI - Application Configuration
Centralized configuration management with strict privacy defaults.
"""

from pathlib import Path
from typing import List
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "VoiceShield AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173,https://uditdev0523.github.io"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Audio Constraints
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    MAX_AUDIO_DURATION_SECONDS: float = 60.0       # 60s
    MIN_AUDIO_DURATION_SECONDS: float = 0.5        # 0.5s minimum for meaningful analysis
    TARGET_SAMPLE_RATE: int = 16000                # Standard 16kHz mono for speech anti-spoofing
    ALLOWED_EXTENSIONS: List[str] = [".wav", ".mp3", ".ogg", ".flac"]

    # Strict Audio Privacy Controls
    ENABLE_AUDIO_RETENTION: bool = False  # NEVER retain raw audio by default
    TEMP_AUDIO_DIR: Path = Path("backend/data/temp_audio")
    AUDIT_DB_PATH: Path = Path("backend/data/audit/voiceshield_audit.db")

    # PyTorch Model Settings
    MODEL_CHECKPOINT_PATH: Path = Path("backend/data/models/voiceshield_best.pt")
    MODEL_DEVICE: str = "cpu"
    MODEL_VERSION: str = "v1.0.0-cnn-bigru"

    # Multi-Factor Banking Risk Engine Thresholds
    SYNTHETIC_THRESHOLD_LOW: float = 0.35   # Below 0.35: Likely Genuine
    SYNTHETIC_THRESHOLD_HIGH: float = 0.70  # Above 0.70: High Suspicion of Clone
    HIGH_TRANSACTION_AMOUNT: float = 5000.0 # High value financial threshold ($5,000)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Ensure required persistent storage directories exist
settings.TEMP_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
settings.AUDIT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
settings.MODEL_CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)
