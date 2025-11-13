"""
Pydantic schemas for Entity model.
"""
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.entity import EntityType


class EntityBase(BaseModel):
    """Base Entity schema with common attributes."""
    type: EntityType
    name: str
    slug: Optional[str] = None
    summary: Optional[str] = None
    data: Dict[str, Any] = {}


class EntityCreate(EntityBase):
    """Schema for creating a new entity."""
    pass


class EntityUpdate(BaseModel):
    """Schema for updating an entity."""
    type: Optional[EntityType] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class EntityInDB(EntityBase):
    """Schema for entity as stored in database."""
    id: UUID4
    project_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Entity(EntityInDB):
    """Schema for entity response."""
    pass
