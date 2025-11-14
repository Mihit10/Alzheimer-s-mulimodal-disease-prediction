from pydantic import BaseModel

class PatientInput(BaseModel):
    ABETA: float
    TAU: float
    MMSE: float
    APVOLUME: float
    GENOTYPE: str
