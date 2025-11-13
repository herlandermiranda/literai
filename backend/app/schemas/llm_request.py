"""
Pydantic schemas for LLM requests and responses.
"""
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.models.llm_request import LLMRequestType, LLMRequestStatus


# LLM Request schemas
class LLMRequestBase(BaseModel):
    """Base LLMRequest schema."""
    type: LLMRequestType
    model: str
    request_payload: Dict[str, Any] = {}


class LLMRequestInDB(LLMRequestBase):
    """Schema for LLM request as stored in database."""
    id: UUID4
    user_id: UUID4
    project_id: Optional[UUID4] = None
    status: LLMRequestStatus
    input_tokens: int
    output_tokens: int
    cost_estimated: float
    response_payload: Dict[str, Any] = {}
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LLMRequest(LLMRequestInDB):
    """Schema for LLM request response."""
    pass


# Tagging schemas
class EntityDetection(BaseModel):
    """Schema for detected entity in text."""
    type: str
    label: str
    canonical_id: Optional[str] = None
    confidence: float


class TimeMention(BaseModel):
    """Schema for time mention in text."""
    raw: str
    normalized: Optional[str] = None
    confidence: float


class EmotionDetection(BaseModel):
    """Schema for detected emotion in text."""
    label: str
    strength: float


class ArcDetection(BaseModel):
    """Schema for detected arc in text."""
    candidate_arc_name: str
    confidence: float


class TaggingRequest(BaseModel):
    """Schema for tagging request."""
    project_id: UUID4
    document_id: UUID4
    text_span: str
    span_id: str
    mode: str = "auto"


class TaggingResponse(BaseModel):
    """Schema for tagging response."""
    text_span_id: str
    entities: List[EntityDetection]
    time_mentions: List[TimeMention]
    emotions: List[EmotionDetection]
    arcs: List[ArcDetection]


# Evaluation schemas
class EvaluationCriterion(BaseModel):
    """Schema for evaluation criterion."""
    name: str
    score: float
    comment: str


class EvaluationRequest(BaseModel):
    """Schema for evaluation request."""
    project_id: UUID4
    document_id: UUID4
    text: str
    criteria: List[str] = ["style", "coherence", "rhythm"]


class EvaluationResponse(BaseModel):
    """Schema for evaluation response."""
    global_score: float
    criteria: List[EvaluationCriterion]
    summary: str


# Review schemas
class ReviewRequest(BaseModel):
    """Schema for review request."""
    project_id: UUID4
    document_id: UUID4
    text: str
    constraints: Dict[str, Any] = {}


class ReviewSuggestion(BaseModel):
    """Schema for review suggestion."""
    type: str  # e.g., "repetition", "heavy_sentence", "dialogue", "inconsistency"
    location: str
    issue: str
    suggestion: str
    severity: str  # "low", "medium", "high"


class ReviewResponse(BaseModel):
    """Schema for review response."""
    suggestions: List[ReviewSuggestion]
    summary: str


# Global review schemas
class GlobalReviewRequest(BaseModel):
    """Schema for global review request."""
    project_id: UUID4


class GlobalReviewResponse(BaseModel):
    """Schema for global review response."""
    job_id: UUID4
    status: str


class GlobalReviewResult(BaseModel):
    """Schema for global review result."""
    arc_coherence: str
    character_development: str
    timeline_coherence: str
    pacing: str
    abandoned_threads: List[str]
    underutilized_arcs: List[str]
    recommendations: List[str]
