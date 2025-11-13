"""
Pydantic schemas for Document model.
"""
from pydantic import BaseModel, UUID4, field_serializer
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.document import DocumentType


class DocumentBase(BaseModel):
    """Base Document schema with common attributes."""
    title: str
    type: DocumentType = DocumentType.DRAFT
    content_raw: str = ""
    content_rich: Optional[Dict[str, Any]] = None
    order_index: int = 0


class DocumentCreate(DocumentBase):
    """Schema for creating a new document."""
    pass


class DocumentUpdate(BaseModel):
    """Schema for updating a document."""
    title: Optional[str] = None
    type: Optional[DocumentType] = None
    content_raw: Optional[str] = None
    content_rich: Optional[Dict[str, Any]] = None
    content: Optional[str] = None  # Alias for content_raw for frontend compatibility
    order_index: Optional[int] = None


class DocumentInDB(DocumentBase):
    """Schema for document as stored in database."""
    id: UUID4
    project_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Document(DocumentInDB):
    """Schema for document response."""
    content: Optional[str] = None  # Alias for content_raw
    
    def __init__(self, **data):
        super().__init__(**data)
        # Set content as alias for content_raw
        if self.content is None:
            self.content = self.content_raw or ""
