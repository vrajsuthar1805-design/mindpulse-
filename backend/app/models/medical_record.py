import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    consultation_id = Column(String(36), ForeignKey("consultations.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Structured Extracted Data
    symptoms = Column(JSON, nullable=False, default=list)        # e.g., ["fever", "cough"]
    duration = Column(String(255), nullable=True)                 # e.g., "3 days"
    diagnosis = Column(Text, nullable=False)                      # e.g., "Acute Upper Respiratory Tract Infection"
    medicines = Column(JSON, nullable=False, default=list)        # e.g., [{"name": "Amoxicillin", "dosage": "500mg", "frequency": "TDS", "duration": "5 days"}]
    tests = Column(JSON, nullable=False, default=list)            # e.g., ["CBC", "Chest X-Ray"]
    follow_up = Column(String(255), nullable=True)                # e.g., "In 7 days if symptoms persist"
    patient_instructions = Column(Text, nullable=False)           # Layman language instructions
    
    # Verification Meta
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    verified_by_doctor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    consultation = relationship("Consultation", back_populates="medical_record")
    verifier = relationship("User", foreign_keys=[verified_by_doctor_id])
