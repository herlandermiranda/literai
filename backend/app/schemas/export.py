"""
Pydantic schemas for Export operations.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from enum import Enum


class ExportFormat(str, Enum):
    """Enum for export formats."""
    PDF = "pdf"
    EPUB = "epub"
    DOCX = "docx"
    MARKDOWN = "markdown"
    RTF = "rtf"
    CSV = "csv"


class SimpleExportRequest(BaseModel):
    """Schema for simple export request (format inferred from endpoint)."""
    project_id: UUID
    document_ids: Optional[List[UUID]] = None  # If None, export all
    include_metadata: bool = True
    include_entities: bool = False
    include_timeline: bool = False


class ExportRequest(BaseModel):
    """Schema for export request."""
    project_id: UUID
    format: ExportFormat
    document_ids: Optional[List[UUID]] = None  # If None, export all
    include_metadata: bool = True
    include_entities: bool = False
    include_timeline: bool = False


class ExportResponse(BaseModel):
    """Schema for export response."""
    file_url: str
    file_name: str
    file_size: int  # in bytes
    format: ExportFormat


class CSVExportRequest(BaseModel):
    """Schema for CSV export request (entities, timeline, etc.)."""
    project_id: UUID
    export_type: str = Field(..., pattern="^(entities|timeline|arcs)$")


class CSVExportResponse(BaseModel):
    """Schema for CSV export response."""
    csv_content: str
    row_count: int
