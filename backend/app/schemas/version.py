"""
Pydantic schemas for Version (Git-like versioning) operations.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class VersionBase(BaseModel):
    """Base schema for Version."""
    commit_message: str = Field(..., max_length=500)


class VersionCreate(BaseModel):
    """Schema for creating a new Version."""
    project_id: UUID
    document_id: Optional[UUID] = None
    pyramid_node_id: Optional[UUID] = None
    commit_message: str = Field(..., max_length=500)
    author_email: str = Field(..., max_length=255)
    content_snapshot: str
    metadata_snapshot: Optional[str] = None
    parent_version_id: Optional[UUID] = None


class VersionUpdate(BaseModel):
    """Schema for updating a Version (minimal - versions are mostly immutable)."""
    commit_message: Optional[str] = Field(None, max_length=500)


class VersionInDB(VersionBase):
    """Schema for Version in database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    project_id: UUID
    document_id: Optional[UUID] = None
    pyramid_node_id: Optional[UUID] = None
    author_email: str
    content_snapshot: str
    metadata_snapshot: Optional[str] = None
    parent_version_id: Optional[UUID] = None
    created_at: datetime


class Version(VersionInDB):
    """Schema for Version response."""
    pass


class VersionDiff(BaseModel):
    """Schema for version diff."""
    version_a_id: UUID
    version_b_id: UUID
    diff_text: str
    additions: int
    deletions: int


class VersionRestore(BaseModel):
    """Schema for restoring a version."""
    version_id: UUID
    create_new_version: bool = True
