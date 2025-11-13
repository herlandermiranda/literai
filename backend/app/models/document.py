"""
Document model for managing text documents within projects.
"""
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base_class import Base


class DocumentType(str, enum.Enum):
    """Enum for document types."""
    DRAFT = "draft"
    SCENE = "scene"
    NOTE = "note"
    OUTLINE = "outline"
    WORLDBUILDING = "worldbuilding"
    CHARACTER_SHEET = "character_sheet"
    LOCATION_SHEET = "location_sheet"


class Document(Base):
    """Document model representing a text document within a project."""
    
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    type = Column(SQLEnum(DocumentType), default=DocumentType.DRAFT, nullable=False)
    content_raw = Column(Text, default="")  # Raw text with markup tags
    content_rich = Column(JSONB)  # Rich editor structure (ProseMirror JSON)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="documents")
    tag_instances = relationship("TagInstance", back_populates="document", cascade="all, delete-orphan")
    arc_links = relationship("ArcLink", back_populates="document", cascade="all, delete-orphan")
    timeline_links = relationship("TimelineLink", back_populates="document", cascade="all, delete-orphan")
    versions = relationship("Version", back_populates="document", cascade="all, delete-orphan")
