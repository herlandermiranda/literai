"""
CRUD operations for TimelineEvent and TimelineLink models.
"""
from typing import List
from sqlalchemy.orm import Session
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.timeline import TimelineEvent, TimelineLink
from app.schemas.timeline import TimelineEventCreate, TimelineEventUpdate, TimelineLinkCreate, TimelineLinkUpdate


class CRUDTimelineEvent(CRUDBase[TimelineEvent, TimelineEventCreate, TimelineEventUpdate]):
    """CRUD operations for TimelineEvent model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[TimelineEvent]:
        """
        Get all timeline events for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of timeline event instances
        """
        return (
            db.query(TimelineEvent)
            .filter(TimelineEvent.project_id == project_id)
            .order_by(TimelineEvent.order_index)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_project(
        self, db: Session, *, obj_in: TimelineEventCreate, project_id: UUID
    ) -> TimelineEvent:
        """
        Create a new timeline event for a project.
        
        Args:
            db: Database session
            obj_in: Timeline event creation schema
            project_id: Project ID
            
        Returns:
            Created timeline event instance
        """
        obj_in_data = obj_in.model_dump()
        db_obj = TimelineEvent(**obj_in_data, project_id=project_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDTimelineLink(CRUDBase[TimelineLink, TimelineLinkCreate, TimelineLinkUpdate]):
    """CRUD operations for TimelineLink model."""
    
    def get_by_event(
        self, db: Session, *, timeline_event_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[TimelineLink]:
        """
        Get all links for a timeline event.
        
        Args:
            db: Database session
            timeline_event_id: Timeline event ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of timeline link instances
        """
        return (
            db.query(TimelineLink)
            .filter(TimelineLink.timeline_event_id == timeline_event_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_document(
        self, db: Session, *, document_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[TimelineLink]:
        """
        Get all timeline links for a document.
        
        Args:
            db: Database session
            document_id: Document ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of timeline link instances
        """
        return (
            db.query(TimelineLink)
            .filter(TimelineLink.document_id == document_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


timeline_event = CRUDTimelineEvent(TimelineEvent)
timeline_link = CRUDTimelineLink(TimelineLink)
