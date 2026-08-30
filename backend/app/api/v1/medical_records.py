from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.consultation import Consultation, ConsultationStatus
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordResponse, MedicalRecordUpdate
from app.api.deps import get_current_user, get_current_doctor, get_current_patient
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/my-records", response_model=List[MedicalRecordResponse])
def get_my_medical_records(
    db: Session = Depends(get_db),
    current_patient: User = Depends(get_current_patient),
    request: Request = None
):
    """
    RBAC Rule: A patient can ONLY view their own verified records.
    """
    log_audit_event(
        db,
        action="GET_MY_RECORDS",
        resource_type="MedicalRecord",
        resource_id=current_patient.id,
        user=current_patient,
        request=request
    )

    records = (
        db.query(MedicalRecord)
        .join(Consultation, MedicalRecord.consultation_id == Consultation.id)
        .filter(Consultation.patient_id == current_patient.id)
        .filter(MedicalRecord.is_verified == True)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return records

@router.get("/patients/{patient_id}/records", response_model=List[MedicalRecordResponse])
def get_patient_records_for_doctor(
    patient_id: str,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(get_current_doctor),
    request: Request = None
):
    """
    RBAC Rule: A doctor can ONLY view records of patients assigned to them.
    (Admins can view all patient records).
    """
    # Check if patient exists
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Strict RBAC Check: Is patient assigned to this doctor?
    if current_doctor.role != UserRole.ADMIN:
        assigned_patient_ids = [p.id for p in current_doctor.assigned_patients]
        if patient_id not in assigned_patient_ids:
            log_audit_event(
                db,
                action="UNAUTHORIZED_PATIENT_RECORD_ACCESS_ATTEMPT",
                resource_type="MedicalRecord",
                resource_id=patient_id,
                user=current_doctor,
                request=request
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Patient {patient.full_name} is not assigned to Dr. {current_doctor.full_name}."
            )

    log_audit_event(
        db,
        action="VIEW_PATIENT_RECORDS_BY_DOCTOR",
        resource_type="MedicalRecord",
        resource_id=patient_id,
        user=current_doctor,
        request=request
    )

    records = (
        db.query(MedicalRecord)
        .join(Consultation, MedicalRecord.consultation_id == Consultation.id)
        .filter(Consultation.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return records

@router.put("/{record_id}/verify", response_model=MedicalRecordResponse)
def verify_and_update_medical_record(
    record_id: str,
    record_update: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(get_current_doctor),
    request: Request = None
):
    """
    Doctor workstation endpoint: Edit and verify AI extracted medical record.
    Once verified, status changes to VERIFIED and becomes visible to patient.
    """
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical Record not found")

    # Update record fields
    record.symptoms = record_update.symptoms
    record.duration = record_update.duration
    record.diagnosis = record_update.diagnosis
    record.medicines = [m.dict() if hasattr(m, "dict") else m for m in record_update.medicines]
    record.tests = record_update.tests
    record.follow_up = record_update.follow_up
    record.patient_instructions = record_update.patient_instructions
    
    record.is_verified = True
    record.verified_by_doctor_id = current_doctor.id
    record.verified_at = datetime.now(timezone.utc)

    # Update consultation status
    if record.consultation:
        record.consultation.status = ConsultationStatus.VERIFIED

    db.commit()
    db.refresh(record)

    log_audit_event(
        db,
        action="VERIFY_AND_UPDATE_MEDICAL_RECORD",
        resource_type="MedicalRecord",
        resource_id=record.id,
        user=current_doctor,
        request=request
    )

    return record
