from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional
from app.core.security import validate_password_strength

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes
    user: 'UserResponse'

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_password(cls, v):
        if not validate_password_strength(v):
            raise ValueError(
                'Password must be at least 8 characters long and contain '
                'uppercase, lowercase, digit, and special character'
            )
        return v

class CreateUserRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        return v

    @validator('password')
    def validate_password(cls, v):
        if not validate_password_strength(v):
            raise ValueError(
                'Password must be at least 8 characters long and contain '
                'uppercase, lowercase, digit, and special character'
            )
        return v

# Résoudre les références circulaires
LoginResponse.model_rebuild()