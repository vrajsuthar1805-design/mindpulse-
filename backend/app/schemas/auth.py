from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    sub: str  # User ID
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
