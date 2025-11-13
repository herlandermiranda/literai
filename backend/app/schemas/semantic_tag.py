"""
Pydantic schemas for Semantic Tag operations.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.semantic_tag import TagType


class TagBase(BaseModel):
    """Base schema for Tag."""
    tag_type: TagType
    tag_name: str = Field(..., max_length=255)


class TagCreate(BaseModel):
    """Schema for creating a new Tag."""
    project_id: UUID
    document_id: Optional[UUID] = None
    tag_type: TagType
    tag_name: str = Field(..., max_length=255)
    start_position: int = Field(..., ge=0)
    end_position: int = Field(..., ge=0)
    syntax: str = Field(..., pattern="^(markdown|xml)$")
    resolved_entity_id: Optional[UUID] = None


class TagUpdate(BaseModel):
    """Schema for updating a Tag."""
    tag_name: Optional[str] = Field(None, max_length=255)
    resolved_entity_id: Optional[UUID] = None


class TagInDB(TagBase):
    """Schema for Tag in database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    project_id: UUID
    document_id: Optional[UUID] = None
    start_position: int
    end_position: int
    syntax: str
    resolved_entity_id: Optional[UUID] = None
    created_at: datetime


class Tag(TagInDB):
    """Schema for Tag response."""
    pass


class EntityResolutionBase(BaseModel):
    """Base schema for EntityResolution."""
    tag_name: str = Field(..., max_length=255)
    entity_id: UUID


class EntityResolutionCreate(BaseModel):
    """Schema for creating a new EntityResolution."""
    project_id: UUID
    tag_name: str = Field(..., max_length=255)
    entity_id: UUID
    match_score: int = Field(..., ge=0, le=100)
    is_manual: str = Field(default="false", pattern="^(true|false)$")


class EntityResolutionUpdate(BaseModel):
    """Schema for updating an EntityResolution."""
    entity_id: Optional[UUID] = None
    is_manual: Optional[str] = Field(None, pattern="^(true|false)$")


class EntityResolutionInDB(EntityResolutionBase):
    """Schema for EntityResolution in database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    project_id: UUID
    match_score: int
    is_manual: str
    created_at: datetime
    updated_at: datetime


class EntityResolution(EntityResolutionInDB):
    """Schema for EntityResolution response."""
    pass


class TagParseRequest(BaseModel):
    """Request schema for parsing tags in text."""
    text: str
    project_id: UUID
    document_id: Optional[UUID] = None


class TagParseResponse(BaseModel):
    """Response schema for tag parsing."""
    tags: List[Tag]
    unresolved_tags: List[str] = []


class TagAutocompleteRequest(BaseModel):
    """Request schema for tag autocomplete."""
    project_id: UUID
    tag_type: TagType
    partial_name: str = Field(..., max_length=100)


class TagAutocompleteResponse(BaseModel):
    """Response schema for tag autocomplete."""
    suggestions: List[str]


class TagValidateRequest(BaseModel):
    """Request schema for tag validation."""
    project_id: UUID
    tags: List[TagCreate]


class TagValidateResponse(BaseModel):
    """Response schema for tag validation."""
    valid: bool
    errors: List[str] = []
