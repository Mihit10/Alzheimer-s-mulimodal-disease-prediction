<div align="center">

<br/>

<img src="https://img.shields.io/badge/Research-Alzheimer's%20AI-8B5CF6?style=for-the-badge&logo=brain&logoColor=white" />
<img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Python-3.10+-3B82F6?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/PyTorch-ResNet34-EF4444?style=for-the-badge&logo=pytorch&logoColor=white" />

<br/><br/>

# 🧠 Digital Twin for Alzheimer's Disease
### Prediction & Progression Modeling

**A multimodal AI framework for early detection, risk stratification, and stage-wise classification of Alzheimer's Disease**  
*Clinical Data · MRI Scans · Biomarkers · Genetics · Automated Report Extraction*

<br/>

[![Watch Demo](https://img.youtube.com/vi/J1eA6TE1r8I/maxresdefault.jpg)](https://youtu.be/J1eA6TE1r8I?si=zeuuYOkh5rjfdig2)

> 🎬 **[▶ Watch Full Project Demo on YouTube](https://youtu.be/J1eA6TE1r8I?si=zeuuYOkh5rjfdig2)**

<br/>

</div>

---

## 📌 Overview

Alzheimer's Disease (AD) is a progressive neurodegenerative disorder that **cannot be reliably diagnosed using a single data modality**. This project proposes a **Digital Twin–based architecture** that integrates multiple AI models into a unified, patient-specific representation:

| Modality | What It Captures |
|----------|-----------------|
| 🏥 Clinical & Lifestyle | Demographics, vitals, cognitive scores |
| 🧲 Structural MRI | Brain degeneration stages |
| 🧬 Genetics & Biomarkers | CSF proteins, APOE genotype |
| 📄 Medical Reports | OCR-extracted real-world hospital data |

Each modality contributes a **complementary view of disease progression**, enabling early diagnosis, explainable predictions, and future longitudinal modeling.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PATIENT DATA INPUTS                     │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Clinical /  │   MRI Scan   │  Biomarkers  │  Medical PDF   │
│  Lifestyle   │   Images     │  & Genetics  │  Reports (OCR) │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       ▼              ▼              ▼               ▼
  ┌─────────┐   ┌──────────┐  ┌──────────┐   ┌──────────┐
  │CatBoost │   │ ResNet34 │  │ Ensemble │   │  Vision  │
  │Classifier│  │   CNN    │  │XGB+RF+NN │   │  LLaMA   │
  └────┬────┘   └────┬─────┘  └────┬─────┘   └────┬─────┘
       │              │              │               │
       └──────────────┴──────────────┴───────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │   🧠 Digital Twin      │
                 │  Patient JSON Profile  │
                 │ ─────────────────────  │
                 │ • Demographics         │
                 │ • Risk Predictions     │
                 │ • MRI Classification   │
                 │ • Biomarker Analysis   │
                 │ • Temporal History     │
                 └────────────────────────┘
```

---

## 🔬 Models & Methodology

### 1️⃣ Clinical / Lifestyle-Based Alzheimer's Prediction

> **Goal:** Early, non-invasive risk assessment

**Model:** `CatBoost Classifier`

**Inputs:**
- Demographics — age, gender, education level
- Lifestyle — BMI, smoking, physical activity, diet quality, sleep patterns
- Medical history & vitals
- Cognitive & functional assessments — MMSE, ADL, Functional Assessment
- Behavioral indicators — memory complaints, confusion, personality changes

**Output:** Binary prediction — `Alzheimer's Positive` / `Alzheimer's Negative`

| Metric | Score |
|--------|-------|
| ✅ Accuracy | **96%** |
| ✅ F1-Score | **0.94** |

---

### 2️⃣ MRI-Based Dementia Stage Classification

> **Goal:** Structural brain degeneration analysis

**Model:** `Fine-tuned ResNet34 CNN`

**Classes:**
```
🟢 Non-Demented  →  🟡 Very Mild  →  🟠 Mild  →  🔴 Moderate Demented
```

**Dataset:** ~44,000 skull-stripped MRI images with extensive augmentation & class balancing

| Metric | Score |
|--------|-------|
| ✅ Accuracy | **99.7%** |
| ✅ Stage Confusion | Minimal between adjacent stages |

---

### 3️⃣ Biomarker + Genotype Risk Prediction

> **Goal:** Biological and genetic risk estimation

**Model:** `XGBoost + Random Forest + Neural Network` (Optuna-optimized ensemble)

**Inputs:**
- CSF biomarkers — ABETA, TAU levels
- Cognitive score — MMSE
- MRI volumetrics — Hippocampal/AP Volume
- APOE genotype — one-hot encoded

**Engineered Features:**
- `ABETA / TAU ratio`
- `MMSE × TAU interaction term`

**Output:** Multiclass probabilities across `CN` / `MCI` / `Dementia`

| Metric | Score |
|--------|-------|
| ✅ Accuracy (ADNI holdout) | **63.3%** |
| ✅ Benchmark | Consistent with SOTA biomarker-only models |

---

### 4️⃣ OCR-Based Medical Report Extraction

> **Goal:** Real-world hospital data ingestion

**Model:** `Vision-enabled LLaMA (Groq)`

**Capabilities:**
- Parses PDFs and scanned medical reports
- Extracts lab values, vitals, diagnoses, and clinical notes
- Outputs clean, structured **JSON** for Digital Twin ingestion

---

## 🧠 Digital Twin Representation

Each patient is modeled as a **unified JSON-based Digital Twin**:

```json
{
  "patient_id": "PT-00142",
  "demographics": { "age": 72, "gender": "F", "education_years": 14 },
  "clinical_risk": {
    "model": "CatBoost",
    "prediction": "Alzheimer's Positive",
    "confidence": 0.91
  },
  "mri_stage": {
    "model": "ResNet34",
    "classification": "Mild Demented",
    "confidence_scores": { "non_demented": 0.02, "mild": 0.93 }
  },
  "biomarker_risk": {
    "probabilities": { "CN": 0.08, "MCI": 0.31, "Dementia": 0.61 }
  },
  "ocr_records": { "source": "hospital_report_2024.pdf", "tau": 420, "abeta42": 560 },
  "temporal_history": []
}
```

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Languages** | Python 3.10+ |
| **ML / DL** | CatBoost · XGBoost · Random Forest · PyTorch · fastai |
| **Optimization** | Optuna · GridSearchCV |
| **Imaging** | OpenCV · FastAI |
| **Data** | NumPy · Pandas · Scikit-learn |
| **OCR / NLP** | Vision-LLaMA (Groq) |
| **Visualization** | Matplotlib · Seaborn |
| **Environment** | Jupyter · Google Colab · VS Code |
| **Version Control** | Git · GitHub |

</div>

---

## 🚀 Future Scope

- [ ] 🔄 **Longitudinal modeling** with LSTM / GRU networks
- [ ] 🤖 **Temporal multimodal transformers** for sequence prediction
- [ ] 📈 **Disease progression forecasting** over time
- [ ] 💊 **Treatment & lifestyle intervention simulation**
- [ ] 🏥 **Clinical Decision Support System (CDSS)** integration
- [ ] ⚡ **Real-time Digital Twin updates** from wearables & EHRs

---

## 🎬 Demo

> Click the thumbnail below to watch the full project walkthrough:

[![Project Demo](https://img.youtube.com/vi/J1eA6TE1r8I/maxresdefault.jpg)](https://youtu.be/J1eA6TE1r8I?si=zeuuYOkh5rjfdig2)

---

## 👥 Authors

> 🎓 **Sardar Patel Institute of Technology** — Mini Project

| Name | Role |
|------|------|
| **Ria Talsania** | Co-Author |
| **Mihit Singasane** | Co-Author |
| **Ved Thakker** | Co-Author |
| **Prof. Swapnali Kurhade** | Project Guide |

---

## ⚠️ Disclaimer

> This project is for **research and educational purposes only** and is **not a certified medical diagnostic tool**.  
> All clinical decisions must be made by qualified healthcare professionals.

---

