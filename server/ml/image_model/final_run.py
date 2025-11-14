import pathlib
import os
# Fix for Linux-trained model loaded on Windows
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

from fastai.vision.all import *


BASE_DIR = os.path.dirname(__file__)
# ---------------------------------------------
# Load the exported fastai model
# ---------------------------------------------
learn = load_learner(f"{BASE_DIR}/model.pkl")


# ---------------------------------------------
# Prediction Function
# ---------------------------------------------
def predict_image(image_input):
    """
    image_input: str path OR PIL image

    Returns:
        {
            "prediction": "class_name",
            "confidence": 0.95
        }
    """
    pred, pred_idx, probs = learn.predict(image_input)

    confidence = float(probs[pred_idx])

    return {
        "prediction": str(pred),
        "confidence": round(confidence, 5)
    }
