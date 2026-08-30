from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.consultations import router as consultations_router
from app.api.v1.medical_records import router as medical_records_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users & RBAC"])
api_router.include_router(consultations_router, prefix="/consultations", tags=["Consultations & AI Pipeline"])
api_router.include_router(medical_records_router, prefix="/medical-records", tags=["Medical Records"])
