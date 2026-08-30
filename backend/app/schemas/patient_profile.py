from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class PatientProfileBase(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: List[str] = []
    past_medical_history: Optional[str] = None

class PatientProfileUpdate(PatientProfileBase):
    pass

class PatientProfileResponse(PatientProfileBase):
    id: str
    patient_id: str
    created_by_doctor_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
