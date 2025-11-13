"""
CRUD operations for TagInstance model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.tag_instance import TagInstance
from app.schemas.tag_instance import TagInstanceCreate, TagInstanceUpdate


class CRUDTagInstance(CRUDBase[TagInstance, TagInstanceCreate, TagInstanceUpdate]):
    """CRUD operations for TagInstance model."""
    
    def get_by_document(
        self, db: Session, *, document_id: UUID, skip: int = 0, limit: int = 1000
    ) -> List[TagInstance]:
        """
        Get all tag instances for a document.
        
        Args:
            db: Database session
            document_id: Document ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of tag instance instances
        """
        return (
            db.query(TagInstance)
            .filter(TagInstance.document_id == document_id)
            .order_by(TagInstance.start_offset)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_entity(
        self, db: Session, *, entity_id: UUID, skip: int = 0, limit: int = 1000
    ) -> List[TagInstance]:
        """
        Get all tag instances for an entity.
        
        Args:
            db: Database session
            entity_id: Entity ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of tag instance instances
        """
        return (
            db.query(TagInstance)
            .filter(TagInstance.entity_id == entity_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_type(
        self, db: Session, *, document_id: UUID, tag_type: str, skip: int = 0, limit: int = 1000
    ) -> List[TagInstance]:
        """
        Get all tag instances of a specific type for a document.
        
        Args:
            db: Database session
            document_id: Document ID
            tag_type: Tag type
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of tag instance instances
        """
        return (
            db.query(TagInstance)
            .filter(TagInstance.document_id == document_id, TagInstance.type == tag_type)
            .order_by(TagInstance.start_offset)
            .offset(skip)
            .limit(limit)
            .all()
        )


tag_instance = CRUDTagInstance(TagInstance)
