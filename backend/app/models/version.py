"""
Version model for Git-like versioning system.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base_class import Base


class Version(Base):
    """
    Version model representing a snapshot of content (Git-like commit).
    
    Supports versioning for:
    - Documents
    - Pyramid nodes
    - Any other versionable content
    """
    
    __tablename__ = "versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Polymorphic versioning: can version different entity types
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    pyramid_node_id = Column(UUID(as_uuid=True), ForeignKey("pyramid_nodes.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Version metadata
    commit_message = Column(String(500), nullable=False)
    author_email = Column(String(255), nullable=False)  # User email at time of commit
    
    # Snapshot of content
    content_snapshot = Column(Text, nullable=False)
    metadata_snapshot = Column(Text)  # JSON string of additional metadata
    
    # Git-like fields
    parent_version_id = Column(UUID(as_uuid=True), ForeignKey("versions.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", backref="versions")
    document = relationship("Document", back_populates="versions")
    pyramid_node = relationship("PyramidNode", back_populates="versions")
    parent_version = relationship("Version", remote_side=[id], backref="child_versions")
