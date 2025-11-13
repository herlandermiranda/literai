"""
Timeline models for managing chronological events.
"""
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base_class import Base


class TimelineEvent(Base):
    """TimelineEvent model representing a chronological event in the story."""
    
    __tablename__ = "timeline_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=True)  # Actual date if known
    order_index = Column(Integer, default=0)  # Relative ordering
    event_metadata = Column(JSONB, default={})  # Additional event data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="timeline_events")
    timeline_links = relationship("TimelineLink", back_populates="timeline_event", cascade="all, delete-orphan")


class TimelineLink(Base):
    """TimelineLink model linking timeline events to documents and entities."""
    
    __tablename__ = "timeline_links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    timeline_event_id = Column(UUID(as_uuid=True), ForeignKey("timeline_events.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=True, index=True)
    role = Column(String(50), default="focus")  # e.g., "focus", "background", "mentioned"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    timeline_event = relationship("TimelineEvent", back_populates="timeline_links")
    document = relationship("Document", back_populates="timeline_links")
    entity = relationship("Entity", back_populates="timeline_links")
