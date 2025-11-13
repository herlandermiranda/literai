"""
Export service for generating various export formats.

NC-001 FIX: Structure hiérarchique supprimée - export plat uniquement
NC-003 FIX: Utilise rewrite_text() au lieu de _call_llm()
NC-004 FIX: Colonne "Parent" supprimée du CSV
"""
import io
import csv
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.document import Document
from app.models.entity import Entity
from app.models.timeline import TimelineEvent
from app.models.arc import Arc
from app.crud import document as crud_document, entity as crud_entity, timeline_event as crud_timeline, arc as crud_arc
from app.services.llm_service import get_llm_service


class ExportService:
    """Service for exporting project data in various formats."""
    
    @staticmethod
    def export_to_markdown(db: Session, project_id: UUID, document_ids: Optional[List[UUID]] = None) -> str:
        """
        Export documents to Markdown format.
        
        Args:
            db: Database session
            project_id: Project ID
            document_ids: Optional list of specific document IDs to export
            
        Returns:
            Markdown string
        """
        # NC-001 FIX: Structure plate uniquement, pas de hiérarchie
        if document_ids:
            documents = [db.query(Document).filter(Document.id == doc_id).first() for doc_id in document_ids]
            documents = [doc for doc in documents if doc]  # Filter out None
        else:
            documents = crud_document.get_by_project(db, project_id=project_id)
        
        markdown_parts = []
        for doc in documents:
            markdown_parts.append(f"# {doc.title}\n\n")
            markdown_parts.append(f"{doc.content_raw}\n\n")
            markdown_parts.append("---\n\n")
        
        return "".join(markdown_parts)
    
    @staticmethod
    def export_to_pdf(db: Session, project_id: UUID, document_ids: Optional[List[UUID]] = None) -> bytes:
        """
        Export documents to PDF format.
        
        Args:
            db: Database session
            project_id: Project ID
            document_ids: Optional list of specific document IDs to export
            
        Returns:
            PDF bytes
        """
        # For now, return a placeholder
        # In production, use a library like ReportLab or WeasyPrint
        markdown_content = ExportService.export_to_markdown(db, project_id, document_ids)
        return markdown_content.encode('utf-8')
    
    @staticmethod
    def export_to_docx(db: Session, project_id: UUID, document_ids: Optional[List[UUID]] = None) -> bytes:
        """
        Export documents to DOCX format.
        
        Args:
            db: Database session
            project_id: Project ID
            document_ids: Optional list of specific document IDs to export
            
        Returns:
            DOCX bytes
        """
        # For now, return a placeholder
        # In production, use python-docx library
        markdown_content = ExportService.export_to_markdown(db, project_id, document_ids)
        return markdown_content.encode('utf-8')
    
    @staticmethod
    def export_to_epub(db: Session, project_id: UUID, document_ids: Optional[List[UUID]] = None) -> bytes:
        """
        Export documents to EPUB format.
        
        Args:
            db: Database session
            project_id: Project ID
            document_ids: Optional list of specific document IDs to export
            
        Returns:
            EPUB bytes
        """
        # For now, return a placeholder
        # In production, use ebooklib library
        markdown_content = ExportService.export_to_markdown(db, project_id, document_ids)
        return markdown_content.encode('utf-8')
    
    @staticmethod
    def export_entities_to_csv(db: Session, project_id: UUID) -> str:
        """
        Export entities to CSV format.
        
        NC-004 FIX: Colonne "Parent" supprimée
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            CSV string
        """
        entities = crud_entity.get_by_project(db, project_id=project_id)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # NC-004 FIX: Pas de colonne "Parent"
        writer.writerow(["ID", "Name", "Type", "Description", "Created At"])
        
        for entity in entities:
            writer.writerow([
                str(entity.id),
                entity.name,
                entity.type.value,
                entity.summary or "",
                entity.created_at.isoformat()
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_timeline_to_csv(db: Session, project_id: UUID) -> str:
        """
        Export timeline events to CSV format.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            CSV string
        """
        events = crud_timeline.get_by_project(db, project_id=project_id)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["ID", "Title", "Description", "Date", "Created At"])
        
        for event in events:
            writer.writerow([
                str(event.id),
                event.title,
                event.description or "",
                event.date.isoformat() if event.date else "",
                event.created_at.isoformat()
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_arcs_to_csv(db: Session, project_id: UUID) -> str:
        """
        Export arcs to CSV format.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            CSV string
        """
        arcs = crud_arc.get_by_project(db, project_id=project_id)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["ID", "Name", "Description", "Created At"])
        
        for arc in arcs:
            writer.writerow([
                str(arc.id),
                arc.name,
                arc.description or "",
                arc.created_at.isoformat()
            ])
        
        return output.getvalue()
    
    @staticmethod
    def enhance_text_for_export(db: Session, text: str, project_id: UUID, user_id: UUID, style: str = "formal") -> str:
        """
        Enhance text using LLM before export.
        
        NC-003 FIX: Utilise rewrite_text() au lieu de _call_llm()
        
        Args:
            db: Database session
            text: Original text
            project_id: Project ID
            user_id: User ID
            style: Style for enhancement (formal, casual, literary)
            
        Returns:
            Enhanced text
        """
        # NC-003 FIX: Utilise le service LLM correctement
        llm_service = get_llm_service(db, user_id)
        result = llm_service.rewrite_text(
            project_id=project_id,
            text_to_rewrite=text,
            rewriting_goals=f"Enhance for {style} publication",
            user_instructions="Fix grammar and improve flow."
        )
        return result.get("rewritten_text", text)


export_service = ExportService()
