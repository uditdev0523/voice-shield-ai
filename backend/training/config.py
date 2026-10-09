"""
VoiceShield AI - Model Training Configuration
Centralized hyperparameter specifications and reproducibility configurations.
"""

from dataclasses import dataclass
from pathlib import Path


@dataclass
class TrainingConfig:
    # Audio Feature Parameters
    sample_rate: int = 16000
    n_mels: int = 80
    n_fft: int = 1024
    hop_length: int = 512
    win_length: int = 1024
    target_frames: int = 400

    # Model Hyperparameters
    hidden_dim: int = 128
    gru_layers: int = 2
    dropout: float = 0.3

    # Optimization Hyperparameters
    batch_size: int = 16
    epochs: int = 15
    learning_rate: float = 0.0008
    weight_decay: float = 1e-4
    patience: int = 4  # Early stopping patience
    random_seed: int = 42

    # Paths
    dataset_dir: Path = Path("backend/training/datasets")
    output_checkpoint_dir: Path = Path("backend/data/models")
    best_checkpoint_path: Path = Path("backend/data/models/voiceshield_best.pt")
    evaluation_report_path: Path = Path("backend/data/models/evaluation_report.json")


config = TrainingConfig()
