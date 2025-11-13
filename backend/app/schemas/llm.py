"""
Pydantic schemas for LLM requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


class ContinuationRequest(BaseModel):
    """Request schema for text continuation."""
    project_id: UUID = Field(..., description="Project ID")
    existing_text: str = Field(..., description="The text to continue from")
    user_instructions: Optional[str] = Field(None, description="Additional instructions")
    target_length: int = Field(500, ge=50, le=2000, description="Target length in words")
    entity_ids: Optional[List[UUID]] = Field(None, description="Entity IDs for context")
    arc_ids: Optional[List[UUID]] = Field(None, description="Arc IDs for context")
    event_ids: Optional[List[UUID]] = Field(None, description="Timeline event IDs for context")


class RewritingRequest(BaseModel):
    """Request schema for text rewriting."""
    project_id: UUID = Field(..., description="Project ID")
    text_to_rewrite: str = Field(..., description="The text to rewrite")
    rewriting_goals: str = Field(..., description="Specific goals for rewriting")
    user_instructions: Optional[str] = Field(None, description="Additional instructions")


class SuggestionRequest(BaseModel):
    """Request schema for creative suggestions."""
    project_id: UUID = Field(..., description="Project ID")
    current_context: str = Field(..., description="Current story context")
    user_question: str = Field(..., description="User's question or challenge")
    entity_ids: Optional[List[UUID]] = Field(None, description="Entity IDs for context")
    arc_ids: Optional[List[UUID]] = Field(None, description="Arc IDs for context")
    event_ids: Optional[List[UUID]] = Field(None, description="Timeline event IDs for context")


class AnalysisRequest(BaseModel):
    """Request schema for text analysis."""
    project_id: UUID = Field(..., description="Project ID")
    text_to_analyze: str = Field(..., description="The text to analyze")
    analysis_focus: str = Field(..., description="Specific focus areas for analysis")
    user_instructions: Optional[str] = Field(None, description="Additional instructions")


class LLMResponse(BaseModel):
    """Response schema for LLM requests."""
    text: str = Field(..., description="Generated text")
    request_id: str = Field(..., description="ID of the logged request")


class LLMRequestHistory(BaseModel):
    """Schema for LLM request history."""
    id: UUID
    request_type: str
    prompt: str
    response: str
    model: str
    tokens_used: Optional[int]
    status: str
    created_at: str
    
    class Config:
        from_attributes = True
