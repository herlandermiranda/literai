"""
CRUD operations for Version model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.version import Version
from app.schemas.version import VersionCreate, VersionUpdate


class CRUDVersion(CRUDBase[Version, VersionCreate, VersionUpdate]):
    """CRUD operations for Version model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Version]:
        """
        Get all versions for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of versions
        """
        return (
            db.query(Version)
            .filter(Version.project_id == project_id)
            .order_by(Version.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_document(
        self, db: Session, *, document_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Version]:
        """
        Get all versions for a document.
        
        Args:
            db: Database session
            document_id: Document ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of versions
        """
        return (
            db.query(Version)
            .filter(Version.document_id == document_id)
            .order_by(Version.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_pyramid_node(
        self, db: Session, *, pyramid_node_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Version]:
        """
        Get all versions for a pyramid node.
        
        Args:
            db: Database session
            pyramid_node_id: Pyramid node ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of versions
        """
        return (
            db.query(Version)
            .filter(Version.pyramid_node_id == pyramid_node_id)
            .order_by(Version.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_latest(
        self, db: Session, *, document_id: Optional[UUID] = None, pyramid_node_id: Optional[UUID] = None
    ) -> Optional[Version]:
        """
        Get the latest version for a document or pyramid node.
        
        Args:
            db: Database session
            document_id: Document ID (optional)
            pyramid_node_id: Pyramid node ID (optional)
            
        Returns:
            Latest version or None
        """
        query = db.query(Version)
        
        if document_id:
            query = query.filter(Version.document_id == document_id)
        elif pyramid_node_id:
            query = query.filter(Version.pyramid_node_id == pyramid_node_id)
        else:
            return None
        
        return query.order_by(Version.created_at.desc()).first()


version = CRUDVersion(Version)
