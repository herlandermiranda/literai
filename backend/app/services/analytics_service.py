"""
Analytics service for generating project statistics and insights.
"""
from typing import Dict, List, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import defaultdict

from app.models.document import Document
from app.models.entity import Entity
from app.models.arc import Arc
from app.models.timeline import TimelineEvent
from app.models.llm_request import LLMRequest
from app.schemas.analytics import (
    ProjectAnalytics,
    WordCountStats,
    WritingProgressStats,
    EntityStats,
    ArcStats,
    TimelineStats
)


class AnalyticsService:
    """Service for generating project analytics."""
    
    @staticmethod
    def calculate_word_count_stats(db: Session, project_id: UUID) -> WordCountStats:
        """
        Calculate word count statistics for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Word count statistics
        """
        documents = db.query(Document).filter(Document.project_id == project_id).all()
        
        total_words = 0
        total_characters = 0
        total_characters_no_spaces = 0
        by_document = {}
        
        for doc in documents:
            content = doc.content_raw or ""
            words = len(content.split())
            chars = len(content)
            chars_no_spaces = len(content.replace(" ", ""))
            
            total_words += words
            total_characters += chars
            total_characters_no_spaces += chars_no_spaces
            by_document[str(doc.id)] = words
        
        avg_word_length = total_characters_no_spaces / total_words if total_words > 0 else 0.0
        
        return WordCountStats(
            total_words=total_words,
            total_characters=total_characters,
            total_characters_no_spaces=total_characters_no_spaces,
            average_word_length=avg_word_length,
            by_document=by_document
        )
    
    @staticmethod
    def calculate_writing_progress_stats(db: Session, project_id: UUID) -> WritingProgressStats:
        """
        Calculate writing progress statistics.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Writing progress statistics
        """
        # Get documents updated in the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        documents = db.query(Document).filter(
            Document.project_id == project_id,
            Document.updated_at >= thirty_days_ago
        ).all()
        
        words_per_day: Dict[str, int] = defaultdict(int)
        
        for doc in documents:
            date_key = doc.updated_at.strftime("%Y-%m-%d")
            words = len((doc.content_raw or "").split())
            words_per_day[date_key] += words
        
        # Calculate session stats (simplified - based on document updates)
        total_sessions = len(documents)
        average_session_length = 45.0  # Placeholder - would need session tracking
        
        # Find most productive day
        most_productive_day = max(words_per_day.items(), key=lambda x: x[1])[0] if words_per_day else "N/A"
        most_productive_hour = 14  # Placeholder - would need timestamp tracking
        
        return WritingProgressStats(
            words_per_day=dict(words_per_day),
            total_sessions=total_sessions,
            average_session_length=average_session_length,
            most_productive_day=most_productive_day,
            most_productive_hour=most_productive_hour
        )
    
    @staticmethod
    def calculate_entity_stats(db: Session, project_id: UUID) -> EntityStats:
        """
        Calculate entity statistics.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Entity statistics
        """
        entities = db.query(Entity).filter(Entity.project_id == project_id).all()
        
        total_entities = len(entities)
        by_type: Dict[str, int] = defaultdict(int)
        
        for entity in entities:
            by_type[entity.type.value] += 1
        
        # Most mentioned entities (placeholder - would need tag instance counting)
        most_mentioned = [
            {"name": entity.name, "count": 10, "type": entity.type.value}
            for entity in entities[:5]
        ]
        
        return EntityStats(
            total_entities=total_entities,
            by_type=dict(by_type),
            most_mentioned=most_mentioned
        )
    
    @staticmethod
    def calculate_arc_stats(db: Session, project_id: UUID) -> ArcStats:
        """
        Calculate arc statistics.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Arc statistics
        """
        arcs = db.query(Arc).filter(Arc.project_id == project_id).all()
        
        total_arcs = len(arcs)
        # Arc n'a pas de champ status, on ne peut pas calculer completed/in_progress
        completed_arcs = 0
        in_progress_arcs = 0
        
        # Calculate average arc length (number of linked documents)
        total_length = sum(len(arc.arc_links) for arc in arcs)
        average_arc_length = total_length / total_arcs if total_arcs > 0 else 0.0
        
        return ArcStats(
            total_arcs=total_arcs,
            completed_arcs=completed_arcs,
            in_progress_arcs=in_progress_arcs,
            average_arc_length=average_arc_length
        )
    
    @staticmethod
    def calculate_timeline_stats(db: Session, project_id: UUID) -> TimelineStats:
        """
        Calculate timeline statistics.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Timeline statistics
        """
        events = db.query(TimelineEvent).filter(TimelineEvent.project_id == project_id).all()
        
        total_events = len(events)
        events_with_date = sum(1 for event in events if event.date is not None)
        events_without_date = total_events - events_with_date
        
        # Calculate timeline span
        dated_events = [event for event in events if event.date]
        if len(dated_events) >= 2:
            dates = [event.date for event in dated_events]
            timeline_span_days = (max(dates) - min(dates)).days
        else:
            timeline_span_days = 0
        
        return TimelineStats(
            total_events=total_events,
            events_with_date=events_with_date,
            events_without_date=events_without_date,
            timeline_span_days=timeline_span_days
        )
    
    @staticmethod
    def generate_project_analytics(db: Session, project_id: UUID) -> ProjectAnalytics:
        """
        Generate complete analytics for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Complete project analytics
        """
        # Get LLM usage stats
        llm_requests = db.query(LLMRequest).filter(LLMRequest.project_id == project_id).all()
        llm_usage: Dict[str, int] = defaultdict(int)
        for req in llm_requests:
            llm_usage[req.request_type.value] += 1
        
        return ProjectAnalytics(
            project_id=project_id,
            generated_at=datetime.utcnow(),
            word_count=AnalyticsService.calculate_word_count_stats(db, project_id),
            writing_progress=AnalyticsService.calculate_writing_progress_stats(db, project_id),
            entities=AnalyticsService.calculate_entity_stats(db, project_id),
            arcs=AnalyticsService.calculate_arc_stats(db, project_id),
            timeline=AnalyticsService.calculate_timeline_stats(db, project_id),
            llm_usage=dict(llm_usage)
        )


analytics_service = AnalyticsService()
