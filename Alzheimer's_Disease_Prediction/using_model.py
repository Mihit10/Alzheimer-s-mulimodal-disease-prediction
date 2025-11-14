import pandas as pd
import joblib

# -------------------------------------------
# 1. Load Model + Saved Scalers
# -------------------------------------------
model = joblib.load("catboost_alzheimer_model.pkl")
minmax = joblib.load("minmax.pkl")
standard = joblib.load("standard.pkl")

print("Model and scalers loaded successfully!")

# -------------------------------------------
# 2. Columns that were scaled
# -------------------------------------------
scaled_cols = [
    'Age', 'BMI', 'AlcoholConsumption', 'PhysicalActivity', 'DietQuality',
    'SleepQuality', 'SystolicBP', 'DiastolicBP', 'CholesterolTotal',
    'CholesterolLDL', 'CholesterolHDL', 'CholesterolTriglycerides',
    'MMSE', 'FunctionalAssessment', 'ADL'
]

# -------------------------------------------
# 3. Function to preprocess & predict
# -------------------------------------------
def predict_alzheimer(patient_data):
    # Convert dict → DataFrame
    df = pd.DataFrame([patient_data])

    # Apply MinMaxScaler → StandardScaler
    df[scaled_cols] = minmax.transform(df[scaled_cols])
    df[scaled_cols] = standard.transform(df[scaled_cols])

    # Predict
    pred = model.predict(df)[0]

    return "Alzheimer Positive" if pred == 1 else "Alzheimer Negative"


# -------------------------------------------
# 4. Example Patient (change values)
# -------------------------------------------
sample_patient = {
    'PatientID': 101,
    'Age': 72,
    'Gender': 1,
    'Ethnicity': 2,
    'EducationLevel': 3,
    'BMI': 27.4,
    'Smoking': 0,
    'AlcoholConsumption': 1,
    'PhysicalActivity': 3,
    'DietQuality': 4,
    'SleepQuality': 3,
    'FamilyHistoryAlzheimers': 1,
    'CardiovascularDisease': 0,
    'Diabetes': 0,
    'Depression': 0,
    'HeadInjury': 0,
    'Hypertension': 1,
    'SystolicBP': 145,
    'DiastolicBP': 85,
    'CholesterolTotal': 200,
    'CholesterolLDL': 120,
    'CholesterolHDL': 50,
    'CholesterolTriglycerides': 150,
    'MMSE': 22,
    'FunctionalAssessment': 6,
    'MemoryComplaints': 1,
    'BehavioralProblems': 0,
    'ADL': 4,
    'Confusion': 1,
    'Disorientation': 0,
    'PersonalityChanges': 0,
    'DifficultyCompletingTasks': 1,
    'Forgetfulness': 1,
    'DoctorInCharge': 5
}

# -------------------------------------------
# 5. Run Prediction
# -------------------------------------------
result = predict_alzheimer(sample_patient)
print("Prediction:", result)
