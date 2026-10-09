# VoiceShield AI — Privacy Architecture & Retention Policy

## 1. Core Principle: Zero Audio Retention by Default

VoiceShield AI enforces a strict **Zero-Audio-Retention Architecture** (`ENABLE_AUDIO_RETENTION=false`). Customer audio recordings, biometric embeddings, and transcripts are never stored on persistent disks or databases.

---

## 2. Three-Tier Data Lifecycle

| Tier | Component | Storage Location | Retention Lifetime | Contents |
|---|---|---|---|---|
| **Tier 1** | Browser Microphone | Client RAM (Web Audio API) | Ephemeral (until unmount or reload) | Raw audio stream |
| **Tier 2** | Backend Processing Buffer | Ephemeral OS temp folder (`temp_audio/`) | Sub-second (unlinked in `finally:`) | Ephemeral PCM file |
| **Tier 3** | Forensic Audit Trail | Local SQLite database | Configurable by administrator | Anonymous minimal metadata |

---

## 3. Strict Boundary Guarantees in Code

### 3.1 Unconditional Temporary File Deletion
Audio files uploaded or streamed to the backend are saved under a non-deterministic UUID path inside an isolated directory. The backend utilizes a Python `try...finally` block guaranteeing deletion immediately after feature extraction:
```python
try:
    audio_data, duration, quality = audio_processor.load_and_validate(temp_path)
    # ... feature extraction & inference ...
finally:
    privacy_service.cleanup_file(temp_path)  # Always executes
```

### 3.2 Database Layer Privacy Safeguards
The SQLite insertion service explicitly rejects any payload that attempts to log raw audio or transcripts:
```python
forbidden_keys = {"audio", "raw_audio", "audio_bytes", "waveform", "transcript", "spectrogram"}
for k in forbidden_keys:
    if k in event_data:
        raise ValueError(f"Privacy violation: audit log must not contain '{k}'")
```

---

## 4. Retained Metadata Schema

The following non-biometric parameters are recorded for security auditability:
- `event_id`: Random hex string identifier
- `timestamp`: UTC ISO-8601 timestamp
- `analysis_mode`: `upload` or `live_stream`
- `model_version`: e.g. `v1.0.0-cnn-bigru`
- `result_label`: Categorical label (`GENUINE`, `SYNTHETIC_SUSPECTED`, etc.)
- `synthetic_score`: Floating-point scalar probability between 0.0 and 1.0
- `uncertainty_score`: Distance metric from decision boundary
- `audio_quality`: Signal integrity tag (`optimal`, `clipping_detected`, `low_snr`, `near_silent`)
- `processing_latency_ms`: Ingestion and inference time in milliseconds
- `risk_action`: Policy decision code
- `reason_codes`: JSON list of policy rule triggers
