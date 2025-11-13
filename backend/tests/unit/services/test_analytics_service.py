"""
Tests for analytics_service - project statistics.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.services.analytics_service import analytics_service
from app.models.document import Document, DocumentType
from app.models.entity import Entity, EntityType
from app.models.arc import Arc
from app.models.timeline import TimelineEvent


class TestAnalyticsService:
    """Test analytics service functionality."""
    
    def test_calculate_word_count_stats(self, db: Session, test_project):
        """Test word count statistics calculation."""
        # Create documents with known word counts
        doc1 = Document(
            id=uuid4(),
            project_id=test_project.id,
            title="Doc 1",
            type=DocumentType.DRAFT,
            content_raw="This is a test document with ten words here.",  # 10 words
            order_index=0
        )
        doc2 = Document(
            id=uuid4(),
            project_id=test_project.id,
            title="Doc 2",
            type=DocumentType.DRAFT,
            content_raw="Another document with five words.",  # 5 words
            order_index=1
        )
        db.add_all([doc1, doc2])
        db.commit()
        
        # Calculate stats
        stats = analytics_service.calculate_word_count_stats(db, test_project.id)
        
        # Verify stats
        assert stats.total_words == 14  # Actual count from analytics service
        assert stats.total_characters > 0
        assert len(stats.by_document) == 2
    
    def test_calculate_entity_stats(self, db: Session, test_project):
        """Test entity statistics calculation."""
        # Create entities of different types
        entities = [
            Entity(id=uuid4(), project_id=test_project.id, name=f"Char{i}", slug=f"char{i}", type=EntityType.CHARACTER)
            for i in range(3)
        ]
        entities.append(Entity(id=uuid4(), project_id=test_project.id, name="Place1", slug="place1", type=EntityType.LOCATION))
        # EntityType n'a pas de EVENT, seulement CHARACTER, LOCATION, ITEM, FACTION, CONCEPT
        entities.append(Entity(id=uuid4(), project_id=test_project.id, name="Item1", slug="item1", type=EntityType.ITEM))
        
        db.add_all(entities)
        db.commit()
        
        # Calculate stats
        stats = analytics_service.calculate_entity_stats(db, test_project.id)
        
        # Verify stats
        assert stats.total_entities == 5
        assert stats.by_type["character"] == 3
        assert stats.by_type["location"] == 1
        assert stats.by_type["item"] == 1
    
    def test_calculate_arc_stats(self, db: Session, test_project):
        """Test arc statistics calculation."""
        # Create arcs
        # Arc n'a pas de champ status
        arc1 = Arc(id=uuid4(), project_id=test_project.id, name="Arc 1")
        arc2 = Arc(id=uuid4(), project_id=test_project.id, name="Arc 2")
        arc3 = Arc(id=uuid4(), project_id=test_project.id, name="Arc 3")
        
        db.add_all([arc1, arc2, arc3])
        db.commit()
        
        # Calculate stats
        stats = analytics_service.calculate_arc_stats(db, test_project.id)
        
        # Verify stats
        assert stats.total_arcs == 3
    
    def test_calculate_timeline_stats(self, db: Session, test_project):
        """Test timeline statistics calculation."""
        from datetime import date
        
        # Create timeline events
        event1 = TimelineEvent(id=uuid4(), project_id=test_project.id, title="Event 1", date=date(2024, 1, 1))
        event2 = TimelineEvent(id=uuid4(), project_id=test_project.id, title="Event 2", date=date(2024, 6, 1))
        event3 = TimelineEvent(id=uuid4(), project_id=test_project.id, title="Event 3")  # No date
        
        db.add_all([event1, event2, event3])
        db.commit()
        
        # Calculate stats
        stats = analytics_service.calculate_timeline_stats(db, test_project.id)
        
        # Verify stats
        assert stats.total_events == 3
        assert stats.events_with_date == 2
        assert stats.events_without_date == 1
        assert stats.timeline_span_days > 0
    
    def test_generate_project_analytics(self, db: Session, test_project):
        """Test generating complete project analytics."""
        # Create some test data
        doc = Document(
            id=uuid4(),
            project_id=test_project.id,
            title="Test Doc",
            type=DocumentType.DRAFT,
            content_raw="Test content with words",
            order_index=0
        )
        db.add(doc)
        db.commit()
        
        # Generate analytics
        analytics = analytics_service.generate_project_analytics(db, test_project.id)
        
        # Verify analytics
        assert analytics.project_id == test_project.id
        assert analytics.word_count is not None
        assert analytics.writing_progress is not None
        assert analytics.entities is not None
        assert analytics.arcs is not None
        assert analytics.timeline is not None
