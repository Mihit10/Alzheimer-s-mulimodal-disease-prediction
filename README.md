Digital Twin for Alzheimer’s Disease Prediction & Progression

A multimodal AI framework for early detection, risk stratification, and stage-wise classification of Alzheimer’s Disease using clinical data, MRI scans, biomarkers, genetics, and automated report extraction.
The system integrates multiple predictive models into a unified patient-specific Digital Twin.

📌 Overview

Alzheimer’s Disease (AD) is a progressive neurodegenerative disorder that cannot be reliably diagnosed using a single data modality. This project proposes a Digital Twin–based architecture that combines:

Lifestyle & clinical features

Structural MRI imaging

Genetic and biochemical biomarkers

Automated OCR-based medical report ingestion

Each modality contributes a complementary view of disease progression, enabling early diagnosis, explainable predictions, and future longitudinal modeling.

🧩 System Architecture

The system consists of three parallel prediction pipelines, all feeding into a unified Digital Twin:

Clinical Risk Prediction (CatBoost)

MRI-Based Dementia Stage Classification (ResNet34)

Biomarker + Genotype Risk Modeling (Ensemble)

An OCR module extracts structured data from real-world medical reports to automate ingestion.

🔬 Models & Methodology
1️⃣ Clinical / Lifestyle-Based Alzheimer’s Prediction

Goal: Early, non-invasive risk assessment
Model: CatBoost Classifier

Inputs

Demographics (age, gender, education)

Lifestyle factors (BMI, smoking, activity, diet, sleep)

Medical history & vitals

Cognitive & functional assessments (MMSE, ADL, Functional Assessment)

Behavioral indicators (memory complaints, confusion, personality changes)

Output

Binary prediction: Alzheimer’s Positive / Negative

Performance

Accuracy: 96%

F1-score: 0.94

2️⃣ MRI-Based Dementia Stage Classification

Goal: Structural brain degeneration analysis
Model: Fine-tuned ResNet34 CNN

Classes

Non-Demented

Very Mild Demented

Mild Demented

Moderate Demented

Dataset

~44,000 skull-stripped MRI images

Extensive augmentation and balancing

Performance

Accuracy: 99.7%

Minimal confusion between adjacent stages

3️⃣ Biomarker + Genotype Risk Prediction

Goal: Biological and genetic risk estimation
Models: XGBoost + Random Forest + Neural Network (Optuna-optimized ensemble)

Inputs

CSF biomarkers: ABETA, TAU

Cognitive score: MMSE

MRI volumetrics (AP Volume)

APOE genotype (one-hot encoded)

Engineered Features

ABETA / TAU ratio

MMSE × TAU interaction

Output

Multiclass probabilities: CN / MCI / Dementia

Performance

Accuracy: 63.3% (ADNI holdout set)

Consistent with state-of-the-art biomarker-only models

4️⃣ OCR-Based Medical Report Extraction

Model: Vision-enabled LLaMA (Groq)

Functionality

Parses PDFs / scanned reports

Extracts lab values, vitals, diagnoses, notes

Outputs clean, standardized JSON

Enables real-world hospital data ingestion

🧠 Digital Twin Representation

Each patient is represented as a unified JSON-based Digital Twin, containing:

Demographics & lifestyle data

Clinical risk predictions

MRI stage classification + confidence scores

Biomarker/genetic risk probabilities

OCR-extracted medical records

Temporal history (for future longitudinal modeling)

🛠️ Tech Stack

Languages: Python

ML/DL: CatBoost, XGBoost, Random Forest, PyTorch, fastai

Optimization: Optuna, GridSearchCV

Imaging: OpenCV, FastAI

Data: NumPy, Pandas, Scikit-learn

OCR & NLP: Vision-LLaMA (Groq)

Visualization: Matplotlib, Seaborn

Environment: Jupyter, Google Colab, VS Code

Version Control: Git, GitHub

🚀 Future Scope

Longitudinal modeling with LSTM / GRU

Temporal multimodal transformers

Disease progression forecasting

Treatment and lifestyle intervention simulation

Clinical Decision Support System (CDSS)

Real-time Digital Twin updates

⚠️ Disclaimer

This project is for research and educational purposes only and is not a medical diagnostic tool. Clinical decisions must always be made by qualified healthcare professionals.

👥 Authors

Ria Talsania

Mihit Singasane

Ved Thakker

Under the guidance of Prof. Swapnali Kurhade
Sardar Patel Institute of Technology
