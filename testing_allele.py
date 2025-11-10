# =====================================================
# 📦 IMPORTS
# =====================================================
import pandas as pd
import numpy as np
import joblib

# =====================================================
# 🧩 LOAD TRAINED MODELS AND TOOLS
# =====================================================
model_path = "/content/model_7f"

xgb_model = joblib.load(f"{model_path}/xgb_model.joblib")
rf_model  = joblib.load(f"{model_path}/rf_model.joblib")
nn_model  = joblib.load(f"{model_path}/nn_model.joblib")
blend_weights = joblib.load(f"{model_path}/blend_weights_optimized.joblib")

scaler = joblib.load(f"{model_path}/scaler.joblib")
le_dx  = joblib.load(f"{model_path}/label_encoder.joblib")
trained_columns = joblib.load(f"{model_path}/trained_columns.joblib")

print(f"✅ All models and tools loaded successfully ({len(trained_columns)} trained features)")

# =====================================================
# 📥 NEW PATIENT INPUT
# =====================================================
new_patient = pd.DataFrame([{
    'ABETA': 950,
    'TAU': 320,
    'MMSE': 26,
    'APVOLUME': 4100,
    'GENOTYPE': '3_4'
}])

# =====================================================
# 🧬 FEATURE ENGINEERING
# =====================================================
new_patient['ABETA_TAU_RATIO'] = new_patient['ABETA'] / new_patient['TAU']
new_patient['MMSE_TAU_INTERACT'] = new_patient['MMSE'] * new_patient['TAU']

# =====================================================
# 🧩 ONE-HOT ENCODE + ALIGN FEATURES
# =====================================================
new_patient_encoded = pd.get_dummies(new_patient)

aligned_input = pd.DataFrame(np.zeros((1, len(trained_columns))), columns=trained_columns)
for c in new_patient_encoded.columns:
    if c in aligned_input.columns:
        aligned_input[c] = new_patient_encoded[c].values

# =====================================================
# ⚖️ SCALE USING TRAINING SCALER
# =====================================================
aligned_input_scaled = scaler.transform(aligned_input)

# =====================================================
# 🔧 ENSURE MODEL SHAPE MATCHING
# =====================================================
try:
    n_expected_xgb = xgb_model.n_features_in_
except:
    n_expected_xgb = xgb_model.get_booster().num_features()

n_expected_rf = rf_model.n_features_in_
n_expected_nn = nn_model.n_features_in_

aligned_for_xgb = aligned_input_scaled[:, :n_expected_xgb]
aligned_for_rf  = aligned_input_scaled[:, :n_expected_rf]
aligned_for_nn  = aligned_input_scaled[:, :n_expected_nn]

# =====================================================
# 🔮 PREDICTIONS
# =====================================================
p_xgb = xgb_model.predict_proba(aligned_for_xgb)
p_rf  = rf_model.predict_proba(aligned_for_rf)
p_nn  = nn_model.predict_proba(aligned_for_nn)

blend_probs = (
    blend_weights['w_xgb'] * p_xgb +
    blend_weights['w_rf']  * p_rf  +
    blend_weights['w_nn']  * p_nn
)

pred_class_idx = np.argmax(blend_probs, axis=1)[0]
pred_class_label = le_dx.inverse_transform([pred_class_idx])[0]

print("\n🧩 Predicted Diagnosis:", pred_class_label)
print("📊 Class Probabilities:")
for label, prob in zip(le_dx.classes_, blend_probs[0]):
    print(f"  {label}: {prob:.3f}")

# =====================================================
# 🧠 INTERPRET RISK BASED ON CN PROBABILITY
# =====================================================
# Find CN probability
cn_prob = blend_probs[0][list(le_dx.classes_).index("CN")]

if cn_prob > 0.8:
    risk = "🟢 Very Low Risk (Cognitively Stable)"
elif 0.6 < cn_prob <= 0.8:
    risk = "🟢 Low Risk"
elif 0.45 < cn_prob <= 0.6:
    risk = "🟡 Moderate Risk"
elif 0.3 < cn_prob <= 0.45:
    risk = "🟠 High Risk (Possible MCI Onset)"
else:
    risk = "🔴 Very High Risk (Possible Dementia Progression)"

print(f"\n🧾 CN Probability: {cn_prob:.3f}")
print(f"📈 Risk Category: {risk}")
