"""
Tests for CRUD operations on Version - validates NC-005 fix.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.crud import version as crud_version
from app.schemas.version import VersionCreate


class TestCRUDVersion:
    """Test CRUD operations for Version."""
    
    def test_create_version(self, db: Session, test_project, test_document):
        """Test creating a version."""
        version_create = VersionCreate(
            project_id=test_project.id,
            document_id=test_document.id,
            commit_message="Initial commit",
            author_email="test@example.com",
            content_snapshot=test_document.content_raw
        )
        
        version = crud_version.create(db, obj_in=version_create)
        
        assert version is not None
        assert version.commit_message == "Initial commit"
        assert version.author_email == "test@example.com"
        assert version.content_snapshot == test_document.content_raw
    
    def test_get_by_project(self, db: Session, test_project, test_document):
        """Test getting all versions for a project."""
        # Create multiple versions
        for i in range(3):
            version_create = VersionCreate(
                project_id=test_project.id,
                document_id=test_document.id,
                commit_message=f"Commit {i}",
                author_email="test@example.com",
                content_snapshot=f"Content {i}"
            )
            crud_version.create(db, obj_in=version_create)
        
        versions = crud_version.get_by_project(db, project_id=test_project.id)
        
        assert len(versions) >= 3
    
    def test_get_by_document(self, db: Session, test_project, test_document):
        """NC-005: Test getting all versions for a document."""
        # Create versions for document
        for i in range(2):
            version_create = VersionCreate(
                project_id=test_project.id,
                document_id=test_document.id,
                commit_message=f"Doc version {i}",
                author_email="test@example.com",
                content_snapshot=f"Content {i}"
            )
            crud_version.create(db, obj_in=version_create)
        
        versions = crud_version.get_by_document(db, document_id=test_document.id)
        
        # NC-005: Verify versions relationship works
        assert len(versions) == 2
        assert all(v.document_id == test_document.id for v in versions)
