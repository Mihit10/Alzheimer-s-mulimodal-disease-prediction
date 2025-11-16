import pandas as pd
import numpy as np
import joblib
import json
import os

import warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", message=".*serialized model.*")
warnings.filterwarnings("ignore", message=".*Booster.save_model.*")

import os
import pandas as pd
import numpy as np
import joblib


# =====================================================
# LOAD MODELS & TOOLS ONCE
# =====================================================

BASE_DIR = os.path.dirname(__file__)
model_path = os.path.join(BASE_DIR, "model_7f", "content", "model_7f")


xgb_model = joblib.load(f"{model_path}/xgb_model.joblib")
rf_model  = joblib.load(f"{model_path}/rf_model.joblib")
nn_model  = joblib.load(f"{model_path}/nn_model.joblib")
blend_weights = joblib.load(f"{model_path}/blend_weights_optimized.joblib")

scaler = joblib.load(f"{model_path}/scaler.joblib")
le_dx  = joblib.load(f"{model_path}/label_encoder.joblib")
trained_columns = joblib.load(f"{model_path}/trained_columns.joblib")


# =====================================================
# FUNCTION: Predict Risk (Individual Inputs)
# =====================================================
def predict_patient_risk(
    ABETA: float,
    TAU: float,
    MMSE: float,
    APVOLUME: float,
    GENOTYPE: str
):
    # -------------------------
    # Build dataframe
    # -------------------------
    new_patient = pd.DataFrame([{
        "ABETA": ABETA,
        "TAU": TAU,
        "MMSE": MMSE,
        "APVOLUME": APVOLUME,
        "GENOTYPE": GENOTYPE
    }])

    # -------------------------
    # Feature engineering
    # -------------------------
    new_patient["ABETA_TAU_RATIO"] = new_patient["ABETA"] / new_patient["TAU"]
    new_patient["MMSE_TAU_INTERACT"] = new_patient["MMSE"] * new_patient["TAU"]

    # -------------------------
    # One-hot encode + align
    # -------------------------
    new_patient_encoded = pd.get_dummies(new_patient)
    aligned_input = pd.DataFrame(np.zeros((1, len(trained_columns))), columns=trained_columns)
    for c in new_patient_encoded.columns:
        if c in aligned_input.columns:
            aligned_input[c] = new_patient_encoded[c].values

    # -------------------------
    # Scaling
    # -------------------------
    aligned_input_scaled = scaler.transform(aligned_input)

    # -------------------------
    # Align for each model
    # -------------------------
    try:
        n_expected_xgb = xgb_model.n_features_in_
    except:
        n_expected_xgb = xgb_model.get_booster().num_features()

    aligned_for_xgb = aligned_input_scaled[:, :n_expected_xgb]
    aligned_for_rf  = aligned_input_scaled[:, :rf_model.n_features_in_]
    aligned_for_nn  = aligned_input_scaled[:, :nn_model.n_features_in_]

    # -------------------------
    # Predictions
    # -------------------------
    p_xgb = xgb_model.predict_proba(aligned_for_xgb)
    p_rf  = rf_model.predict_proba(aligned_for_rf)
    p_nn  = nn_model.predict_proba(aligned_for_nn)

    blend_probs = (
        blend_weights["w_xgb"] * p_xgb +
        blend_weights["w_rf"]  * p_rf +
        blend_weights["w_nn"]  * p_nn
    )

    # Predicted index + label
    pred_class_idx = int(np.argmax(blend_probs, axis=1)[0])
    pred_class_label = le_dx.inverse_transform([pred_class_idx])[0]

    # Class probabilities dictionary
    class_probs = {label: float(prob) for label, prob in zip(le_dx.classes_, blend_probs[0])}
    top_prob = class_probs[pred_class_label]

    # -------------------------
    # Risk Logic
    # -------------------------
    risk = "⚪ Uncertain — Model Could Not Determine Class"

    cn_p  = class_probs.get("CN", 0)
    mci_p = class_probs.get("MCI", 0)
    dem_p = class_probs.get("Dementia") or class_probs.get("AD") or class_probs.get("DEM") or 0

    if pred_class_label == "CN":
        if cn_p > 0.85:
            risk = "🟢 Very Low Risk (Stable Cognition)"
        elif cn_p > 0.65:
            risk = "🟢 Low Risk"
        elif cn_p > 0.50:
            risk = "🟡 Mild Risk"
        else:
            risk = "🟠 Converted Risk (Possible Early MCI)"

    elif pred_class_label == "MCI":
        if mci_p > 0.75:
            risk = "🟠 High Risk of Conversion to Dementia"
        elif mci_p > 0.55:
            risk = "🟡 Moderate MCI Risk"
        else:
            risk = "🟡 Borderline MCI"

    elif pred_class_label in ["Dementia", "AD", "DEM"]:
        if dem_p > 0.80:
            risk = "🔴 Very High Risk (Consistent with Dementia)"
        else:
            risk = "🟠 Possible Dementia — Confirm Clinically"

    # -------------------------
    # Return payload
    # -------------------------
    result = {
        "predicted_class": pred_class_label,
        "probability": round(top_prob, 3),
        "risk_category": risk
    }

    return result
