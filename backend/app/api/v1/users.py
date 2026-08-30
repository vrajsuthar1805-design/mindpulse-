from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.models.patient_profile import PatientProfile
from app.schemas.user import UserResponse, AssignPatientRequest
from app.schemas.patient_profile import PatientProfileUpdate, PatientProfileResponse
from app.api.deps import get_current_user, get_current_doctor, get_current_patient, get_current_admin
from app.core.audit import log_audit_event

router = APIRouter()

@router.get("/patients", response_model=List[UserResponse])
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    if current_user.role == UserRole.ADMIN:
        return db.query(User).filter(User.role == UserRole.PATIENT).all()
    
    return current_user.assigned_patients

@router.get("/all-patients", response_model=List[UserResponse])
def get_all_patients_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor)
):
    return db.query(User).filter(User.role == UserRole.PATIENT).all()

@router.post("/assign-patient", response_model=dict)
def assign_patient(
    assign_req: AssignPatientRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_doctor),
    request: Request = None
):
    patient = db.query(User).filter(User.id == assign_req.patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if patient not in current_user.assigned_patients:
        current_user.assigned_patients.append(patient)
        db.commit()
        log_audit_event(
            db,
            action="ASSIGN_PATIENT_TO_DOCTOR",
            resource_type="User",
            resource_id=patient.id,
            user=current_user,
            request=request
        )

    return {"message": f"Patient {patient.full_name} successfully assigned to Dr. {current_user.full_name}"}

# --- Doctor Patient Profile Management Endpoints ---

@router.put("/patients/{patient_id}/profile", response_model=PatientProfileResponse)
def update_patient_profile(
    patient_id: str,
    profile_in: PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(get_current_doctor),
    request: Request = None
):
    """
    Doctor endpoint: Input/Update patient profile demographics (mobile, DOB, blood group, allergies, etc.).
    RBAC: Doctor can ONLY update patients assigned to them.
    """
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if current_doctor.role != UserRole.ADMIN:
        assigned_ids = [p.id for p in current_doctor.assigned_patients]
        if patient_id not in assigned_ids:
            log_audit_event(
                db,
                action="UNAUTHORIZED_PATIENT_PROFILE_UPDATE_ATTEMPT",
                resource_type="PatientProfile",
                resource_id=patient_id,
                user=current_doctor,
                request=request
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Patient {patient.full_name} is not assigned to Dr. {current_doctor.full_name}."
            )

    # Update patient full_name if provided
    if profile_in.full_name and profile_in.full_name.strip():
        patient.full_name = profile_in.full_name.strip()

    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == patient_id).first()
    if not profile:
        profile = PatientProfile(
            patient_id=patient_id,
            created_by_doctor_id=current_doctor.id
        )
        db.add(profile)

    profile.created_by_doctor_id = current_doctor.id
    profile.mobile_number = profile_in.mobile_number
    profile.date_of_birth = profile_in.date_of_birth
    profile.age = profile_in.age
    profile.gender = profile_in.gender
    profile.blood_group = profile_in.blood_group
    profile.address = profile_in.address
    profile.emergency_contact = profile_in.emergency_contact
    profile.allergies = profile_in.allergies
    profile.past_medical_history = profile_in.past_medical_history

    db.commit()
    db.refresh(profile)

    log_audit_event(
        db,
        action="UPDATE_PATIENT_PROFILE_BY_DOCTOR",
        resource_type="PatientProfile",
        resource_id=profile.id,
        user=current_doctor,
        request=request
    )

    response_data = PatientProfileResponse.from_orm(profile)
    response_data.full_name = patient.full_name
    return response_data

@router.get("/patients/{patient_id}/profile", response_model=PatientProfileResponse)
def get_patient_profile_for_doctor(
    patient_id: str,
    db: Session = Depends(get_db),
    current_doctor: User = Depends(get_current_doctor),
    request: Request = None
):
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if current_doctor.role != UserRole.ADMIN:
        assigned_ids = [p.id for p in current_doctor.assigned_patients]
        if patient_id not in assigned_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Patient {patient.full_name} is not assigned to Dr. {current_doctor.full_name}."
            )

    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == patient_id).first()
    if not profile:
        profile = PatientProfile(patient_id=patient_id, created_by_doctor_id=current_doctor.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    response_data = PatientProfileResponse.from_orm(profile)
    response_data.full_name = patient.full_name
    return response_data

# --- Patient Read-Only Profile Access Endpoint ---

@router.get("/my-profile", response_model=PatientProfileResponse)
def get_my_patient_profile(
    db: Session = Depends(get_db),
    current_patient: User = Depends(get_current_patient),
    request: Request = None
):
    """
    RBAC Rule: Patients have READ-ONLY access to view their profile entered by their doctor.
    """
    log_audit_event(
        db,
        action="VIEW_MY_PATIENT_PROFILE",
        resource_type="PatientProfile",
        resource_id=current_patient.id,
        user=current_patient,
        request=request
    )

    profile = db.query(PatientProfile).filter(PatientProfile.patient_id == current_patient.id).first()
    if not profile:
        profile = PatientProfile(patient_id=current_patient.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    response_data = PatientProfileResponse.from_orm(profile)
    response_data.full_name = current_patient.full_name
    return response_data

@router.get("/audit-logs", response_model=List[dict])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None
):
    log_audit_event(db, action="VIEW_AUDIT_LOGS", resource_type="AuditLog", user=current_user, request=request)
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]
