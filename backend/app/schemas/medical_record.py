from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel

class MedicineItem(BaseModel):
    name: str
    dosage: Optional[str] = ""
    frequency: Optional[str] = ""
    duration: Optional[str] = ""

class ExtractedMedicalData(BaseModel):
    symptoms: List[str] = []
    duration: Optional[str] = ""
    diagnosis: str
    medicines: List[MedicineItem] = []
    tests: List[str] = []
    follow_up: Optional[str] = ""
    patient_instructions: str

class MedicalRecordUpdate(BaseModel):
    symptoms: List[str]
    duration: Optional[str] = None
    diagnosis: str
    medicines: List[MedicineItem]
    tests: List[str]
    follow_up: Optional[str] = None
    patient_instructions: str
    is_verified: bool = True

class MedicalRecordResponse(BaseModel):
    id: str
    consultation_id: str
    symptoms: List[str]
    duration: Optional[str]
    diagnosis: str
    medicines: List[Any]
    tests: List[str]
    follow_up: Optional[str]
    patient_instructions: str
    is_verified: bool
    verified_by_doctor_id: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
