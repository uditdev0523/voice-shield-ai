"""
VoiceShield AI - Model Manager Unit Tests
"""

import torch
import pytest
from pathlib import Path
from backend.app.models.model_manager import ModelManager
from backend.app.models.audio_classifier import VoiceShieldCNNBiGRU


def test_model_manager_missing_checkpoint():
    mgr = ModelManager(checkpoint_path=Path("non_existent_model_checkpoint.pt"))
    assert mgr.is_loaded is False
    assert mgr.model is None
    status = mgr.get_status()
    assert status["available"] is False
    assert "not found" in status["load_error"].lower()

    # Inference should raise RuntimeError without fabricating results
    with pytest.raises(RuntimeError):
        dummy_tensor = torch.zeros((80, 400))
        mgr.predict(dummy_tensor)


def test_model_manager_loads_valid_checkpoint():
    mgr = ModelManager()  # Uses settings.MODEL_CHECKPOINT_PATH
    mgr.load_checkpoint()
    assert mgr.is_loaded is True
    assert mgr.model is not None
    status = mgr.get_status()
    assert status["available"] is True
    assert status["version"] == "v1.0.0-cnn-bigru"

    # Test real inference output shape and score range [0.0, 1.0]
    dummy_mel = torch.randn((80, 400))
    prob, uncertainty = mgr.predict(dummy_mel)
    assert 0.0 <= prob <= 1.0
    assert 0.0 <= uncertainty <= 1.0
