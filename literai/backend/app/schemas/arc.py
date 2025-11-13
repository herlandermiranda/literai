"""
Pydantic schemas for Arc and ArcLink models.
"""
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any


class ArcBase(BaseModel):
    """Base Arc schema with common attributes."""
    name: str
    description: Optional[str] = None
    color: str = "#3B82F6"
    arc_metadata: Dict[str, Any] = {}


class ArcCreate(ArcBase):
    """Schema for creating a new arc."""
    pass


class ArcUpdate(BaseModel):
    """Schema for updating an arc."""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    arc_metadata: Optional[Dict[str, Any]] = None


class ArcInDB(ArcBase):
    """Schema for arc as stored in database."""
    id: UUID4
    project_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Arc(ArcInDB):
    """Schema for arc response."""
    pass


# ArcLink schemas
class ArcLinkBase(BaseModel):
    """Base ArcLink schema with common attributes."""
    arc_id: UUID4
    document_id: UUID4
    importance: float = 0.5
    position_in_document: Optional[str] = None


class ArcLinkCreate(ArcLinkBase):
    """Schema for creating a new arc link."""
    pass


class ArcLinkUpdate(BaseModel):
    """Schema for updating an arc link."""
    importance: Optional[float] = None
    position_in_document: Optional[str] = None


class ArcLinkInDB(ArcLinkBase):
    """Schema for arc link as stored in database."""
    id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


class ArcLink(ArcLinkInDB):
    """Schema for arc link response."""
    pass
