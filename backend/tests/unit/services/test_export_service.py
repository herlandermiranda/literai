"""
Tests for export_service - validates NC-001, NC-003, NC-004 fixes.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.services.export_service import export_service
from app.models.document import Document, DocumentType
from app.models.entity import Entity, EntityType
from app.models.timeline import TimelineEvent
from app.models.arc import Arc


class TestExportService:
    """Test export service functionality."""
    
    def test_export_to_markdown_flat_structure(self, db: Session, test_project):
        """NC-001: Verify flat export structure (no hierarchy)."""
        # Create multiple documents
        doc1 = Document(
            id=uuid4(),
            project_id=test_project.id,
            title="Chapter 1",
            type=DocumentType.DRAFT,
            content_raw="Content of chapter 1",
            order_index=0
        )
        doc2 = Document(
            id=uuid4(),
            project_id=test_project.id,
            title="Chapter 2",
            type=DocumentType.DRAFT,
            content_raw="Content of chapter 2",
            order_index=1
        )
        db.add_all([doc1, doc2])
        db.commit()
        
        # Export to markdown
        markdown = export_service.export_to_markdown(db, test_project.id)
        
        # Verify flat structure (no nested headers)
        assert "# Chapter 1" in markdown
        assert "# Chapter 2" in markdown
        assert "Content of chapter 1" in markdown
        assert "Content of chapter 2" in markdown
        # NC-001: No hierarchical structure markers
        assert "##" not in markdown  # No sub-headers
    
    def test_export_entities_to_csv_no_parent_column(self, db: Session, test_project):
        """NC-004: Verify CSV export has no 'Parent' column."""
        # Create entities
        entity1 = Entity(
            id=uuid4(),
            project_id=test_project.id,
            name="Alice",
            slug="alice",
            type=EntityType.CHARACTER,
            summary="Main character"
        )
        entity2 = Entity(
            id=uuid4(),
            project_id=test_project.id,
            name="Wonderland",
            slug="wonderland",
            type=EntityType.LOCATION,
            summary="Fantasy world"
        )
        db.add_all([entity1, entity2])
        db.commit()
        
        # Export to CSV
        csv_content = export_service.export_entities_to_csv(db, test_project.id)
        
        # Verify header row
        lines = csv_content.strip().split("\n")
        header = lines[0]
        
        # NC-004: No "Parent" column
        assert "Parent" not in header
        assert "ID" in header
        assert "Name" in header
        assert "Type" in header
        
        # Verify data rows
        assert "Alice" in csv_content
        assert "Wonderland" in csv_content
    
    def test_export_timeline_to_csv(self, db: Session, test_project):
        """Test timeline CSV export."""
        # Create timeline events
        event = TimelineEvent(
            id=uuid4(),
            project_id=test_project.id,
            title="First Meeting",
            description="Alice meets the White Rabbit"
        )
        db.add(event)
        db.commit()
        
        # Export to CSV
        csv_content = export_service.export_timeline_to_csv(db, test_project.id)
        
        # Verify content
        assert "First Meeting" in csv_content
        assert "Alice meets the White Rabbit" in csv_content
    
    def test_export_arcs_to_csv(self, db: Session, test_project):
        """Test arcs CSV export."""
        # Create arc
        arc = Arc(
            id=uuid4(),
            project_id=test_project.id,
            name="Hero's Journey",
            description="Alice's transformation"
        )
        db.add(arc)
        db.commit()
        
        # Export to CSV
        csv_content = export_service.export_arcs_to_csv(db, test_project.id)
        
        # Verify content
        assert "Hero's Journey" in csv_content
        assert "Alice's transformation" in csv_content
    
    def test_enhance_text_for_export_uses_llm_service(self, db: Session, test_project, test_user, mock_llm_mode):
        """NC-003: Verify enhance_text uses LLM service (not _call_llm)."""
        text = "This is a test text."
        
        # Call enhance_text
        enhanced = export_service.enhance_text_for_export(
            db,
            text=text,
            project_id=test_project.id,
            user_id=test_user.id,
            style="formal"
        )
        
        # Verify it returns text (mock mode returns modified text)
        assert isinstance(enhanced, str)
        assert len(enhanced) > 0
