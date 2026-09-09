from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from models.user import UserRole

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CONTRIBUTOR
    org_name: Optional[str] = None
    university_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    org_name: Optional[str] = None
    university_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
