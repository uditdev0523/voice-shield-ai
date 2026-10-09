# VoiceShield AI — Security Architecture & Threat Model

## 1. Threat Model & Mitigations

### 1.1 Path Traversal & Arbitrary File Overwrite
- **Threat:** Attackers upload malicious filenames (e.g., `../../etc/passwd` or `..\..\Windows\System32\cmd.exe`) to overwrite system binaries.
- **Mitigation:** The application strips user filenames and generates isolated UUID-based paths via `privacy_service.generate_safe_temp_path()`. Paths are strictly validated to ensure they reside within the designated `temp_audio/` sandbox.

### 1.2 Resource Exhaustion / Denial of Service
- **Threat:** Malicious actors upload gigabyte-sized files or infinite audio streams to exhaust server RAM and disk space.
- **Mitigation:** Upload streams are limited to 10 MB maximum, and durations are validated against an upper threshold of 60 seconds. Streaming reads check chunk accumulation and abort with `HTTP 413 Payload Too Large`.

### 1.3 Information Disclosure
- **Threat:** Stack traces, internal file paths, or system environment secrets returned in API error responses.
- **Mitigation:** Global FastAPI exception handlers intercept unhandled exceptions and return sanitized JSON responses without exposing internal filesystem layouts or traceback trees.

### 1.4 Cross-Origin Resource Sharing (CORS)
- **Threat:** Unrestricted cross-origin requests from arbitrary web origins.
- **Mitigation:** CORS middleware whitelist is environment-driven via `CORS_ORIGINS` with strict regex origin validation.

### 1.5 Safe Fallback when Model is Unavailable
- **Threat:** System crash or random uncalibrated guesses when weights are missing.
- **Mitigation:** `ModelManager` verifies model state on startup and falls back gracefully to `MODEL_UNAVAILABLE`, prompting secondary multi-factor verification rather than fabricating false negatives or positives.
