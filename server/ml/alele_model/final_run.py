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
    # Ensure matching dimensions
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

    # -------------------------
    # CN probability
    # -------------------------
    cn_index = list(le_dx.classes_).index("CN")
    cn_prob = float(blend_probs[0][cn_index])

    # -------------------------
    # Risk mapping
    # -------------------------
    if cn_prob > 0.8:
        risk = "Very Low Risk (Cognitively Stable)"
    elif 0.6 < cn_prob <= 0.8:
        risk = "Low Risk"
    elif 0.45 < cn_prob <= 0.6:
        risk = "Moderate Risk"
    elif 0.3 < cn_prob <= 0.45:
        risk = "High Risk (Possible MCI Onset)"
    else:
        risk = "Very High Risk (Possible Dementia Progression)"

    # -------------------------
    # JSON output
    # -------------------------
    return {
        "cn_prob": round(cn_prob, 4),
        "risk": risk
    }

# result = predict_patient_risk(
#     ABETA=950,
#     TAU=320,
#     MMSE=26,
#     APVOLUME=4100,
#     GENOTYPE="3_4"
# )

# print(result)