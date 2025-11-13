"""
Document endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.deps import get_db, get_current_user
from app.crud.crud_document import document as document_crud
from app.crud.crud_project import project as project_crud
from app.models.user import User
from app.schemas.document import Document, DocumentCreate, DocumentUpdate

router = APIRouter()


@router.get("/", response_model=List[Document])
def get_documents(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all documents for a project.
    
    Args:
        project_id: Project ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of documents
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    # Verify project ownership
    project = project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    documents = document_crud.get_by_project(db, project_id=project_id, skip=skip, limit=limit)
    return documents


@router.get("/{document_id}", response_model=Document)
def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific document.
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document
        
    Raises:
        HTTPException: If document not found or user doesn't have access
    """
    document = document_crud.get(db, id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=document.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return document


@router.post("/", response_model=Document, status_code=status.HTTP_201_CREATED)
def create_document(
    project_id: UUID,
    document_in: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new document.
    
    Args:
        project_id: Project ID
        document_in: Document creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created document
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    # Verify project ownership
    project = project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    document = document_crud.create_with_project(db, obj_in=document_in, project_id=project_id)
    
    # Create automatic initial version
    from app.crud import version as version_crud
    from app.schemas.version import VersionCreate
    
    version_in = VersionCreate(
        project_id=project_id,
        document_id=document.id,
        commit_message="Initial version: Created document",
        author_email=current_user.email,
        content_snapshot=document.content_raw,
        metadata_snapshot=None
    )
    version_crud.create(db, obj_in=version_in)
    
    return document


@router.put("/{document_id}", response_model=Document)
def update_document(
    document_id: UUID,
    document_in: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a document.
    
    Args:
        document_id: Document ID
        document_in: Document update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated document
        
    Raises:
        HTTPException: If document not found or user doesn't have access
    """
    document = document_crud.get(db, id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=document.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Store old content for versioning
    old_content = document.content_raw
    
    # Map 'content' field to 'content_raw' for frontend compatibility
    if document_in.content is not None:
        document_in.content_raw = document_in.content
    
    # Update the document
    document = document_crud.update(db, db_obj=document, obj_in=document_in)
    
    # Create automatic version if content changed
    if document.content_raw != old_content:
        from app.crud import version as version_crud
        from app.schemas.version import VersionCreate
        
        version_in = VersionCreate(
            project_id=document.project_id,
            document_id=document_id,
            commit_message="Auto-save: Updated document",
            author_email=current_user.email,
            content_snapshot=document.content_raw,
            metadata_snapshot=None
        )
        version_crud.create(db, obj_in=version_in)
    
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document.
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If document not found or user doesn't have access
    """
    document = document_crud.get(db, id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=document.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    document_crud.delete(db, id=document_id)
