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

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

def test_login_doctor():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "dr.smith@healthcare.com", "password": "doctor123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "DOCTOR"

def test_login_patient():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "john.doe@gmail.com", "password": "patient123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "PATIENT"

def test_patient_get_my_records():
    with TestClient(app) as client:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "john.doe@gmail.com", "password": "patient123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/v1/medical-records/my-records", headers=headers)
        assert response.status_code == 200
        records = response.json()
        assert isinstance(records, list)
        assert len(records) > 0
        assert records[0]["diagnosis"] == "Acute Upper Respiratory Tract Infection"

def test_patient_rbac_access_denied():
    with TestClient(app) as client:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "john.doe@gmail.com", "password": "patient123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Patient trying to access doctor queue must be rejected with 403 Forbidden
        response = client.get("/api/v1/consultations/doctor-queue", headers=headers)
        assert response.status_code == 403
