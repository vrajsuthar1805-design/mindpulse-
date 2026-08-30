import enum
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"

# Association table for Doctor-Patient relationship
doctor_patient_association = Table(
    "doctor_patient",
    Base.metadata,
    Column("doctor_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("patient_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("assigned_at", DateTime(timezone=True), server_default=func.now())
)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PATIENT, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    doctor_consultations = relationship("Consultation", foreign_keys="Consultation.doctor_id", back_populates="doctor")
    patient_consultations = relationship("Consultation", foreign_keys="Consultation.patient_id", back_populates="patient")

    patient_profile = relationship("PatientProfile", foreign_keys="PatientProfile.patient_id", back_populates="patient", uselist=False, cascade="all, delete-orphan")

    assigned_patients = relationship(
        "User",
        secondary=doctor_patient_association,
        primaryjoin=id == doctor_patient_association.c.doctor_id,
        secondaryjoin=id == doctor_patient_association.c.patient_id,
        backref="assigned_doctors"
    )
