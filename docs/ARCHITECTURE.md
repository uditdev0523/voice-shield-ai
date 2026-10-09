# VoiceShield AI — System Architecture & Technical Specifications

## 1. System Overview

VoiceShield AI is an enterprise-oriented acoustic anti-spoofing and financial fraud mitigation platform engineered specifically to safeguard wire transfers, payment authorization calls, and simulated banking workflows from generative speech cloning attacks.

```mermaid
flowchart TD
    subgraph Client["Client Tier (React 19 + TypeScript + Vite)"]
        UI["Fintech Security UI"]
        Mic["Web Audio / MediaRecorder API"]
        Upload["Audio File Ingestion (WAV/MP3/OGG/FLAC)"]
    end

    subgraph API["Backend API Gateway (FastAPI)"]
        Router["FastAPI Application Router"]
        Sanitize["Path Traversal & File Validation"]
        Ephemeral["Ephemeral Temp Isolation (Zero-Retention)"]
    end

    subgraph AudioProcessing["Acoustic Preprocessing Service"]
        Resample["16 kHz Resampling & Mono Downmixing"]
        Quality["Signal Integrity Checks (Clipping, SNR, Silence)"]
        Spectrogram["80-Bin Log-Mel Spectrogram (STFT)"]
    end

    subgraph MLTier["Deep Learning Inference Tier (Local PyTorch)"]
        CNN["3-Stage 2D CNN Spectral Texture Blocks"]
        BiGRU["2-Layer Bidirectional GRU (Temporal Continuity)"]
        Attn["Temporal Self-Attention Pooling"]
        Sigmoid["Calibrated Synthetic Probability [0.0, 1.0]"]
    end

    subgraph RiskTier["Multi-Factor Banking Risk Engine"]
        Engine["Contextual Decision Engine"]
        PolicyMatrix["Amount + Recipient Status + Acoustic Score"]
    end

    subgraph Persistence["Storage & Telemetry Tier"]
        DB[("SQLite Minimal Metadata Audit Table")]
        AutoPurge["Unconditional Ephemeral File Cleanup"]
    end

    Mic -->|Live Audio Chunks| Router
    Upload -->|Multipart Audio| Router
    Router --> Sanitize --> Ephemeral --> Resample --> Quality --> Spectrogram
    Spectrogram --> CNN --> BiGRU --> Attn --> Sigmoid
    Sigmoid --> Engine
    Quality -.-> Engine
    UI -->|Simulated Context ($ Amount, Payee)| Engine
    Engine --> PolicyMatrix
    PolicyMatrix -->|Risk Action & Reasons| UI
    PolicyMatrix --> DB
    Ephemeral -.->|Post-Inference Unlink| AutoPurge
```

---

## 2. Neural Network Topology: CNN + Bi-GRU + Attention

The deep learning classifier (`VoiceShieldCNNBiGRU`) addresses two fundamental structural limitations of conventional speech synthesizers:

1. **Spectral Spatial Artifacts (CNN Frontend):**
   Neural vocoders (e.g. HiFi-GAN, WaveNet, MelGAN) often introduce subtle periodic phase discontinuities, high-frequency metallic overtones, and harmonic distortion across frequency bins. A 3-stage 2D Convolutional network with LeakyReLU activations, 2D Batch Normalization, and spatial dropout extracts texture feature maps across time and frequency.

2. **Temporal Continuity & Prosodic Anomalies (Bi-GRU):**
   Speech cloning models frequently struggle with natural human micro-prosody—vocal tract pitch contours either appear unnaturally rigid or contain stochastic phase glitches. The 2-layer Bidirectional GRU models temporal transitions forward and backward in time.

3. **Temporal Self-Attention Pooling:**
   Rather than applying crude global average pooling, a self-attention mechanism scores the informational relevance of each acoustic frame, allowing the network to prioritize suspicious glitch segments over steady vowels.

---

## 3. Mathematical Foundations

### 3.1 Short-Time Fourier Transform (STFT)
$$X(m, \omega) = \sum_{n=-\infty}^{\infty} x[n] w[n - m] e^{-j\omega n}$$
Where $w[n]$ is a 1024-point Hanning window with a hop size of $R = 512$ samples at $f_s = 16,000 \text{ Hz}$.

### 3.2 Mel-Scale Triangular Filterbanks
$$\text{Mel}(f) = 2595 \log_{10}\left(1 + \frac{f}{700}\right)$$
80 triangular filters spanning $50 \text{ Hz}$ to $8,000 \text{ Hz}$ are applied to the power spectral density:
$$S_{\text{Mel}}(m, k) = \sum_{\omega} |X(m, \omega)|^2 \cdot H_k(\omega)$$

### 3.3 Log Transform & Z-Score Feature Standardization
$$L(m, k) = \log\left(\max(S_{\text{Mel}}(m, k), 10^{-6})\right)$$
$$\hat{L}(m, k) = \frac{L(m, k) - \mu_L}{\sigma_L + 10^{-6}}$$

### 3.4 Multi-Factor Banking Decision Formulation
The decision action $\mathcal{A}$ is a function of:
$$\mathcal{A} = f(P_{\text{synth}}, \mathcal{Q}_{\text{audio}}, \mathcal{U}, \text{Amount}, \text{PayeeStatus})$$
Where:
- $P_{\text{synth}} \in [0.0, 1.0]$: Model output probability
- $\mathcal{Q}_{\text{audio}} \in \{\text{optimal}, \text{clipping}, \text{low\_snr}, \text{near\_silent}\}$
- $\mathcal{U} = 1 - 2|P_{\text{synth}} - 0.5|$: Inference uncertainty metric
