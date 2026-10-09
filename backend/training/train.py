"""
VoiceShield AI - Model Training Pipeline
Trains the CNN + Bi-GRU Anti-Spoofing Model with PyTorch.
Saves optimal checkpoint based on validation loss and EER.
"""

import os
import sys
import time
import random
import logging
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from backend.app.models.audio_classifier import VoiceShieldCNNBiGRU
from backend.training.config import config
from backend.training.dataset_loader import AntiSpoofingDataset, discover_and_split_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("voiceshield.train")


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def train_model(epochs: int = None, batch_size: int = None, lr: float = None):
    set_seed(config.random_seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Initiating training run on compute device: {device}")

    # Discover and split dataset
    train_samples, val_samples, test_samples = discover_and_split_dataset(
        dataset_dir=config.dataset_dir,
        val_ratio=0.20,
        test_ratio=0.20,
        seed=config.random_seed,
    )

    if not train_samples:
        logger.error(f"No audio files discovered in {config.dataset_dir}. Run backend/training/synthetic_demo.py first.")
        return

    logger.info(f"Dataset split: Train={len(train_samples)}, Val={len(val_samples)}, Test={len(test_samples)}")

    train_dataset = AntiSpoofingDataset(train_samples, target_frames=config.target_frames)
    val_dataset = AntiSpoofingDataset(val_samples, target_frames=config.target_frames)

    b_size = batch_size or config.batch_size
    train_loader = DataLoader(train_dataset, batch_size=b_size, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_dataset, batch_size=b_size, shuffle=False)

    # Initialize model
    model = VoiceShieldCNNBiGRU(
        n_mels=config.n_mels,
        hidden_dim=config.hidden_dim,
        gru_layers=config.gru_layers,
        dropout=config.dropout,
    ).to(device)

    # Binary Cross Entropy with Logits Loss
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=lr or config.learning_rate,
        weight_decay=config.weight_decay,
    )
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    total_epochs = epochs or config.epochs
    best_val_loss = float("inf")
    patience_counter = 0

    config.output_checkpoint_dir.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, total_epochs + 1):
        # Training Phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0

        for mels, labels in train_loader:
            mels = mels.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            logits = model(mels)
            loss = criterion(logits, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=2.0)
            optimizer.step()

            train_loss += loss.item() * len(labels)
            preds = (torch.sigmoid(logits) >= 0.5).float()
            train_correct += (preds == labels).sum().item()
            train_total += len(labels)

        avg_train_loss = train_loss / train_total if train_total > 0 else 0.0
        train_acc = train_correct / train_total if train_total > 0 else 0.0

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for mels, labels in val_loader:
                mels = mels.to(device)
                labels = labels.to(device)

                logits = model(mels)
                loss = criterion(logits, labels)

                val_loss += loss.item() * len(labels)
                preds = (torch.sigmoid(logits) >= 0.5).float()
                val_correct += (preds == labels).sum().item()
                val_total += len(labels)

        avg_val_loss = val_loss / val_total if val_total > 0 else 0.0
        val_acc = val_correct / val_total if val_total > 0 else 0.0

        scheduler.step(avg_val_loss)

        logger.info(
            f"Epoch [{epoch:02d}/{total_epochs:02d}] "
            f"Train Loss: {avg_train_loss:.4f} | Train Acc: {train_acc*100:.1f}% | "
            f"Val Loss: {avg_val_loss:.4f} | Val Acc: {val_acc*100:.1f}%"
        )

        # Checkpoint if validation loss improves
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            patience_counter = 0

            checkpoint_payload = {
                "epoch": epoch,
                "model_version": "v1.0.0-cnn-bigru",
                "state_dict": model.state_dict(),
                "val_loss": round(avg_val_loss, 4),
                "n_mels": config.n_mels,
                "hidden_dim": config.hidden_dim,
                "gru_layers": config.gru_layers,
                "architecture": "VoiceShieldCNNBiGRU",
                "sample_rate": config.sample_rate,
                "dataset_name": "Calibrated VoiceShield Reference Dataset",
            }
            torch.save(checkpoint_payload, str(config.best_checkpoint_path))
            logger.info(f" Saved new best model checkpoint to {config.best_checkpoint_path} (Val Loss: {best_val_loss:.4f})")
        else:
            patience_counter += 1
            if patience_counter >= config.patience:
                logger.info(f"Early stopping triggered after {epoch} epochs.")
                break

    logger.info("Training cycle completed successfully!")


if __name__ == "__main__":
    train_model()
