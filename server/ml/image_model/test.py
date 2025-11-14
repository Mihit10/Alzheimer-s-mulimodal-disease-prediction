import pathlib
# Fix for Linux-trained model loaded on Windows
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

from fastai.vision.all import *

learn = load_learner("model.pkl")

pred, pred_idx, probs = learn.predict("test.jpg")
print(pred)
