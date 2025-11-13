"""
LLMRequest model for tracking LLM API calls and costs.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.base_class import Base


class LLMRequestType(str, enum.Enum):
    """Enum for LLM request types."""
    CONTINUATION = "continuation"
    REWRITING = "rewriting"
    SUGGESTION = "suggestion"
    ANALYSIS = "analysis"
    CHARACTER_DEVELOPMENT = "character_development"
    WORLDBUILDING = "worldbuilding"
    DIALOGUE_ENHANCEMENT = "dialogue_enhancement"
    TAGGING = "tagging"
    EVALUATION = "evaluation"
    REVIEW_LOCAL = "review_local"
    REVIEW_GLOBAL = "review_global"
    COHERENCE_CHECK = "coherence_check"
    EMBEDDING = "embedding"


class LLMRequestStatus(str, enum.Enum):
    """Enum for LLM request status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class LLMRequest(Base):
    """LLMRequest model for logging LLM API calls."""
    
    __tablename__ = "llm_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(SQLEnum(LLMRequestType, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    model = Column(String(100), nullable=False)  # e.g., "gpt-4.1-mini", "text-embedding-3-large"
    status = Column(SQLEnum(LLMRequestStatus), default=LLMRequestStatus.PENDING, nullable=False)
    
    # Token usage and cost tracking
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_estimated = Column(Float, default=0.0)
    
    # Request and response data
    request_payload = Column(JSONB, default={})
    response_payload = Column(JSONB, default={})
    error_message = Column(String(1000))
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="llm_requests")
    project = relationship("Project", back_populates="llm_requests")
