<div align="center">

<br/>

<img src="https://img.shields.io/badge/Research-Alzheimer's%20AI-8B5CF6?style=for-the-badge&logo=brain&logoColor=white" />
<img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Python-3.10+-3B82F6?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/PyTorch-ResNet34-EF4444?style=for-the-badge&logo=pytorch&logoColor=white" />
<img src="https://img.shields.io/badge/Keras-Bi--LSTM-FFCA28?style=for-the-badge&logo=keras&logoColor=black" />

<br/><br/>

# 🧠 Multimodal Digital Twin for Alzheimer's Disease
### Current Diagnosis & Longitudinal Progression Forecasting

**A unified AI framework combining clinical data, MRI scans, biomarkers, and longitudinal temporal modeling to predict both current disease state and future disease trajectories.**

<br/>

[![Watch Demo](https://img.youtube.com/vi/J1eA6TE1r8I/maxresdefault.jpg)](https://youtu.be/J1eA6TE1r8I?si=zeuuYOkh5rjfdig2)

> 🎬 **[▶ Watch Full Project Demo on YouTube](https://youtu.be/J1eA6TE1r8I?si=zeuuYOkh5rjfdig2)**

<br/>

</div>

---

## ⚡ 30-Second Project Overview

Traditional Alzheimer's diagnosis typically assesses a patient at a single point in time, answering: *"Does this patient currently have Alzheimer's?"* 

Our project moves beyond this by asking: **"How will this patient's condition evolve in the future?"**

We developed a **multimodal Digital Twin platform** for Alzheimer's Disease. 
- **Phase 1:** Developed independent prediction pipelines using clinical data, MRI scans, biomarker-genetic data, and an OCR medical report ingestion pipeline.
- **Phase 2:** Extended the system with **longitudinal temporal modeling** using Bi-LSTM and GRU networks to predict future disease progression from historical patient visits.

The ultimate goal is to create a patient-specific digital twin that continuously updates and forecasts the disease trajectory over time.

---

## 🏗️ Full System Architecture

```text
                      Patient Data
                            │
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │                     │
┌─────────────┐       ┌────────────┐       ┌──────────────┐      ┌────────────┐
│ Clinical    │       │ MRI Scans  │       │ Biomarkers & │      │ Medical    │
│ Records     │       │            │       │ Genetics     │      │ Reports    │
└──────┬──────┘       └──────┬─────┘       └──────┬───────┘      └──────┬─────┘
       │                     │                    │                     │
┌─────────────┐       ┌────────────┐       ┌──────────────┐      ┌────────────┐
│ CatBoost    │       │ ResNet34   │       │ Ensemble     │      │ Vision LLM │
│ Classifier  │       │ CNN        │       │ (XGB+RF+MLP) │      │ OCR Pipeline│
└──────┬──────┘       └──────┬─────┘       └──────┬───────┘      └──────┬─────┘
       │                     │                    │                     │
       └─────────────────────┴────────────────────┴─────────────────────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │  Digital Twin  │ (Current Snapshot)
                            └────────┬───────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │ Longitudinal AI│ (Bi-LSTM / GRU)
                            │ Temporal Model │
                            └────────┬───────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │ Future Disease         │
                        │ Progression Forecast   │
                        └────────────────────────┘
```

---

## 🧬 Phase 1: Multimodal Snapshot Prediction

In Phase 1, we built an ensemble of distinct models targeting specific data modalities. These individual predictions are fused into a **unified JSON-based Digital Twin**.

### 1️⃣ Clinical Prediction Model
*   **Dataset:** 2,149 patient records (Age, Lifestyle, Cognitive scores, Functional assessments).
*   **Model:** `CatBoost`
*   **Output:** Alzheimer's diagnosis prediction.
*   **Performance:** ~96% Accuracy | F1 = 0.94

### 2️⃣ MRI Analysis Pipeline
*   **Dataset:** 44,000 MRI brain scans.
*   **Model:** `ResNet34 CNN`
*   **Output:** MRI-based dementia severity classification (Non Demented, Very Mild, Mild, Moderate).
*   **Performance:** ~99.7% Validation Accuracy.

### 3️⃣ Biomarker + Genetics Pipeline
*   **Dataset:** ADNI (ABETA, TAU, APOE genotype, MMSE, Brain volume).
*   **Model:** `Ensemble Model` (XGBoost, Random Forest, Neural Network).
*   **Performance:** ~63.3% Accuracy (Realistic benchmark for biomarker-only predictions).

### 4️⃣ OCR Medical Report Ingestion
*   **Problem:** Dealing with unstructured real-world hospital data (PDFs, scans, images).
*   **Solution:** A **Vision LLM OCR Pipeline** to extract report contents and convert them into structured JSON to automatically feed the prediction models.

---

## ⏳ Phase 2: Longitudinal Disease Progression Modeling

Phase 1 provided a single-snapshot prediction. It could not answer critical questions like: *Will CN become MCI? Will MCI become AD? What is the trajectory over the years?*

Phase 2 shifts the paradigm from **Diagnosis** to **Disease Progression Prediction** using longitudinal patient history.

### Data Engineering & Temporal Sequencing
*   **Dataset:** ADNI Longitudinal Dataset (~22,000 records, 3,034 patients with multiple visits).
*   **Timeline Conversion:** Cleaned and converted visits (e.g., `bl`, `m06`, `m12`, `m24`) into a continuous time representation.
*   **Sliding Window Sequences:** Grouped visits chronologically by `subject_id` to build sequential training samples. 
    *   *Input: `[Visit 1, Visit 2, Visit 3]` → Output: `Visit 4 Diagnosis`*

### Missing Data Handling Strategies
Missing data is a major research challenge in healthcare (e.g., fields missing in ~42-44% of records). We systematically evaluated:
1.  **No Masking:** Baseline imputation (`NaN -> 0`).
2.  **Sentinel Masking:** Replacing missing values with `-999` and using Keras Masking Layers.
3.  **Binary Indicator Masking:** Adding an extra feature to indicate missingness, allowing the network to learn missingness patterns.

### Deep Learning Temporal Models
We systematically compared advanced time-series networks to capture long-term temporal dependencies:
*   **Bidirectional LSTM (Bi-LSTM):** Captures temporal dependencies in both directions.
*   **Bidirectional GRU:** Lighter and faster alternative.

**Temporal Architecture:**
`Bi-LSTM → Batch Norm → Dropout → Bi-LSTM → Dense Layer → Softmax Output (CN=0, MCI=1, AD=2)`

> **Research Contribution:** Moving beyond typical current-state diagnosis modeling, our system maps **patient-specific disease trajectory**, aligning with state-of-the-art Digital Twin research and Healthcare AI.

---

## 🚀 How to Run Locally

Follow these steps to set up the Digital Twin environment on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Alzheimer-s-mulimodal-disease-prediction.git
cd Alzheimer-s-mulimodal-disease-prediction
```

### 2. Set Up a Virtual Environment (Recommended)
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Project
*(Depending on the specific module or app structure, you can run the models or the interface like below)*
```bash
# Example: Run the main application
python app.py
# Example: Run the Streamlit dashboard
streamlit run main.py
```

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Languages** | Python 3.10+ |
| **Deep Learning** | PyTorch (ResNet34) · Keras / TensorFlow (Bi-LSTM, GRU) |
| **Machine Learning** | CatBoost · XGBoost · Random Forest · Optuna |
| **NLP & Vision** | Vision-LLaMA (Groq) · OpenCV |
| **Data Processing** | Pandas · NumPy · Scikit-learn |

</div>

---

## 👥 Authors

> 🎓 **Sardar Patel Institute of Technology** — Major Project

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
