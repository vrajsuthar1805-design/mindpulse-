import enum
import uuid
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class ConsultationStatus(str, enum.Enum):
    RECORDED = "RECORDED"
    TRANSCRIBED = "TRANSCRIBED"
    PENDING_REVIEW = "PENDING_REVIEW"
    VERIFIED = "VERIFIED"

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    doctor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    audio_url = Column(String(1024), nullable=False)
    raw_transcript = Column(Text, nullable=True)
    status = Column(Enum(ConsultationStatus), default=ConsultationStatus.RECORDED, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="doctor_consultations")
    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_consultations")
    medical_record = relationship("MedicalRecord", back_populates="consultation", uselist=False, cascade="all, delete-orphan")
