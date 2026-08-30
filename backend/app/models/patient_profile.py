import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    created_by_doctor_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    # Demographics & Patient Entities
    mobile_number = Column(String(50), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    allergies = Column(JSON, nullable=False, default=list)            # e.g., ["Penicillin", "Peanuts"]
    past_medical_history = Column(Text, nullable=True)               # e.g., "Hypertension, Asthma"

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_profile")
    creator_doctor = relationship("User", foreign_keys=[created_by_doctor_id])
