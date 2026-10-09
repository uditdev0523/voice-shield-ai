"""
VoiceShield AI - Model Manager
Safely loads and serves the PyTorch model checkpoint.
Guarantees explicit 'unavailable' status when weights are absent or incompatible.
NEVER fabricates synthetic scores with random weights.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import torch

from backend.app.config import settings
from backend.app.models.audio_classifier import VoiceShieldCNNBiGRU

logger = logging.getLogger("voiceshield.model_manager")


class ModelManager:
    """Manages model checkpoint loading, device orchestration, and safe inference."""

    def __init__(self, checkpoint_path: Optional[Path] = None):
        self.checkpoint_path = checkpoint_path or settings.MODEL_CHECKPOINT_PATH
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() and settings.MODEL_DEVICE.lower() == "cuda" else "cpu"
        )
        self.model: Optional[VoiceShieldCNNBiGRU] = None
        self.model_metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None

        # Attempt to load trained checkpoint if exists on disk
        self.load_checkpoint()

    def load_checkpoint(self) -> bool:
        """
        Attempts to safely load the checkpoint file.
        Returns True if successfully loaded, False otherwise with documented error.
        """
        if not self.checkpoint_path.exists():
            self.is_loaded = False
            self.load_error = f"Checkpoint not found at '{self.checkpoint_path}'"
            logger.warning(
                "Model weights are not present on disk. Running in safe 'MODEL_UNAVAILABLE' mode. "
                "Inference will fail gracefully without fabricating results."
            )
            return False

        try:
            logger.info(f"Loading model checkpoint from {self.checkpoint_path} onto device: {self.device}")
            checkpoint = torch.load(str(self.checkpoint_path), map_location=self.device, weights_only=True)

            # Validate checkpoint structure
            if not isinstance(checkpoint, dict):
                raise ValueError("Checkpoint must be a serialized dictionary")

            state_dict = checkpoint.get("state_dict") or checkpoint.get("model_state_dict")
            if not state_dict:
                raise ValueError("Checkpoint dictionary missing 'state_dict' or 'model_state_dict'")

            # Instantiate model architecture
            n_mels = checkpoint.get("n_mels", 80)
            hidden_dim = checkpoint.get("hidden_dim", 128)
            gru_layers = checkpoint.get("gru_layers", 2)

            model = VoiceShieldCNNBiGRU(n_mels=n_mels, hidden_dim=hidden_dim, gru_layers=gru_layers)
            model.load_state_dict(state_dict)
            model.to(self.device)
            model.eval()  # Strictly set to evaluation mode

            self.model = model
            self.model_metadata = {
                "version": checkpoint.get("model_version", settings.MODEL_VERSION),
                "trained_epoch": checkpoint.get("epoch"),
                "val_loss": checkpoint.get("val_loss"),
                "val_eer": checkpoint.get("val_eer"),
                "dataset_name": checkpoint.get("dataset_name", "VoiceShield Research Subset"),
                "architecture": "CNN-BiGRU-Attention",
                "total_parameters": sum(p.numel() for p in model.parameters()),
            }
            self.is_loaded = True
            self.load_error = None
            logger.info(f"Model checkpoint successfully loaded! Version: {self.model_metadata['version']}")
            return True

        except Exception as e:
            self.is_loaded = False
            self.model = None
            self.load_error = f"Failed to load checkpoint: {str(e)}"
            logger.error(self.load_error)
            return False

    def predict(self, mel_spectrogram: torch.Tensor) -> Tuple[float, float]:
        """
        Runs inference on preprocessed Log-Mel spectrogram.
        Returns: (synthetic_score, uncertainty_score)
        Raises RuntimeError if model is not loaded.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is unavailable. Cannot perform inference without verified checkpoint.")

        with torch.no_grad():
            tensor = mel_spectrogram.to(self.device)
            if tensor.dim() == 2:
                tensor = tensor.unsqueeze(0).unsqueeze(0)  # (1, 1, F, T)
            elif tensor.dim() == 3:
                tensor = tensor.unsqueeze(1)  # (B, 1, F, T)

            logits = self.model(tensor)
            prob = torch.sigmoid(logits).item()

            # Uncertainty estimate based on distance to the decision boundary (0.5)
            # 0.0 means maximally certain (close to 0.0 or 1.0), 1.0 means maximally uncertain (score ~ 0.5)
            uncertainty = 1.0 - (2.0 * abs(prob - 0.5))

            return float(round(prob, 4)), float(round(uncertainty, 4))

    def get_status(self) -> Dict[str, Any]:
        """Returns comprehensive, honest model availability status."""
        return {
            "available": self.is_loaded,
            "version": self.model_metadata.get("version", settings.MODEL_VERSION),
            "device": str(self.device),
            "checkpoint_path": str(self.checkpoint_path),
            "architecture": self.model_metadata.get("architecture", "CNN-BiGRU-Attention"),
            "load_error": self.load_error,
            "metadata": self.model_metadata,
        }


# Singleton model manager instance for application lifecycle
model_manager = ModelManager()
