# Healthcare AI Application (MVP)

A production-ready MVP for a Healthcare AI Application designed for hackathon/startup presentation.

## Core Features
1. **Audio Recording & Storage**: Record doctor-patient consultations live or upload audio files (Firebase Storage integration).
2. **Speech-to-Text Transcription**: OpenAI Whisper transcribes raw dialogue.
3. **Structured AI Medical Extraction**: Google Gemini API extracts structured JSON containing: `symptoms`, `duration`, `diagnosis`, `medicines`, `tests`, `follow_up`, and `patient_instructions` (in simple layman language).
4. **Doctor Verification Workstation**: Interactive UI allowing doctors to review, edit, and publish verified clinical records.
5. **Strict Role-Based Access Control (RBAC)**:
   - **PATIENT**: Access ONLY via `GET /api/v1/medical-records/my-records` (only their own verified records).
   - **DOCTOR**: Access ONLY via `GET /api/v1/medical-records/patients/{id}/records` for assigned patients.
   - **ADMIN**: Access to user management and security audit logs (`GET /api/v1/users/audit-logs`).
6. **Security Audit Logging**: Simulated audit trail logging data access, verification events, and unauthorized access attempts.

---

## Quick Start (Local Run)

### Backend (Python + FastAPI)
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Run DB initialization & seed data
python -m app.db.init_db

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API Docs will be available at: http://127.0.0.1:8000/docs

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will be available at: http://localhost:3000

---

## Pre-seeded Demo Accounts
- **Doctor**: `dr.smith@healthcare.com` / `doctor123`
- **Patient**: `john.doe@gmail.com` / `patient123`
- **Admin**: `admin@healthcare.com` / `admin123`
