"""
Pydantic schemas for Analytics operations.
"""
from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Any
from uuid import UUID
from datetime import datetime


class WordCountStats(BaseModel):
    """Schema for word count statistics."""
    total_words: int
    total_characters: int
    total_characters_no_spaces: int
    average_word_length: float
    by_document: Dict[str, int] = {}  # document_id -> word_count


class WritingProgressStats(BaseModel):
    """Schema for writing progress statistics."""
    words_per_day: Dict[str, int] = {}  # date -> word_count
    total_sessions: int
    average_session_length: float  # in minutes
    most_productive_day: str
    most_productive_hour: int


class EntityStats(BaseModel):
    """Schema for entity statistics."""
    total_entities: int
    by_type: Dict[str, int] = {}  # entity_type -> count
    most_mentioned: List[Dict[str, Any]] = []  # [{name, count, type}]


class ArcStats(BaseModel):
    """Schema for arc statistics."""
    total_arcs: int
    completed_arcs: int
    in_progress_arcs: int
    average_arc_length: float  # in documents


class TimelineStats(BaseModel):
    """Schema for timeline statistics."""
    total_events: int
    events_with_date: int
    events_without_date: int
    timeline_span_days: int


class ProjectAnalytics(BaseModel):
    """Schema for complete project analytics."""
    model_config = ConfigDict(from_attributes=True)
    
    project_id: UUID
    generated_at: datetime
    
    word_count: WordCountStats
    writing_progress: WritingProgressStats
    entities: EntityStats
    arcs: ArcStats
    timeline: TimelineStats
    
    llm_usage: Dict[str, int] = {}  # request_type -> count


class AnalyticsExport(BaseModel):
    """Schema for exporting analytics."""
    format: str = "json"  # json, csv, pdf
    include_charts: bool = False
