"""
VoiceShield AI - Model Evaluation & Robustness Benchmarking
Evaluates model on held-out test data, computing ROC-AUC, EER, F1, Confusion Matrix,
and robustness under additive noise and audio volume perturbations.
Saves verified metrics into backend/data/models/evaluation_report.json.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import torch
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, confusion_matrix

from backend.app.models.audio_classifier import VoiceShieldCNNBiGRU
from backend.app.services.audio_processor import audio_processor
from backend.training.config import config
from backend.training.dataset_loader import discover_and_split_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("voiceshield.evaluate")


def compute_eer(y_true: np.ndarray, y_scores: np.ndarray) -> float:
    """Computes Equal Error Rate (EER) where FPR == FNR."""
    thresholds = np.linspace(0.0, 1.0, 1000)
    best_diff = float("inf")
    eer = 0.5

    for th in thresholds:
        y_pred = (y_scores >= th).astype(int)
        # TN, FP, FN, TP
        tn = np.sum((y_true == 0) & (y_pred == 0))
        fp = np.sum((y_true == 0) & (y_pred == 1))
        fn = np.sum((y_true == 1) & (y_pred == 0))
        tp = np.sum((y_true == 1) & (y_pred == 1))

        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

        diff = abs(fpr - fnr)
        if diff < best_diff:
            best_diff = diff
            eer = (fpr + fnr) / 2.0

    return round(float(eer), 4)


def evaluate_checkpoint(checkpoint_path: Path = None):
    ckpt_path = checkpoint_path or config.best_checkpoint_path
    if not ckpt_path.exists():
        logger.error(f"Cannot evaluate: checkpoint not found at {ckpt_path}")
        return None

    device = torch.device("cpu")
    checkpoint = torch.load(str(ckpt_path), map_location=device, weights_only=True)

    model = VoiceShieldCNNBiGRU(
        n_mels=checkpoint.get("n_mels", 80),
        hidden_dim=checkpoint.get("hidden_dim", 128),
        gru_layers=checkpoint.get("gru_layers", 2),
    )
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()

    # Retrieve held-out test split
    _, _, test_samples = discover_and_split_dataset(
        dataset_dir=config.dataset_dir,
        val_ratio=0.20,
        test_ratio=0.20,
        seed=config.random_seed,
    )

    if not test_samples:
        logger.error("No test samples available for held-out evaluation.")
        return None

    logger.info(f"Evaluating on {len(test_samples)} held-out test samples...")

    y_true: List[int] = []
    y_scores: List[float] = []
    latencies: List[float] = []

    with torch.no_grad():
        for item in test_samples:
            label = item["label"]
            y_true.append(label)

            start = time.perf_counter()
            audio, _, _ = audio_processor.load_and_validate(item["path"])
            mel = audio_processor.compute_log_mel_spectrogram(audio, target_frames=config.target_frames)
            mel_tensor = mel.unsqueeze(0).to(device)  # (1, 1, F, T)
            logits = model(mel_tensor)
            prob = torch.sigmoid(logits).item()
            latency = (time.perf_counter() - start) * 1000.0

            y_scores.append(prob)
            latencies.append(latency)

    y_true_arr = np.array(y_true)
    y_scores_arr = np.array(y_scores)
    y_pred_arr = (y_scores_arr >= 0.5).astype(int)

    # Core Metrics
    precision = precision_score(y_true_arr, y_pred_arr, zero_division=0)
    recall = recall_score(y_true_arr, y_pred_arr, zero_division=0)
    f1 = f1_score(y_true_arr, y_pred_arr, zero_division=0)
    try:
        roc_auc = roc_auc_score(y_true_arr, y_scores_arr)
    except Exception:
        roc_auc = 0.5

    cm = confusion_matrix(y_true_arr, y_pred_arr)
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
    eer = compute_eer(y_true_arr, y_scores_arr)
    avg_latency = float(np.mean(latencies))

    # Robustness Experiments: Noise & Volume Attenuation
    robustness_results = []

    # 1. White Noise Injection (SNR ~ 15dB)
    noisy_scores = []
    with torch.no_grad():
        for item in test_samples:
            audio, _, _ = audio_processor.load_and_validate(item["path"])
            noise = np.random.normal(0, 0.05, len(audio))
            mel = audio_processor.compute_log_mel_spectrogram(audio + noise, target_frames=config.target_frames)
            prob = torch.sigmoid(model(mel.unsqueeze(0).to(device))).item()
            noisy_scores.append(prob)
    noisy_pred = (np.array(noisy_scores) >= 0.5).astype(int)
    robustness_results.append({
        "condition": "Additive Gaussian Noise (15 dB SNR)",
        "f1_score": round(float(f1_score(y_true_arr, noisy_pred, zero_division=0)), 3),
        "mean_score_drift": round(float(np.mean(np.abs(np.array(noisy_scores) - y_scores_arr))), 3),
    })

    # 2. Volume Attenuation (-6dB)
    atten_scores = []
    with torch.no_grad():
        for item in test_samples:
            audio, _, _ = audio_processor.load_and_validate(item["path"])
            mel = audio_processor.compute_log_mel_spectrogram(audio * 0.5, target_frames=config.target_frames)
            prob = torch.sigmoid(model(mel.unsqueeze(0).to(device))).item()
            atten_scores.append(prob)
    atten_pred = (np.array(atten_scores) >= 0.5).astype(int)
    robustness_results.append({
        "condition": "Amplitude Attenuation (-6 dB)",
        "f1_score": round(float(f1_score(y_true_arr, atten_pred, zero_division=0)), 3),
        "mean_score_drift": round(float(np.mean(np.abs(np.array(atten_scores) - y_scores_arr))), 3),
    })

    report = {
        "model_name": "VoiceShield CNN-BiGRU",
        "model_version": checkpoint.get("model_version", "v1.0.0-cnn-bigru"),
        "evaluation_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_info": {
            "name": "Held-Out Verification Benchmark",
            "test_sample_count": len(test_samples),
            "genuine_samples": int(np.sum(y_true_arr == 0)),
            "synthetic_samples": int(np.sum(y_true_arr == 1)),
        },
        "metrics": {
            "precision": round(float(precision), 3),
            "recall": round(float(recall), 3),
            "f1_score": round(float(f1), 3),
            "roc_auc": round(float(roc_auc), 3),
            "eer": round(float(eer), 3),
            "false_positive_rate": round(float(fpr), 3),
            "false_negative_rate": round(float(fnr), 3),
            "avg_latency_ms": round(float(avg_latency), 1),
        },
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "robustness_benchmarks": robustness_results,
        "limitations": [
            "Metrics are measured on held-out reference splits with consistent recording acoustics.",
            "Domain shift may occur when testing codecs not represented in training (e.g. low-bitrate GSM or cellular AMR).",
            "Extreme acoustic noise degrades certainty and invokes the INCONCLUSIVE_VERIFY policy.",
        ],
    }

    # Save report
    config.evaluation_report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config.evaluation_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Evaluation report saved to {config.evaluation_report_path}")
    logger.info(f"Results: F1={report['metrics']['f1_score']} | ROC-AUC={report['metrics']['roc_auc']} | EER={report['metrics']['eer']}")
    return report


if __name__ == "__main__":
    evaluate_checkpoint()
