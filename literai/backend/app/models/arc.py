"""
Arc model for managing narrative arcs.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base_class import Base


class Arc(Base):
    """Arc model representing a narrative arc (plot thread, theme, etc.)."""
    
    __tablename__ = "arcs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    color = Column(String(7), default="#3B82F6")  # Hex color for visualization
    arc_metadata = Column(JSONB, default={})  # Additional arc-specific data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="arcs")
    arc_links = relationship("ArcLink", back_populates="arc", cascade="all, delete-orphan")


class ArcLink(Base):
    """ArcLink model linking arcs to documents."""
    
    __tablename__ = "arc_links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    arc_id = Column(UUID(as_uuid=True), ForeignKey("arcs.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    importance = Column(JSONB, default=0.5)  # 0-1 scale for arc importance in this document
    position_in_document = Column(String(50))  # e.g., "beginning", "climax", "resolution"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    arc = relationship("Arc", back_populates="arc_links")
    document = relationship("Document", back_populates="arc_links")
