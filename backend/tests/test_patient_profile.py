import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.db.init_db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    db = SessionLocal()
    init_db(db)
    db.close()

def test_doctor_update_patient_profile():
    with TestClient(app) as client:
        # Login Dr Smith
        doc_login = client.post(
            "/api/v1/auth/login",
            json={"email": "dr.smith@healthcare.com", "password": "doctor123"}
        )
        token = doc_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get patients to find John Doe ID
        patients_res = client.get("/api/v1/users/patients", headers=headers)
        john = [p for p in patients_res.json() if p["email"] == "john.doe@gmail.com"][0]

        # Doctor updates John Doe profile
        update_payload = {
            "full_name": "Johnathan Doe",
            "mobile_number": "+1-555-0999",
            "date_of_birth": "1992-06-15",
            "age": 34,
            "gender": "Male",
            "blood_group": "O+",
            "address": "742 Evergreen Terrace",
            "emergency_contact": "Jane Doe: +1-555-0888",
            "allergies": ["Penicillin", "Peanuts"],
            "past_medical_history": "Asthma, Seasonal Allergies"
        }

        res = client.put(f"/api/v1/users/patients/{john['id']}/profile", json=update_payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["mobile_number"] == "+1-555-0999"
        assert data["blood_group"] == "O+"
        assert "Peanuts" in data["allergies"]

def test_patient_view_my_profile_read_only():
    with TestClient(app) as client:
        # Login Patient John Doe
        pat_login = client.post(
            "/api/v1/auth/login",
            json={"email": "john.doe@gmail.com", "password": "patient123"}
        )
        token = pat_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Patient reads profile
        res = client.get("/api/v1/users/my-profile", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["mobile_number"] == "+1-555-0999"
        assert data["blood_group"] == "O+"
