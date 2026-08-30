from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.consultation import Consultation, ConsultationStatus
from app.models.medical_record import MedicalRecord
from app.schemas.consultation import ConsultationResponse, ConsultationProcessRequest
from app.api.deps import get_current_doctor
from app.services.storage_service import save_uploaded_audio_file, get_firebase_audio_url
from app.services.whisper_service import transcribe_audio
from app.services.gemini_service import extract_medical_data_from_transcript
from app.core.audit import log_audit_event

router = APIRouter()

@router.post("/process", response_model=ConsultationResponse)
async def create_and_process_consultation(
    patient_id: str = Form(...),
    audio_file: Optional[UploadFile] = File(None),
    audio_url: Optional[str] = Form(None),
    custom_transcript: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_doctor: User = Depends(get_current_doctor),
    request: Request = None
):
    """
    Core AI Pipeline Endpoint:
    1. Uploads Audio to Firebase Storage
    2. Transcribes audio using OpenAI Whisper
    3. Extracts structured JSON using Google Gemini API
    4. Creates Consultation and MedicalRecord in PENDING_REVIEW state
    """
    # Verify patient exists
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Handle Audio file / URL
    local_file_path = None
    final_audio_url = audio_url or ""

    if audio_file:
        content = await audio_file.read()
        local_file_path, final_audio_url = save_uploaded_audio_file(content, audio_file.filename)
    elif not final_audio_url:
        final_audio_url = get_firebase_audio_url("demo_consultation.mp3")

    # Step 1: Speech-To-Text (Whisper)
    if custom_transcript and len(custom_transcript.strip()) > 0:
        raw_transcript = custom_transcript.strip()
    elif local_file_path:
        raw_transcript = transcribe_audio(local_file_path)
    else:
        raw_transcript = transcribe_audio(final_audio_url)

    # Step 2: Extract Structured JSON (Gemini LLM)
    extracted_data = extract_medical_data_from_transcript(raw_transcript)

    # Step 3: Save Consultation
    consultation = Consultation(
        doctor_id=current_doctor.id,
        patient_id=patient_id,
        audio_url=final_audio_url,
        raw_transcript=raw_transcript,
        status=ConsultationStatus.PENDING_REVIEW
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # Step 4: Save Medical Record (Unverified draft until Doctor verifies)
    medical_record = MedicalRecord(
        consultation_id=consultation.id,
        symptoms=extracted_data.symptoms,
        duration=extracted_data.duration,
        diagnosis=extracted_data.diagnosis,
        medicines=[m.dict() if hasattr(m, "dict") else m for m in extracted_data.medicines],
        tests=extracted_data.tests,
        follow_up=extracted_data.follow_up,
        patient_instructions=extracted_data.patient_instructions,
        is_verified=False
    )
    db.add(medical_record)
    db.commit()
    db.refresh(medical_record)

    log_audit_event(
        db,
        action="CREATE_AND_PROCESS_CONSULTATION",
        resource_type="Consultation",
        resource_id=consultation.id,
        user=current_doctor,
        request=request
    )

    return db.query(Consultation).filter(Consultation.id == consultation.id).first()

@router.get("/doctor-queue", response_model=List[ConsultationResponse])
def get_doctor_pending_consultations(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(get_current_doctor)
):
    """
    Get all consultations created by or assigned to doctor for verification queue.
    """
    consultations = db.query(Consultation).filter(Consultation.doctor_id == current_doctor.id).order_by(Consultation.created_at.desc()).all()
    return consultations

@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation_by_id(
    consultation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")
    return consultation
