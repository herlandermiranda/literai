"""
Semantic Tag models for advanced text markup system.
"""
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base_class import Base


class TagType(str, enum.Enum):
    """Enum for semantic tag types."""
    CHARACTER = "character"
    PLACE = "place"
    EVENT = "event"
    THEME = "theme"
    NOTE = "note"
    LINK = "link"


class Tag(Base):
    """
    Tag model representing a semantic markup in text.
    
    Supports both Markdown [[type:name]] and XML <type>name</type> syntax.
    """
    
    __tablename__ = "tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    
    tag_type = Column(SQLEnum(TagType), nullable=False, index=True)
    tag_name = Column(String(255), nullable=False, index=True)
    
    # Position in text
    start_position = Column(Integer, nullable=False)
    end_position = Column(Integer, nullable=False)
    
    # Original syntax used
    syntax = Column(String(20), nullable=False)  # "markdown" or "xml"
    
    # Resolved entity (if applicable)
    resolved_entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", backref="tags")
    document = relationship("Document", backref="tags")
    resolved_entity = relationship("Entity", backref="tags")


class EntityResolution(Base):
    """
    EntityResolution model for mapping tag names to actual entities.
    
    Uses fuzzy matching to resolve [[character:John]] to Entity(name="John Smith").
    """
    
    __tablename__ = "entity_resolutions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    tag_name = Column(String(255), nullable=False, index=True)
    entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    
    # Fuzzy matching score (0.0 to 1.0)
    match_score = Column(Integer, nullable=False)  # Stored as int (0-100) for precision
    
    # Manual override flag
    is_manual = Column(String(10), default="false", nullable=False)  # "true" or "false" as string
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", backref="entity_resolutions")
    entity = relationship("Entity", backref="resolutions")
