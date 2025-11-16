import pandas as pd
import joblib
import os

import warnings
warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(__file__)

model = joblib.load(f"{BASE_DIR}/catboost_alzheimer_model.pkl")
minmax = joblib.load(f"{BASE_DIR}/minmax.pkl")
standard = joblib.load(f"{BASE_DIR}/standard.pkl")

scaled_cols = [
    'Age', 'BMI', 'AlcoholConsumption', 'PhysicalActivity', 'DietQuality',
    'SleepQuality', 'SystolicBP', 'DiastolicBP', 'CholesterolTotal',
    'CholesterolLDL', 'CholesterolHDL', 'CholesterolTriglycerides',
    'MMSE', 'FunctionalAssessment', 'ADL'
]


def predict_alzheimer_full(
    PatientID, Age, Gender, Ethnicity, EducationLevel, BMI, Smoking,
    AlcoholConsumption, PhysicalActivity, DietQuality, SleepQuality,
    FamilyHistoryAlzheimers, CardiovascularDisease, Diabetes, Depression,
    HeadInjury, Hypertension, SystolicBP, DiastolicBP, CholesterolTotal,
    CholesterolLDL, CholesterolHDL, CholesterolTriglycerides, MMSE,
    FunctionalAssessment, MemoryComplaints, BehavioralProblems, ADL,
    Confusion, Disorientation, PersonalityChanges, DifficultyCompletingTasks,
    Forgetfulness, DoctorInCharge
):
    
    patient_data = {
        'PatientID': PatientID,
        'Age': Age,
        'Gender': Gender,
        'Ethnicity': Ethnicity,
        'EducationLevel': EducationLevel,
        'BMI': BMI,
        'Smoking': Smoking,
        'AlcoholConsumption': AlcoholConsumption,
        'PhysicalActivity': PhysicalActivity,
        'DietQuality': DietQuality,
        'SleepQuality': SleepQuality,
        'FamilyHistoryAlzheimers': FamilyHistoryAlzheimers,
        'CardiovascularDisease': CardiovascularDisease,
        'Diabetes': Diabetes,
        'Depression': Depression,
        'HeadInjury': HeadInjury,
        'Hypertension': Hypertension,
        'SystolicBP': SystolicBP,
        'DiastolicBP': DiastolicBP,
        'CholesterolTotal': CholesterolTotal,
        'CholesterolLDL': CholesterolLDL,
        'CholesterolHDL': CholesterolHDL,
        'CholesterolTriglycerides': CholesterolTriglycerides,
        'MMSE': MMSE,
        'FunctionalAssessment': FunctionalAssessment,
        'MemoryComplaints': MemoryComplaints,
        'BehavioralProblems': BehavioralProblems,
        'ADL': ADL,
        'Confusion': Confusion,
        'Disorientation': Disorientation,
        'PersonalityChanges': PersonalityChanges,
        'DifficultyCompletingTasks': DifficultyCompletingTasks,
        'Forgetfulness': Forgetfulness,
        'DoctorInCharge': DoctorInCharge
    }

    df = pd.DataFrame([patient_data])

    # Scaling
    df[scaled_cols] = minmax.transform(df[scaled_cols])
    df[scaled_cols] = standard.transform(df[scaled_cols])

    # Model Prediction
    pred = model.predict(df)[0]

    return "Alzheimer Positive" if pred == 1 else "Alzheimer Negative"

# result = predict_alzheimer_full(
#     101, 72, 1, 2, 3, 27.4, 0,
#     1, 3, 4, 3, 1, 0, 0, 0, 0,
#     1, 145, 85, 200, 120, 50, 150,
#     22, 6, 1, 0, 4, 1, 0, 0, 1, 1, 5
# )

# print("Prediction:", result)
