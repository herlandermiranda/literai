"""
Pydantic schemas for Project model.
"""
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional
from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    """Base Project schema with common attributes."""
    title: str
    description: Optional[str] = None
    language: str = "fr"


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectInDB(ProjectBase):
    """Schema for project as stored in database."""
    id: UUID4
    user_id: UUID4
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Project(ProjectInDB):
    """Schema for project response."""
    pass
