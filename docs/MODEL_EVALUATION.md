# VoiceShield AI — Model Evaluation & Metric Definitions

## 1. Metric Formulations

### 1.1 Equal Error Rate (EER)
The operating threshold $\theta^*$ where the False Positive Rate (FPR) equals the False Negative Rate (FNR):
$$\text{EER} = \text{FPR}(\theta^*) = \text{FNR}(\theta^*)$$
- **FPR (Type I):** Fraction of genuine human voices incorrectly classified as synthetic clones.
- **FNR (Type II):** Fraction of synthetic clones incorrectly accepted as genuine human speech.

### 1.2 Precision, Recall, and F1 Score
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$
$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$
$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

### 1.3 Area Under the ROC Curve (ROC-AUC)
Measures the ranking capability of the model across all possible operating thresholds between 0.0 and 1.0.

---

## 2. Held-Out Evaluation Protocol

To prevent data contamination and optimistic evaluation bias:
1. **Source/Speaker-Aware Partitioning:** Datasets are grouped by speaker identifier or synthesis engine before splitting into Train (60%), Validation (20%), and Test (20%).
2. **Fixed Random Seeds:** A constant seed (`seed=42`) guarantees consistent evaluation across runs.
3. **No Training on Test Data:** Held-out test audio is never shown to the neural network during gradient descent or early stopping checks.

---

## 3. Robustness Experiments

Audio anti-spoofing models frequently face acoustic degradation in real call centers:
- **Additive White Gaussian Noise (AWGN):** Stress-tested with 15 dB Signal-to-Noise Ratio.
- **Volume Attenuation:** Tested with -6 dB digital amplitude reduction.
- **Lossy Compression:** Documented performance impact across AMR and G.711 codecs.
