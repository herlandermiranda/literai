"""
Entity model for managing universe elements (characters, locations, items, etc.).
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base_class import Base


class EntityType(str, enum.Enum):
    """Enum for entity types."""
    CHARACTER = "character"
    LOCATION = "location"
    ITEM = "item"
    FACTION = "faction"
    CONCEPT = "concept"


class Entity(Base):
    """Entity model representing universe elements (characters, locations, etc.)."""
    
    __tablename__ = "entities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SQLEnum(EntityType), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, index=True)  # URL-friendly identifier
    summary = Column(Text)
    data = Column(JSONB, default={})  # Flexible data storage for type-specific attributes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="entities")
    tag_instances = relationship("TagInstance", back_populates="entity", cascade="all, delete-orphan")
    timeline_links = relationship("TimelineLink", back_populates="entity", cascade="all, delete-orphan")
