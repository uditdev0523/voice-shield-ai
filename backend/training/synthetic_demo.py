"""
VoiceShield AI - Benchmark Sample Generator
Synthesizes calibrated reference audio for testing the training and evaluation pipelines.
- Bonafide (Class 0): Natural vocal-tract formant synthesis with smooth pitch contours and vibrato.
- Synthetic (Class 1): Vocoder-like synthetic speech with metallic phase jitter, buzzing overtones, and abrupt glitches.
"""

import math
from pathlib import Path
import numpy as np
import soundfile as sf

from backend.training.config import config


def generate_bonafide_sample(duration: float = 2.0, sr: int = 16000, f0: float = 140.0) -> np.ndarray:
    """Simulates natural vocal harmonic structure with subtle organic vibrato and formants."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Natural slow pitch modulation / vibrato
    pitch_mod = f0 + 5.0 * np.sin(2 * np.pi * 5.0 * t) + 2.0 * np.sin(2 * np.pi * 1.5 * t)
    phase = 2 * np.pi * np.cumsum(pitch_mod) / sr

    # Formant resonators (vowel /a/ and /i/ approximations)
    formant1 = np.exp(-((pitch_mod - 700) ** 2) / (2 * 120**2))
    formant2 = np.exp(-((pitch_mod - 1220) ** 2) / (2 * 150**2))

    # Harmonics
    signal = np.zeros_like(t)
    for h in range(1, 15):
        harmonic_amp = (1.0 / (h ** 1.1)) * (1.0 + 0.5 * formant1 + 0.3 * formant2)
        signal += harmonic_amp * np.sin(h * phase)

    # Smooth attack and decay envelope
    envelope = np.ones_like(t)
    attack = int(sr * 0.08)
    decay = int(sr * 0.12)
    envelope[:attack] = np.linspace(0, 1, attack)
    envelope[-decay:] = np.linspace(1, 0, decay)
    signal = signal * envelope

    # Subtle ambient room resonance
    signal += 0.008 * np.random.normal(0, 1, len(signal))

    # Peak normalize
    max_val = np.max(np.abs(signal))
    if max_val > 0:
        signal = 0.85 * (signal / max_val)
    return signal.astype(np.float32)


def generate_synthetic_sample(duration: float = 2.0, sr: int = 16000, f0: float = 140.0) -> np.ndarray:
    """Simulates typical neural vocoder / speech cloning artifacts (phase smearing, rigid harmonics, high-frequency buzz)."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Rigid, unnatural robotic fundamental frequency
    pitch = np.full_like(t, f0)
    # Add random phase jitter characteristic of neural vocoder re-synthesis
    phase_jitter = 0.25 * np.random.uniform(-1, 1, len(t))
    phase = 2 * np.pi * pitch * t + phase_jitter

    signal = np.zeros_like(t)
    # High frequency harsh metallic buzz
    for h in range(1, 24):
        harmonic_amp = 1.0 / (h ** 0.65)  # unnaturally loud high frequencies
        signal += harmonic_amp * np.sin(h * phase)

    # Periodic phase discontinuity clicks
    glitch_points = np.random.choice(len(t), size=12, replace=False)
    for gp in glitch_points:
        window = slice(max(0, gp - 10), min(len(signal), gp + 10))
        signal[window] += 0.4 * np.random.uniform(-1, 1)

    envelope = np.ones_like(t)
    attack = int(sr * 0.02)
    envelope[:attack] = np.linspace(0, 1, attack)
    envelope[-attack:] = np.linspace(1, 0, attack)
    signal = signal * envelope

    max_val = np.max(np.abs(signal))
    if max_val > 0:
        signal = 0.85 * (signal / max_val)
    return signal.astype(np.float32)


def build_reference_dataset(output_dir: Path, num_per_class: int = 25):
    """Builds reference bonafide and synthetic wave dataset."""
    genuine_dir = output_dir / "genuine"
    synthetic_dir = output_dir / "synthetic"

    genuine_dir.mkdir(parents=True, exist_ok=True)
    synthetic_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating {num_per_class} reference bonafide samples in {genuine_dir}...")
    for i in range(num_per_class):
        f0 = 120.0 + (i % 6) * 18.0
        audio = generate_bonafide_sample(duration=2.0, sr=16000, f0=f0)
        file_path = genuine_dir / f"spk{i%5+1}_bonafide_{i:03d}.wav"
        sf.write(str(file_path), audio, 16000)

    print(f"Generating {num_per_class} reference synthetic samples in {synthetic_dir}...")
    for i in range(num_per_class):
        f0 = 120.0 + (i % 6) * 18.0
        audio = generate_synthetic_sample(duration=2.0, sr=16000, f0=f0)
        file_path = synthetic_dir / f"synth{i%5+1}_spoof_{i:03d}.wav"
        sf.write(str(file_path), audio, 16000)

    print(f"Dataset successfully constructed: {num_per_class * 2} total samples.")


if __name__ == "__main__":
    build_reference_dataset(config.dataset_dir, num_per_class=25)
