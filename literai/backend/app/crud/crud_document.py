"""
CRUD operations for Document model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate


class CRUDDocument(CRUDBase[Document, DocumentCreate, DocumentUpdate]):
    """CRUD operations for Document model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Document]:
        """
        Get all documents for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of document instances
        """
        return (
            db.query(Document)
            .filter(Document.project_id == project_id)
            .order_by(Document.order_index)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_project(
        self, db: Session, *, obj_in: DocumentCreate, project_id: UUID
    ) -> Document:
        """
        Create a new document for a project.
        
        Args:
            db: Database session
            obj_in: Document creation schema
            project_id: Project ID
            
        Returns:
            Created document instance
        """
        obj_in_data = obj_in.model_dump()
        db_obj = Document(**obj_in_data, project_id=project_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def reorder(
        self, db: Session, *, document_id: UUID, new_order_index: int
    ) -> Optional[Document]:
        """
        Reorder a document.
        
        Args:
            db: Database session
            document_id: Document ID
            new_order_index: New order index
            
        Returns:
            Updated document instance or None if not found
        """
        document = self.get(db, id=document_id)
        if document:
            document.order_index = new_order_index
            db.add(document)
            db.commit()
            db.refresh(document)
        return document


document = CRUDDocument(Document)
