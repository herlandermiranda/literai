"""
Pydantic schemas for TagInstance model.
"""
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any


class TagInstanceBase(BaseModel):
    """Base TagInstance schema with common attributes."""
    document_id: UUID4
    entity_id: Optional[UUID4] = None
    type: Optional[str] = None
    start_offset: int
    end_offset: int
    text_snapshot: Optional[str] = None
    tag_metadata: Dict[str, Any] = {}


class TagInstanceCreate(TagInstanceBase):
    """Schema for creating a new tag instance."""
    pass


class TagInstanceUpdate(BaseModel):
    """Schema for updating a tag instance."""
    entity_id: Optional[UUID4] = None
    type: Optional[str] = None
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    text_snapshot: Optional[str] = None
    tag_metadata: Optional[Dict[str, Any]] = None


class TagInstanceInDB(TagInstanceBase):
    """Schema for tag instance as stored in database."""
    id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


class TagInstance(TagInstanceInDB):
    """Schema for tag instance response."""
    pass
