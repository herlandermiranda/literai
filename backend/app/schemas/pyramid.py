"""
Pydantic schemas for Pyramid Node operations.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class PyramidNodeBase(BaseModel):
    """Base schema for PyramidNode."""
    title: str = Field(..., max_length=500)
    content: str
    level: int = Field(default=0, ge=0, le=2)  # Only 0 (high), 1 (intermediate), 2 (low)
    order: int = Field(default=0, ge=0)


class PyramidNodeCreate(BaseModel):
    """Schema for creating a new PyramidNode."""
    project_id: UUID
    parent_id: Optional[UUID] = None
    title: str = Field(..., max_length=500)
    content: str
    level: int = Field(..., ge=0, le=2)  # Required: 0 (high), 1 (intermediate), 2 (low)
    order: int = Field(default=0, ge=0)
    # BUG-023 FIX: Use alias instead of validation_alias for Pydantic v2
    is_generated: bool = Field(default=False, alias="is_generated")


class PyramidNodeUpdate(BaseModel):
    """Schema for updating a PyramidNode."""
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    order: Optional[int] = Field(None, ge=0)


class PyramidNodeInDB(PyramidNodeBase):
    """Schema for PyramidNode in database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    project_id: UUID
    parent_id: Optional[UUID] = None
    is_generated: bool
    created_at: datetime
    updated_at: datetime


class PyramidNode(PyramidNodeInDB):
    """Schema for PyramidNode with relationships."""
    children: List["PyramidNode"] = []


# Enable forward references
PyramidNode.model_rebuild()


class PyramidGenerateRequest(BaseModel):
    """Request schema for generating pyramid nodes."""
    node_id: Optional[UUID] = None  # If None, generate from project description
    direction: str = Field(..., pattern="^(down|up)$")  # "down" or "up"
    count: int = Field(default=3, ge=1, le=10)


class PyramidGenerateResponse(BaseModel):
    """Response schema for pyramid generation."""
    generated_nodes: List[PyramidNode]
    parent_node: Optional[PyramidNode] = None


class PyramidCoherenceCheck(BaseModel):
    """Schema for pyramid coherence check."""
    node_id: UUID
    issues: List[str] = []
    is_coherent: bool
    suggestions: List[str] = []
