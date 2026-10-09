"""
VoiceShield AI - PyTorch Audio Anti-Spoofing Classifier Architecture
Hybrid Convolutional Neural Network + Bidirectional GRU (CNN + Bi-GRU)
Specialized for detecting acoustic synthesis artifacts, vocoder glitches, and prosody phase anomalies.
"""

import torch
import torch.nn as nn
from typing import Dict, Any


class ConvBlock(nn.Module):
    """Convolutional feature extraction block with BatchNorm, LeakyReLU, and Dropout."""

    def __init__(self, in_channels: int, out_channels: int, pool_size=(2, 2)):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(negative_slope=0.1, inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(negative_slope=0.1, inplace=True),
            nn.MaxPool2d(kernel_size=pool_size),
            nn.Dropout2d(p=0.15),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)


class VoiceShieldCNNBiGRU(nn.Module):
    """
    CNN + Bi-GRU Deep Anti-Spoofing Model
    Input: [Batch, 1, Mel_Bins (80), Time_Frames (T)]
    Output: [Batch, 1] Synthetic probability score (Sigmoid output)
    """

    def __init__(
        self,
        n_mels: int = 80,
        hidden_dim: int = 128,
        gru_layers: int = 2,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.n_mels = n_mels
        self.hidden_dim = hidden_dim

        # 2D CNN Frontend for Spectral-Temporal Texture Feature Maps
        self.block1 = ConvBlock(1, 32, pool_size=(2, 2))   # -> [32, 40, T/2]
        self.block2 = ConvBlock(32, 64, pool_size=(2, 2))  # -> [64, 20, T/4]
        self.block3 = ConvBlock(64, 128, pool_size=(2, 2)) # -> [128, 10, T/8]

        # Projection dimension from flattened frequency bins
        # 128 channels * 10 frequency bins = 1280 features per time step
        cnn_out_dim = 128 * (n_mels // 8)

        # Bidirectional GRU for Sequential Prosodic and Temporal Discontinuity Detection
        self.gru = nn.GRU(
            input_size=cnn_out_dim,
            hidden_size=hidden_dim,
            num_layers=gru_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if gru_layers > 1 else 0.0,
        )

        # Temporal Self-Attention Pooling Layer
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.Tanh(),
            nn.Linear(64, 1),
        )

        # Classification Head
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout),
            nn.Linear(64, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        Args:
            x: Input tensor of shape (B, 1, F, T) or (B, F, T)
        Returns:
            Logits of shape (B, 1)
        """
        if x.dim() == 3:
            x = x.unsqueeze(1)  # Add channel dimension (B, 1, F, T)

        # Extract spectral spatial representations
        out = self.block1(x)
        out = self.block2(out)
        out = self.block3(out)  # (B, C, F', T')

        b, c, f, t = out.shape
        # Permute and reshape for GRU: (B, T', C * F')
        out = out.permute(0, 3, 1, 2).contiguous().view(b, t, c * f)

        # Recurrent temporal sequence modeling
        gru_out, _ = self.gru(out)  # (B, T', hidden_dim * 2)

        # Attention weights over time steps
        attn_weights = torch.softmax(self.attention(gru_out), dim=1)  # (B, T', 1)
        pooled = torch.sum(attn_weights * gru_out, dim=1)  # (B, hidden_dim * 2)

        # Final score logit
        logits = self.classifier(pooled)  # (B, 1)
        return logits


def get_model_metadata() -> Dict[str, Any]:
    return {
        "architecture": "VoiceShieldCNNBiGRU",
        "description": "3-Stage 2D CNN + 2-Layer Bidirectional GRU with Temporal Attention Pooling",
        "n_mels": 80,
        "sample_rate": 16000,
        "classes": ["GENUINE", "SYNTHETIC_SUSPECTED"],
    }
