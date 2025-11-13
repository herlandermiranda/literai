"""
CRUD operations for Arc and ArcLink models.
"""
from typing import List
from sqlalchemy.orm import Session
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.arc import Arc, ArcLink
from app.schemas.arc import ArcCreate, ArcUpdate, ArcLinkCreate, ArcLinkUpdate


class CRUDArc(CRUDBase[Arc, ArcCreate, ArcUpdate]):
    """CRUD operations for Arc model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Arc]:
        """
        Get all arcs for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of arc instances
        """
        return (
            db.query(Arc)
            .filter(Arc.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_project(
        self, db: Session, *, obj_in: ArcCreate, project_id: UUID
    ) -> Arc:
        """
        Create a new arc for a project.
        
        Args:
            db: Database session
            obj_in: Arc creation schema
            project_id: Project ID
            
        Returns:
            Created arc instance
        """
        obj_in_data = obj_in.model_dump()
        db_obj = Arc(**obj_in_data, project_id=project_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDArcLink(CRUDBase[ArcLink, ArcLinkCreate, ArcLinkUpdate]):
    """CRUD operations for ArcLink model."""
    
    def get_by_arc(
        self, db: Session, *, arc_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[ArcLink]:
        """
        Get all links for an arc.
        
        Args:
            db: Database session
            arc_id: Arc ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of arc link instances
        """
        return (
            db.query(ArcLink)
            .filter(ArcLink.arc_id == arc_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_document(
        self, db: Session, *, document_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[ArcLink]:
        """
        Get all arc links for a document.
        
        Args:
            db: Database session
            document_id: Document ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of arc link instances
        """
        return (
            db.query(ArcLink)
            .filter(ArcLink.document_id == document_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


arc = CRUDArc(Arc)
arc_link = CRUDArcLink(ArcLink)
