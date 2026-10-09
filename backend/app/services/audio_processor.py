"""
VoiceShield AI - Audio Preprocessing & Signal Quality Service
Performs audio decoding, mono downmixing, 16kHz resampling,
signal quality checks (clipping, silence, SNR), and Log-Mel Spectrogram extraction.
"""

import io
import math
import logging
from pathlib import Path
from typing import Tuple, Dict, Any, Union
import numpy as np
import scipy.signal
import soundfile as sf
import torch

from backend.app.config import settings

logger = logging.getLogger("voiceshield.audio_processor")


class AudioProcessingError(Exception):
    """Custom exception for audio validation and decoding failures."""
    pass


class AudioProcessor:
    """Production-grade audio ingestion and feature extraction pipeline."""

    def __init__(
        self,
        target_sample_rate: int = 16000,
        n_mels: int = 80,
        n_fft: int = 1024,
        hop_length: int = 512,
        win_length: int = 1024,
        f_min: float = 50.0,
        f_max: float = 8000.0,
    ):
        self.target_sample_rate = target_sample_rate
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.win_length = win_length
        self.f_min = f_min
        self.f_max = f_max
        self._mel_basis = self._create_mel_filterbank()

    def _hz_to_mel(self, hz: float) -> float:
        return 2595.0 * math.log10(1.0 + hz / 700.0)

    def _mel_to_hz(self, mel: float) -> float:
        return 700.0 * (10.0 ** (mel / 2595.0) - 1.0)

    def _create_mel_filterbank(self) -> np.ndarray:
        """Constructs an exact triangular Mel filterbank matrix without requiring librosa."""
        mel_min = self._hz_to_mel(self.f_min)
        mel_max = self._hz_to_mel(self.f_max)
        mel_points = np.linspace(mel_min, mel_max, self.n_mels + 2)
        hz_points = np.array([self._mel_to_hz(m) for m in mel_points])
        bin_points = np.floor((self.n_fft + 1) * hz_points / self.target_sample_rate).astype(int)

        n_freqs = self.n_fft // 2 + 1
        filterbank = np.zeros((self.n_mels, n_freqs), dtype=np.float32)

        for i in range(1, self.n_mels + 1):
            left = bin_points[i - 1]
            center = bin_points[i]
            right = bin_points[i + 1]

            if center > left:
                filterbank[i - 1, left:center] = (np.arange(left, center) - left) / (center - left)
            if right > center:
                filterbank[i - 1, center:right] = (right - np.arange(center, right)) / (right - center)

        return filterbank

    def load_and_validate(
        self,
        audio_source: Union[str, Path, bytes, io.BytesIO],
    ) -> Tuple[np.ndarray, float, Dict[str, Any]]:
        """
        Loads raw audio from path or byte stream, validates constraints,
        converts to mono, resamples to 16kHz, and assesses quality.
        Returns: (normalized_audio_array, duration_seconds, quality_report)
        """
        try:
            if isinstance(audio_source, (str, Path)):
                data, sample_rate = sf.read(str(audio_source), dtype="float32")
            elif isinstance(audio_source, bytes):
                buffer = io.BytesIO(audio_source)
                data, sample_rate = sf.read(buffer, dtype="float32")
            elif isinstance(audio_source, io.BytesIO):
                audio_source.seek(0)
                data, sample_rate = sf.read(audio_source, dtype="float32")
            else:
                raise AudioProcessingError("Unsupported audio source type.")
        except Exception as e:
            # Defensive fallback to scipy wavfile if soundfile encountered an issue
            try:
                import scipy.io.wavfile as wavfile
                if isinstance(audio_source, (str, Path)):
                    sample_rate, raw_int = wavfile.read(str(audio_source))
                elif isinstance(audio_source, bytes):
                    sample_rate, raw_int = wavfile.read(io.BytesIO(audio_source))
                elif isinstance(audio_source, io.BytesIO):
                    audio_source.seek(0)
                    sample_rate, raw_int = wavfile.read(audio_source)
                else:
                    raise e
                if raw_int.dtype == np.int16:
                    data = raw_int.astype(np.float32) / 32768.0
                elif raw_int.dtype == np.int32:
                    data = raw_int.astype(np.float32) / 2147483648.0
                else:
                    data = raw_int.astype(np.float32)
            except Exception:
                logger.error(f"Audio decoding failure: {str(e)}")
                raise AudioProcessingError(f"Malformed or unsupported audio file: {str(e)}")

        if data.size == 0:
            raise AudioProcessingError("Audio file contains zero audio samples.")

        # Downmix multi-channel / stereo audio to single mono channel
        if data.ndim > 1:
            data = np.mean(data, axis=1)

        # Normalize sample rate to 16,000 Hz if needed
        if sample_rate != self.target_sample_rate:
            num_target_samples = int(round(len(data) * float(self.target_sample_rate) / sample_rate))
            data = scipy.signal.resample(data, num_target_samples).astype(np.float32)
            sample_rate = self.target_sample_rate

        # Duration validation
        duration = len(data) / float(self.target_sample_rate)
        if duration < settings.MIN_AUDIO_DURATION_SECONDS:
            raise AudioProcessingError(
                f"Audio duration ({duration:.2f}s) is shorter than required minimum ({settings.MIN_AUDIO_DURATION_SECONDS}s)."
            )
        if duration > settings.MAX_AUDIO_DURATION_SECONDS:
            raise AudioProcessingError(
                f"Audio duration ({duration:.2f}s) exceeds maximum allowed limit ({settings.MAX_AUDIO_DURATION_SECONDS}s)."
            )

        # Signal Quality Assessment
        quality_report = self.assess_signal_quality(data)

        # Normalize waveform amplitude to standard [-1.0, 1.0] peak envelope
        max_abs = np.max(np.abs(data))
        if max_abs > 1e-5:
            data = data / max_abs

        return data, duration, quality_report

    def assess_signal_quality(self, audio: np.ndarray) -> Dict[str, Any]:
        """
        Evaluates audio signal health: clipping, silence/near-silence, and signal-to-noise ratio.
        """
        # 1. Clipping check (samples close to digital maximum ±0.98 before normalization)
        clipping_samples = np.sum(np.abs(audio) >= 0.98)
        clipping_ratio = float(clipping_samples / len(audio))
        has_clipping = clipping_ratio > 0.005  # More than 0.5% samples clipped

        # 2. RMS Energy / Silence check
        rms_energy = float(np.sqrt(np.mean(audio**2)))
        is_near_silent = rms_energy < 0.005

        # 3. Dynamic range / SNR estimate
        peak = float(np.max(np.abs(audio)))
        snr_estimate = 20.0 * math.log10((peak + 1e-6) / (rms_energy + 1e-6)) if rms_energy > 0 else 0.0
        is_low_snr = snr_estimate < 6.0 and not is_near_silent

        # Overall quality classification label
        if is_near_silent:
            status = "near_silent"
            desc = "Audio contains predominantly silence or imperceptible signal level."
        elif has_clipping:
            status = "clipping_detected"
            desc = f"Harmonic distortion detected with {clipping_ratio * 100:.1f}% clipped samples."
        elif is_low_snr:
            status = "low_snr"
            desc = f"Excessive background noise or low dynamic range ({snr_estimate:.1f} dB)."
        else:
            status = "optimal"
            desc = "Audio quality meets signal integrity criteria for feature extraction."

        return {
            "status": status,
            "description": desc,
            "rms_energy": round(rms_energy, 4),
            "peak_amplitude": round(peak, 4),
            "clipping_ratio": round(clipping_ratio, 4),
            "snr_db": round(snr_estimate, 1),
            "has_clipping": has_clipping,
            "is_near_silent": is_near_silent,
            "is_low_snr": is_low_snr,
        }

    def compute_log_mel_spectrogram(
        self,
        audio: np.ndarray,
        target_frames: int = 400,
    ) -> torch.Tensor:
        """
        Computes 80-bin Log-Mel Spectrogram and pads/truncates to a standardized frame length.
        Output Tensor Shape: [80, target_frames]
        """
        window = np.hanning(self.win_length)
        # Compute Short-Time Fourier Transform (STFT)
        freqs, times, stft = scipy.signal.stft(
            audio,
            fs=self.target_sample_rate,
            window=window,
            nperseg=self.win_length,
            noverlap=self.win_length - self.hop_length,
            nfft=self.n_fft,
            boundary=None,
            padded=False,
        )

        # Power spectrum
        power_spec = np.abs(stft) ** 2  # (n_freqs, time_frames)

        # Apply Mel Filterbank: (n_mels, n_freqs) @ (n_freqs, time_frames) -> (n_mels, time_frames)
        mel_spec = np.dot(self._mel_basis, power_spec)

        # Log transform with numerical stability floor
        log_mel = np.log(np.maximum(mel_spec, 1e-6))

        # Standardize / Z-score normalize feature map
        mean = np.mean(log_mel)
        std = np.std(log_mel) + 1e-6
        log_mel = (log_mel - mean) / std

        # Standardize time length: pad with zeros or truncate to target_frames
        n_mels, current_frames = log_mel.shape
        if current_frames < target_frames:
            pad_width = target_frames - current_frames
            padded_mel = np.pad(log_mel, ((0, 0), (0, pad_width)), mode="constant", constant_values=0)
        else:
            padded_mel = log_mel[:, :target_frames]

        return torch.tensor(padded_mel, dtype=torch.float32)


audio_processor = AudioProcessor()
