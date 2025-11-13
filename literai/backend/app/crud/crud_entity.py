"""
CRUD operations for Entity model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.entity import Entity, EntityType
from app.schemas.entity import EntityCreate, EntityUpdate


class CRUDEntity(CRUDBase[Entity, EntityCreate, EntityUpdate]):
    """CRUD operations for Entity model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Entity]:
        """
        Get all entities for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of entity instances
        """
        return (
            db.query(Entity)
            .filter(Entity.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_project_and_type(
        self, db: Session, *, project_id: UUID, entity_type: EntityType, skip: int = 0, limit: int = 100
    ) -> List[Entity]:
        """
        Get all entities of a specific type for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            entity_type: Entity type
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of entity instances
        """
        return (
            db.query(Entity)
            .filter(Entity.project_id == project_id, Entity.type == entity_type)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_slug(
        self, db: Session, *, project_id: UUID, slug: str
    ) -> Optional[Entity]:
        """
        Get entity by slug within a project.
        
        Args:
            db: Database session
            project_id: Project ID
            slug: Entity slug
            
        Returns:
            Entity instance or None if not found
        """
        return (
            db.query(Entity)
            .filter(Entity.project_id == project_id, Entity.slug == slug)
            .first()
        )
    
    def create_with_project(
        self, db: Session, *, obj_in: EntityCreate, project_id: UUID
    ) -> Entity:
        """
        Create a new entity for a project.
        
        Args:
            db: Database session
            obj_in: Entity creation schema
            project_id: Project ID
            
        Returns:
            Created entity instance
        """
        obj_in_data = obj_in.model_dump()
        db_obj = Entity(**obj_in_data, project_id=project_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


entity = CRUDEntity(Entity)
