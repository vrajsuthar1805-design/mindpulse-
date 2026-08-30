from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.consultation import ConsultationStatus
from app.schemas.medical_record import MedicalRecordResponse, ExtractedMedicalData

class ConsultationCreate(BaseModel):
    patient_id: str
    audio_url: str

class ConsultationProcessRequest(BaseModel):
    # Used when audio URL or mock audio file is posted directly for transcription & AI extraction
    patient_id: str
    audio_url: Optional[str] = None
    custom_transcript: Optional[str] = None # Optional override for testing without Whisper API key

class ConsultationResponse(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    audio_url: str
    raw_transcript: Optional[str] = None
    status: ConsultationStatus
    created_at: datetime
    updated_at: datetime
    medical_record: Optional[MedicalRecordResponse] = None

    class Config:
        from_attributes = True
