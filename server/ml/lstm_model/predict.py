"""
LSTM prediction module for Alzheimer's diagnosis.
Loads the trained model + scaler and exposes predict_diagnosis().
"""

import os
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# ── Constants ─────────────────────────────────────────────────────────────
FEATURE_COLS = ['entry_age', 'CDGLOBAL', 'MMSCORE', 'TOTSCORE', 'visit_month']
LABEL_NAMES = ['CN', 'MCI', 'AD']
MAX_LEN = 3

# ── Paths ─────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'model_weights', 'lstm_model.keras')
SCALER_PATH = os.path.join(SCRIPT_DIR, 'model_weights', 'scaler.joblib')

# ── Lazy load globals ─────────────────────────────────────────────────────
_model = None
_scaler = None


def _load_resources():
    """Load model and scaler if not already loaded."""
    global _model, _scaler
    if _model is None:
        _model = load_model(MODEL_PATH)
    if _scaler is None:
        _scaler = joblib.load(SCALER_PATH)


def predict_diagnosis(visits: list[dict]) -> dict:
    """
    Predict next-visit diagnosis from a list of visit records.

    Args:
        visits: list of dicts, each with keys:
            - visit_month (int): 0, 6, 12, 24, 36, 48, 60, 72, 78, 84
            - entry_age (float): patient age at entry
            - CDGLOBAL (float): Clinical Dementia Rating (0, 0.5, 1, 2, 3)
            - MMSCORE (float): Mini-Mental State Exam score (0-30)
            - TOTSCORE (float): Total Score

    Returns:
        dict with:
            - predicted_class: str ("CN", "MCI", or "AD")
            - predicted_index: int (0, 1, or 2)
            - probabilities: dict {CN: float, MCI: float, AD: float}
            - risk_level: str ("low", "moderate", "high")
    """
    _load_resources()

    # Build the feature matrix from the visits
    seq = []
    for v in visits:
        row = [
            float(v.get('entry_age', 0)),
            float(v.get('CDGLOBAL', 0)),
            float(v.get('MMSCORE', 0)),
            float(v.get('TOTSCORE', 0)),
            float(v.get('visit_month', 0)),
        ]
        seq.append(row)

    X = np.array([seq], dtype='float32')  # shape: (1, num_visits, 5)

    # Pad to MAX_LEN
    X = pad_sequences(X, maxlen=MAX_LEN, dtype='float32', padding='pre', value=0.0)

    # Replace NaN
    X = np.nan_to_num(X, nan=0.0)

    # Scale
    original_shape = X.shape
    X_2d = X.reshape(-1, X.shape[-1])
    X_scaled = _scaler.transform(X_2d).reshape(original_shape)

    # Predict
    probs = _model.predict(X_scaled, verbose=0)[0]
    predicted_idx = int(np.argmax(probs))
    predicted_class = LABEL_NAMES[predicted_idx]

    # Risk level
    if predicted_idx == 0:
        risk_level = "low"
    elif predicted_idx == 1:
        risk_level = "moderate"
    else:
        risk_level = "high"

    return {
        "predicted_class": predicted_class,
        "predicted_index": predicted_idx,
        "probabilities": {
            "CN": round(float(probs[0]), 4),
            "MCI": round(float(probs[1]), 4),
            "AD": round(float(probs[2]), 4),
        },
        "risk_level": risk_level,
    }
