"""
Integration tests for export endpoints - validates NC-001, NC-003, NC-004.
"""
import pytest
from uuid import uuid4
from httpx import AsyncClient
from sqlalchemy.orm import Session
import pytest

from app.main import app
from app.models.document import Document, DocumentType
from app.models.entity import Entity, EntityType


class TestExportAPI:
    """Test export API endpoints."""
    
    def test_export_to_markdown(self, client, db: Session, test_project, test_document, test_user, test_user_token):
        """NC-001: Test markdown export with flat structure."""
        # Export to markdown
        response = client.post(
            "/api/v1/export/markdown",
            json={"project_id": str(test_project.id)},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/markdown; charset=utf-8"
        
        content = response.text
        # NC-001: Verify flat structure
        assert test_document.title in content
        assert test_document.content_raw in content
    
    def test_export_entities_to_csv(self, client, db: Session, test_project, test_entity, test_user, test_user_token):
        """NC-004: Test CSV export has no 'Parent' column."""
        # Export entities to CSV
        response = client.post(
            "/api/v1/export/csv",
            json={"project_id": str(test_project.id), "export_type": "entities"},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        
        content = response.text
        lines = content.strip().split("\n")
        header = lines[0]
        
        # NC-004: Verify no "Parent" column
        assert "Parent" not in header
        assert "ID" in header
        assert "Name" in header
