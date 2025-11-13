"""
Pydantic schemas for User model.
"""
from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base User schema with common attributes."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    """Schema for user as stored in database."""
    id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


class User(UserInDB):
    """Schema for user response."""
    pass
