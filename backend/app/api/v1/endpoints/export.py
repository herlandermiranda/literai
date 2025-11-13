"""
Export endpoints for generating various export formats.
"""
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from uuid import UUID

from app.core import deps
from app.schemas.export import SimpleExportRequest, CSVExportRequest
from app.services.export_service import export_service

router = APIRouter()


@router.post("/markdown")
def export_to_markdown(
    request: SimpleExportRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export project to Markdown format."""
    markdown_content = export_service.export_to_markdown(
        db,
        project_id=request.project_id,
        document_ids=request.document_ids
    )
    
    return Response(
        content=markdown_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=export.md"}
    )


@router.post("/pdf")
def export_to_pdf(
    request: SimpleExportRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export project to PDF format."""
    pdf_content = export_service.export_to_pdf(
        db,
        project_id=request.project_id,
        document_ids=request.document_ids
    )
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=export.pdf"}
    )


@router.post("/docx")
def export_to_docx(
    request: SimpleExportRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export project to DOCX format."""
    docx_content = export_service.export_to_docx(
        db,
        project_id=request.project_id,
        document_ids=request.document_ids
    )
    
    return Response(
        content=docx_content,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=export.docx"}
    )


@router.post("/epub")
def export_to_epub(
    request: SimpleExportRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export project to EPUB format."""
    epub_content = export_service.export_to_epub(
        db,
        project_id=request.project_id,
        document_ids=request.document_ids
    )
    
    return Response(
        content=epub_content,
        media_type="application/epub+zip",
        headers={"Content-Disposition": f"attachment; filename=export.epub"}
    )


@router.post("/csv")
def export_to_csv(
    request: CSVExportRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export entities, timeline, or arcs to CSV format."""
    if request.export_type == "entities":
        csv_content = export_service.export_entities_to_csv(db, project_id=request.project_id)
        filename = "entities.csv"
    elif request.export_type == "timeline":
        csv_content = export_service.export_timeline_to_csv(db, project_id=request.project_id)
        filename = "timeline.csv"
    elif request.export_type == "arcs":
        csv_content = export_service.export_arcs_to_csv(db, project_id=request.project_id)
        filename = "arcs.csv"
    else:
        return Response(status_code=400, content="Invalid export_type")
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
