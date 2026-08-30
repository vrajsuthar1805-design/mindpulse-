import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Healthcare AI Application"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "super-secret-jwt-key-change-in-production-healthcare-ai"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database URL: supports postgresql:// or sqlite:///
    DATABASE_URL: str = "sqlite:///./healthcare_ai.db"

    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = "healthcare-ai.appspot.com"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
