from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Body
from .models.input import PatientInput
from ml.image_model.final_run import predict_image
from ml.alele_model.final_run import predict_patient_risk 
from ml.base_model.using_model import predict_alzheimer
from ml.base_model.using_model import sample_patient
from ml.ocr.final_run import MedicalBloodReportExtractor
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware

extractor = MedicalBloodReportExtractor()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or put "http://localhost:5173" if you want restricted access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/alele")
def predict(data: PatientInput):
    result = predict_patient_risk(
        ABETA=data.ABETA,
        TAU=data.TAU,
        MMSE=data.MMSE,
        APVOLUME=data.APVOLUME,
        GENOTYPE=data.GENOTYPE
    )
    return result

@app.post("/image")
async def predict_image_route(file: UploadFile = File(...)):

    # 1. Read uploaded file bytes
    img_bytes = await file.read()

    # 2. Convert bytes → PIL Image
    try:
        img = Image.open(io.BytesIO(img_bytes))
        img = img.convert("RGB")  # ensures correct mode + forces load
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file uploaded.")

    # 3. Pass PIL image to your prediction function
    result = predict_image(img)

    return result

@app.post("/extract-report")
async def extract_report(file: UploadFile = File(...)):
    bytes_data = await file.read()
    result = extractor.extract_from_file(bytes_data)
    return result

@app.post("/base")
async def predict(patient_data: dict = Body(...)):
    patient = sample_patient.copy()

    # Override only what user sends
    for key, value in patient_data.items():
        if key in patient:
            try:
                patient[key] = float(value) if '.' in str(value) else int(value)
            except:
                patient[key] = value

    prediction = predict_alzheimer(patient)

    return {
        "input_used": patient,
        "prediction": prediction
    }