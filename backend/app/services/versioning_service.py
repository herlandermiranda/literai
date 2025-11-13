"""
Versioning service for Git-like version control.
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
import difflib
import json

from app.models.version import Version
from app.models.document import Document
from app.models.pyramid_node import PyramidNode
from app.crud import version as crud_version
from app.schemas.version import VersionCreate, VersionDiff


class VersioningService:
    """Service for managing Git-like versioning."""
    
    @staticmethod
    def create_version(
        db: Session,
        *,
        project_id: UUID,
        author_email: str,
        commit_message: str,
        document_id: Optional[UUID] = None,
        pyramid_node_id: Optional[UUID] = None,
        metadata: Optional[dict] = None
    ) -> Version:
        """
        Create a new version (commit) for a document or pyramid node.
        
        Args:
            db: Database session
            project_id: Project ID
            author_email: Email of the user creating the version
            commit_message: Commit message
            document_id: Document ID (optional)
            pyramid_node_id: Pyramid node ID (optional)
            metadata: Additional metadata (optional)
            
        Returns:
            Created version
        """
        # Get content snapshot
        content_snapshot = ""
        if document_id:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                content_snapshot = document.content_raw or ""
        elif pyramid_node_id:
            pyramid_node = db.query(PyramidNode).filter(PyramidNode.id == pyramid_node_id).first()
            if pyramid_node:
                content_snapshot = pyramid_node.content
        
        # Get parent version (latest version)
        parent_version = crud_version.get_latest(
            db,
            document_id=document_id,
            pyramid_node_id=pyramid_node_id
        )
        
        # Create version
        version_create = VersionCreate(
            project_id=project_id,
            document_id=document_id,
            pyramid_node_id=pyramid_node_id,
            commit_message=commit_message,
            author_email=author_email,
            content_snapshot=content_snapshot,
            metadata_snapshot=json.dumps(metadata) if metadata else None,
            parent_version_id=parent_version.id if parent_version else None
        )
        
        return crud_version.create(db, obj_in=version_create)
    
    @staticmethod
    def get_version_diff(
        db: Session,
        *,
        version_a_id: UUID,
        version_b_id: UUID
    ) -> VersionDiff:
        """
        Get diff between two versions.
        
        Args:
            db: Database session
            version_a_id: First version ID
            version_b_id: Second version ID
            
        Returns:
            Version diff
        """
        version_a = crud_version.get(db, id=version_a_id)
        version_b = crud_version.get(db, id=version_b_id)
        
        if not version_a or not version_b:
            raise ValueError("One or both versions not found")
        
        # Generate diff
        diff = difflib.unified_diff(
            version_a.content_snapshot.splitlines(keepends=True),
            version_b.content_snapshot.splitlines(keepends=True),
            fromfile=f"Version {version_a_id}",
            tofile=f"Version {version_b_id}"
        )
        
        diff_text = "".join(diff)
        
        # Count additions and deletions
        additions = diff_text.count("\n+") - 1  # -1 for the +++ line
        deletions = diff_text.count("\n-") - 1  # -1 for the --- line
        
        return VersionDiff(
            version_a_id=version_a_id,
            version_b_id=version_b_id,
            diff_text=diff_text,
            additions=max(0, additions),
            deletions=max(0, deletions)
        )
    
    @staticmethod
    def restore_version(
        db: Session,
        *,
        version_id: UUID,
        author_email: str,
        create_new_version: bool = True
    ) -> Optional[Document | PyramidNode]:
        """
        Restore content from a version.
        
        Args:
            db: Database session
            version_id: Version ID to restore
            author_email: Email of the user restoring
            create_new_version: Whether to create a new version after restoring
            
        Returns:
            Updated document or pyramid node
        """
        version = crud_version.get(db, id=version_id)
        if not version:
            return None
        
        # Restore to document or pyramid node
        if version.document_id:
            document = db.query(Document).filter(Document.id == version.document_id).first()
            if document:
                document.content_raw = version.content_snapshot
                db.add(document)
                db.commit()
                db.refresh(document)
                
                # Create new version if requested
                if create_new_version:
                    VersioningService.create_version(
                        db,
                        project_id=version.project_id,
                        author_email=author_email,
                        commit_message=f"Restored from version {version_id}",
                        document_id=document.id
                    )
                
                return document
        
        elif version.pyramid_node_id:
            pyramid_node = db.query(PyramidNode).filter(PyramidNode.id == version.pyramid_node_id).first()
            if pyramid_node:
                pyramid_node.content = version.content_snapshot
                db.add(pyramid_node)
                db.commit()
                db.refresh(pyramid_node)
                
                # Create new version if requested
                if create_new_version:
                    VersioningService.create_version(
                        db,
                        project_id=version.project_id,
                        author_email=author_email,
                        commit_message=f"Restored from version {version_id}",
                        pyramid_node_id=pyramid_node.id
                    )
                
                return pyramid_node
        
        return None
    
    @staticmethod
    def get_version_history(
        db: Session,
        *,
        document_id: Optional[UUID] = None,
        pyramid_node_id: Optional[UUID] = None,
        limit: int = 50
    ) -> List[Version]:
        """
        Get version history for a document or pyramid node.
        
        Args:
            db: Database session
            document_id: Document ID (optional)
            pyramid_node_id: Pyramid node ID (optional)
            limit: Maximum number of versions to return
            
        Returns:
            List of versions
        """
        if document_id:
            return crud_version.get_by_document(db, document_id=document_id, limit=limit)
        elif pyramid_node_id:
            return crud_version.get_by_pyramid_node(db, pyramid_node_id=pyramid_node_id, limit=limit)
        else:
            return []


versioning_service = VersioningService()
