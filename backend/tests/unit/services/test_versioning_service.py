"""
Tests for versioning_service - Git-like version control.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.services.versioning_service import versioning_service
from app.models.document import Document, DocumentType
from app.models.pyramid_node import PyramidNode


class TestVersioningService:
    """Test versioning service functionality."""
    
    def test_create_version_for_document(self, db: Session, test_project, test_user, test_document):
        """Test creating a version for a document."""
        # Create version
        version = versioning_service.create_version(
            db,
            project_id=test_project.id,
            author_email=test_user.email,
            commit_message="Initial commit",
            document_id=test_document.id
        )
        
        # Verify version
        assert version is not None
        assert version.project_id == test_project.id
        assert version.document_id == test_document.id
        assert version.commit_message == "Initial commit"
        assert version.author_email == test_user.email
        assert version.content_snapshot == test_document.content_raw
    
    def test_create_version_for_pyramid_node(self, db: Session, test_project, test_user):
        """Test creating a version for a pyramid node."""
        # Create pyramid node
        node = PyramidNode(
            id=uuid4(),
            project_id=test_project.id,
            title="Chapter Outline",
            content="Detailed chapter outline content",
            level=0,
            order=0
        )
        db.add(node)
        db.commit()
        
        # Create version
        version = versioning_service.create_version(
            db,
            project_id=test_project.id,
            author_email=test_user.email,
            commit_message="Pyramid node created",
            pyramid_node_id=node.id
        )
        
        # Verify version
        assert version is not None
        assert version.pyramid_node_id == node.id
        assert version.content_snapshot == node.content
    
    def test_version_diff(self, db: Session, test_project, test_user, test_document):
        """Test getting diff between two versions."""
        # Create first version
        version1 = versioning_service.create_version(
            db,
            project_id=test_project.id,
            author_email=test_user.email,
            commit_message="Version 1",
            document_id=test_document.id
        )
        
        # Modify document
        test_document.content_raw = "Modified content with changes."
        db.commit()
        
        # Create second version
        version2 = versioning_service.create_version(
            db,
            project_id=test_project.id,
            author_email=test_user.email,
            commit_message="Version 2",
            document_id=test_document.id
        )
        
        # Get diff
        diff = versioning_service.get_version_diff(
            db,
            version_a_id=version1.id,
            version_b_id=version2.id
        )
        
        # Verify diff
        assert diff is not None
        assert diff.version_a_id == version1.id
        assert diff.version_b_id == version2.id
        assert len(diff.diff_text) > 0
    
    def test_restore_version(self, db: Session, test_project, test_user, test_document):
        """Test restoring content from a version."""
        original_content = test_document.content_raw
        
        # Create version
        version = versioning_service.create_version(
            db,
            project_id=test_project.id,
            author_email=test_user.email,
            commit_message="Backup",
            document_id=test_document.id
        )
        
        # Modify document
        test_document.content_raw = "Different content"
        db.commit()
        
        # Restore version
        restored = versioning_service.restore_version(
            db,
            version_id=version.id,
            author_email=test_user.email,
            create_new_version=False
        )
        
        # Verify restoration
        assert restored is not None
        assert restored.content_raw == original_content
    
    def test_get_version_history(self, db: Session, test_project, test_user, test_document):
        """Test getting version history for a document."""
        # Create multiple versions
        for i in range(3):
            versioning_service.create_version(
                db,
                project_id=test_project.id,
                author_email=test_user.email,
                commit_message=f"Version {i+1}",
                document_id=test_document.id
            )
        
        # Get history
        history = versioning_service.get_version_history(
            db,
            document_id=test_document.id
        )
        
        # Verify history
        assert len(history) == 3
        assert history[0].commit_message == "Version 3"  # Most recent first
        assert history[2].commit_message == "Version 1"
