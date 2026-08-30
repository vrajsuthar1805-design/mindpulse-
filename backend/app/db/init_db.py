from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.models.user import User, UserRole
from app.models.consultation import Consultation, ConsultationStatus
from app.models.medical_record import MedicalRecord
from app.models.patient_profile import PatientProfile
from app.core.security import get_password_hash

def init_db(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    admin = db.query(User).filter(User.email == "admin@healthcare.com").first()
    if not admin:
        admin = User(
            email="admin@healthcare.com",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=UserRole.ADMIN
        )
        db.add(admin)

    dr_smith = db.query(User).filter(User.email == "dr.smith@healthcare.com").first()
    if not dr_smith:
        dr_smith = User(
            email="dr.smith@healthcare.com",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Robert Smith, MD",
            role=UserRole.DOCTOR
        )
        db.add(dr_smith)

    dr_jones = db.query(User).filter(User.email == "dr.jones@healthcare.com").first()
    if not dr_jones:
        dr_jones = User(
            email="dr.jones@healthcare.com",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Sarah Jones, MD",
            role=UserRole.DOCTOR
        )
        db.add(dr_jones)

    patient_john = db.query(User).filter(User.email == "john.doe@gmail.com").first()
    if not patient_john:
        patient_john = User(
            email="john.doe@gmail.com",
            hashed_password=get_password_hash("patient123"),
            full_name="John Doe",
            role=UserRole.PATIENT
        )
        db.add(patient_john)

    patient_jane = db.query(User).filter(User.email == "jane.smith@gmail.com").first()
    if not patient_jane:
        patient_jane = User(
            email="jane.smith@gmail.com",
            hashed_password=get_password_hash("patient123"),
            full_name="Jane Smith",
            role=UserRole.PATIENT
        )
        db.add(patient_jane)

    db.commit()
    db.refresh(dr_smith)
    db.refresh(patient_john)
    db.refresh(patient_jane)

    # Assign John Doe to Dr. Smith
    if patient_john not in dr_smith.assigned_patients:
        dr_smith.assigned_patients.append(patient_john)
        db.commit()

    # Seed Patient Profile for John Doe
    john_profile = db.query(PatientProfile).filter(PatientProfile.patient_id == patient_john.id).first()
    if not john_profile:
        john_profile = PatientProfile(
            patient_id=patient_john.id,
            created_by_doctor_id=dr_smith.id,
            mobile_number="+1-555-0199",
            date_of_birth="1992-06-15",
            age=34,
            gender="Male",
            blood_group="O+",
            address="123 Health Ave, Suite 400, New York, NY",
            emergency_contact="Jane Doe (Spouse): +1-555-0188",
            allergies=["Penicillin", "Dust Mites"],
            past_medical_history="Mild Seasonal Asthma, Hypertension"
        )
        db.add(john_profile)
        db.commit()

    # Initial demo consultation & verified record
    existing_consultation = db.query(Consultation).filter(Consultation.patient_id == patient_john.id).first()
    if not existing_consultation:
        demo_consultation = Consultation(
            doctor_id=dr_smith.id,
            patient_id=patient_john.id,
            audio_url="https://firebasestorage.googleapis.com/v0/b/healthcare-ai.appspot.com/o/consultations%2Fdemo.mp3?alt=media",
            raw_transcript="Doctor: Good morning John. How are you feeling today?\nPatient: I have had a high fever and persistent dry cough for 3 days.\nDoctor: Diagnosing Upper Respiratory Infection. Prescribing Paracetamol 650mg and Amoxicillin 500mg.",
            status=ConsultationStatus.VERIFIED
        )
        db.add(demo_consultation)
        db.commit()
        db.refresh(demo_consultation)

        demo_record = MedicalRecord(
            consultation_id=demo_consultation.id,
            symptoms=["Fever (101.2 F)", "Dry Cough", "Headache"],
            duration="3 days",
            diagnosis="Acute Upper Respiratory Tract Infection",
            medicines=[
                {"name": "Paracetamol", "dosage": "650mg", "frequency": "3 times daily", "duration": "5 days"},
                {"name": "Amoxicillin", "dosage": "500mg", "frequency": "Twice daily", "duration": "5 days"}
            ],
            tests=["Complete Blood Count (CBC)"],
            follow_up="Follow up in 5 days if fever persists",
            patient_instructions="Drink plenty of warm liquids, rest well, and take medicines after meals.",
            is_verified=True,
            verified_by_doctor_id=dr_smith.id
        )
        db.add(demo_record)
        db.commit()

    print("[DB Init] Database initialized with seed users, patient profiles, and medical records successfully.")

if __name__ == "__main__":
    from app.db.session import SessionLocal
    db = SessionLocal()
    init_db(db)
    db.close()
