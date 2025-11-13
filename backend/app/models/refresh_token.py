"""
Refresh Token model for token revocation and management.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base_class import Base


class RefreshToken(Base):
    """
    Refresh token model for managing token lifecycle and revocation.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        token_jti: JWT ID claim (unique identifier in token)
        expires_at: Token expiration time
        revoked_at: Time when token was revoked (None if active)
        created_at: Token creation time
    """
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    token_jti = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="refresh_tokens")

    def is_valid(self) -> bool:
        """Check if token is still valid."""
        now = datetime.utcnow()
        return now < self.expires_at and self.revoked_at is None

    def revoke(self) -> None:
        """Revoke the token."""
        self.revoked_at = datetime.utcnow()
