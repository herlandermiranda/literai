"""
TagInstance model for tracking entity occurrences in text.
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base_class import Base


class TagInstance(Base):
    """TagInstance model representing an entity occurrence in a document."""
    
    __tablename__ = "tag_instances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # For tags not linked to an entity
    type = Column(String(50))  # e.g., "emotion", "time", "arc"
    
    # Position in text
    start_offset = Column(Integer, nullable=False)
    end_offset = Column(Integer, nullable=False)
    text_snapshot = Column(String(500))  # Snapshot of the tagged text
    
    # Metadata
    tag_metadata = Column(JSONB, default={})  # source (auto/manual), confidence, llm_request_id, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    document = relationship("Document", back_populates="tag_instances")
    entity = relationship("Entity", back_populates="tag_instances")
