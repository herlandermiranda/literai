"""
Audit Log model for tracking authentication and security events.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base_class import Base


class AuditLog(Base):
    """
    Audit log model for tracking security events.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User (nullable for failed logins)
        action: Action performed (login, logout, refresh, failed_login, etc.)
        status: Action status (success, failure)
        ip_address: Client IP address
        user_agent: Client user agent
        details: Additional details (JSON)
        created_at: Event creation time
    """
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(50), nullable=False, index=True)  # login, logout, refresh, failed_login
    status = Column(String(20), nullable=False)  # success, failure
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    details = Column(String(500), nullable=True)  # Additional context
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    user = relationship("User", back_populates="audit_logs")

    # Index for efficient querying
    __table_args__ = (
        Index('idx_audit_user_action', 'user_id', 'action'),
        Index('idx_audit_created', 'created_at'),
    )
