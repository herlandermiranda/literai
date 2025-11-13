"""
Pydantic schemas for TimelineEvent and TimelineLink models.
"""
from pydantic import BaseModel, UUID4
from datetime import datetime, date
from typing import Optional, Dict, Any, Union


class TimelineEventBase(BaseModel):
    """Base TimelineEvent schema with common attributes."""
    title: str
    description: Optional[str] = None
    date: Optional[Union[date, str]] = None  # Accept both date objects and strings
    order_index: int = 0
    event_metadata: Dict[str, Any] = {}


class TimelineEventCreate(TimelineEventBase):
    """Schema for creating a new timeline event."""
    pass


class TimelineEventUpdate(BaseModel):
    """Schema for updating a timeline event."""
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[Union[date, str]] = None  # Accept both date objects and strings
    order_index: Optional[int] = None
    event_metadata: Optional[Dict[str, Any]] = None


class TimelineEventInDB(TimelineEventBase):
    """Schema for timeline event as stored in database."""
    id: UUID4
    project_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TimelineEvent(TimelineEventInDB):
    """Schema for timeline event response."""
    pass


# TimelineLink schemas
class TimelineLinkBase(BaseModel):
    """Base TimelineLink schema with common attributes."""
    timeline_event_id: UUID4
    document_id: Optional[UUID4] = None
    entity_id: Optional[UUID4] = None
    role: str = "focus"


class TimelineLinkCreate(TimelineLinkBase):
    """Schema for creating a new timeline link."""
    pass


class TimelineLinkUpdate(BaseModel):
    """Schema for updating a timeline link."""
    role: Optional[str] = None


class TimelineLinkInDB(TimelineLinkBase):
    """Schema for timeline link as stored in database."""
    id: UUID4
    created_at: datetime
    
    class Config:
        from_attributes = True


class TimelineLink(TimelineLinkInDB):
    """Schema for timeline link response."""
    pass
