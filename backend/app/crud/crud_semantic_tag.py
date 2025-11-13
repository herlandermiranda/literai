"""
CRUD operations for Tag and EntityResolution models.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.semantic_tag import Tag, EntityResolution, TagType
from app.schemas.semantic_tag import TagCreate, TagUpdate, EntityResolutionCreate, EntityResolutionUpdate


class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate]):
    """CRUD operations for Tag model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 1000
    ) -> List[Tag]:
        """Get all tags for a project."""
        return (
            db.query(Tag)
            .filter(Tag.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_document(
        self, db: Session, *, document_id: UUID
    ) -> List[Tag]:
        """Get all tags for a document."""
        return (
            db.query(Tag)
            .filter(Tag.document_id == document_id)
            .order_by(Tag.start_position)
            .all()
        )
    
    def get_by_type(
        self, db: Session, *, project_id: UUID, tag_type: TagType
    ) -> List[Tag]:
        """Get all tags of a specific type in a project."""
        return (
            db.query(Tag)
            .filter(
                Tag.project_id == project_id,
                Tag.tag_type == tag_type
            )
            .all()
        )
    
    def get_unresolved(
        self, db: Session, *, project_id: UUID
    ) -> List[Tag]:
        """Get all unresolved tags in a project."""
        return (
            db.query(Tag)
            .filter(
                Tag.project_id == project_id,
                Tag.resolved_entity_id.is_(None)
            )
            .all()
        )


class CRUDEntityResolution(CRUDBase[EntityResolution, EntityResolutionCreate, EntityResolutionUpdate]):
    """CRUD operations for EntityResolution model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID
    ) -> List[EntityResolution]:
        """Get all entity resolutions for a project."""
        return (
            db.query(EntityResolution)
            .filter(EntityResolution.project_id == project_id)
            .all()
        )
    
    def get_by_tag_name(
        self, db: Session, *, project_id: UUID, tag_name: str
    ) -> Optional[EntityResolution]:
        """Get entity resolution for a specific tag name."""
        return (
            db.query(EntityResolution)
            .filter(
                EntityResolution.project_id == project_id,
                EntityResolution.tag_name == tag_name
            )
            .first()
        )
    
    def get_by_entity(
        self, db: Session, *, entity_id: UUID
    ) -> List[EntityResolution]:
        """Get all resolutions pointing to a specific entity."""
        return (
            db.query(EntityResolution)
            .filter(EntityResolution.entity_id == entity_id)
            .all()
        )


tag = CRUDTag(Tag)
entity_resolution = CRUDEntityResolution(EntityResolution)
