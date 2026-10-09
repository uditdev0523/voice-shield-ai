"""
VoiceShield AI - Audio Processor Unit Tests
"""

import io
import pytest
import numpy as np
import soundfile as sf
import torch

from backend.app.services.audio_processor import audio_processor, AudioProcessingError


def create_test_wav_bytes(duration: float = 1.0, sr: int = 16000, freq: float = 440.0) -> bytes:
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    data = 0.5 * np.sin(2 * np.pi * freq * t)
    buf = io.BytesIO()
    sf.write(buf, data.astype(np.float32), sr, format="WAV")
    buf.seek(0)
    return buf.read()


def test_load_and_validate_valid_audio():
    wav_bytes = create_test_wav_bytes(duration=1.5, sr=16000)
    data, duration, quality = audio_processor.load_and_validate(wav_bytes)

    assert len(data) > 0
    assert 1.4 <= duration <= 1.6
    assert quality["status"] in ("optimal", "low_snr")
    assert not quality["has_clipping"]


def test_audio_stereo_to_mono_conversion():
    # Create stereo audio
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    left = 0.4 * np.sin(2 * np.pi * 300 * t)
    right = 0.4 * np.sin(2 * np.pi * 600 * t)
    stereo = np.column_stack([left, right]).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, stereo, 16000, format="WAV")
    buf.seek(0)

    data, duration, quality = audio_processor.load_and_validate(buf.read())
    assert data.ndim == 1  # Successfully downmixed to 1D mono


def test_clipping_detection():
    # Create severely clipped square wave at ±1.0
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    clipped = np.sign(np.sin(2 * np.pi * 440 * t)).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, clipped, 16000, format="WAV")
    buf.seek(0)

    _, _, quality = audio_processor.load_and_validate(buf.read())
    assert quality["has_clipping"] is True
    assert quality["status"] == "clipping_detected"


def test_silence_detection():
    # Audio with amplitude 0.0001
    silent = np.full(16000, 0.0001, dtype=np.float32)
    buf = io.BytesIO()
    sf.write(buf, silent, 16000, format="WAV")
    buf.seek(0)

    _, _, quality = audio_processor.load_and_validate(buf.read())
    assert quality["is_near_silent"] is True
    assert quality["status"] == "near_silent"


def test_duration_limits():
    # Too short (< 0.5s)
    short_bytes = create_test_wav_bytes(duration=0.2)
    with pytest.raises(AudioProcessingError) as exc:
        audio_processor.load_and_validate(short_bytes)
    assert "shorter than required minimum" in str(exc.value)


def test_corrupted_audio_raises_error():
    corrupted_bytes = b"NOT_A_VALID_AUDIO_FILE_DATA_CORRUPTION"
    with pytest.raises(AudioProcessingError):
        audio_processor.load_and_validate(corrupted_bytes)


def test_log_mel_spectrogram_dimensions():
    data = np.random.normal(0, 0.1, 32000).astype(np.float32)
    mel = audio_processor.compute_log_mel_spectrogram(data, target_frames=400)

    assert isinstance(mel, torch.Tensor)
    assert mel.shape == (80, 400)
    assert not torch.isnan(mel).any()
