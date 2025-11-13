"""
Tag instance endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.deps import get_db, get_current_user
from app.crud.crud_tag_instance import tag_instance as tag_instance_crud
from app.crud.crud_document import document as document_crud
from app.crud.crud_project import project as project_crud
from app.models.user import User
from app.schemas.tag_instance import TagInstance, TagInstanceCreate, TagInstanceUpdate

router = APIRouter()


@router.get("/", response_model=List[TagInstance])
def get_tag_instances(
    document_id: Optional[UUID] = Query(None),
    entity_id: Optional[UUID] = Query(None),
    tag_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 1000,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get tag instances filtered by document, entity, or type.
    
    Args:
        document_id: Optional document ID filter
        entity_id: Optional entity ID filter
        tag_type: Optional tag type filter
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of tag instances
        
    Raises:
        HTTPException: If document not found or user doesn't have access
    """
    if document_id:
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
        
        if tag_type:
            tags = tag_instance_crud.get_by_type(
                db, document_id=document_id, tag_type=tag_type, skip=skip, limit=limit
            )
        else:
            tags = tag_instance_crud.get_by_document(db, document_id=document_id, skip=skip, limit=limit)
    
    elif entity_id:
        tags = tag_instance_crud.get_by_entity(db, entity_id=entity_id, skip=skip, limit=limit)
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either document_id or entity_id must be provided"
        )
    
    return tags


@router.get("/{tag_id}", response_model=TagInstance)
def get_tag_instance(
    tag_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific tag instance.
    
    Args:
        tag_id: Tag instance ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Tag instance
        
    Raises:
        HTTPException: If tag not found or user doesn't have access
    """
    tag = tag_instance_crud.get(db, id=tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag instance not found"
        )
    
    # Verify project ownership through document
    document = document_crud.get(db, id=tag.document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    project = project_crud.get(db, id=document.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return tag


@router.post("/", response_model=TagInstance, status_code=status.HTTP_201_CREATED)
def create_tag_instance(
    tag_in: TagInstanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new tag instance.
    
    Args:
        tag_in: Tag instance creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created tag instance
        
    Raises:
        HTTPException: If document not found or user doesn't have access
    """
    document = document_crud.get(db, id=tag_in.document_id)
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
    
    tag = tag_instance_crud.create(db, obj_in=tag_in)
    return tag


@router.put("/{tag_id}", response_model=TagInstance)
def update_tag_instance(
    tag_id: UUID,
    tag_in: TagInstanceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a tag instance.
    
    Args:
        tag_id: Tag instance ID
        tag_in: Tag instance update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated tag instance
        
    Raises:
        HTTPException: If tag not found or user doesn't have access
    """
    tag = tag_instance_crud.get(db, id=tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag instance not found"
        )
    
    # Verify project ownership through document
    document = document_crud.get(db, id=tag.document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    project = project_crud.get(db, id=document.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    tag = tag_instance_crud.update(db, db_obj=tag, obj_in=tag_in)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag_instance(
    tag_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a tag instance.
    
    Args:
        tag_id: Tag instance ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If tag not found or user doesn't have access
    """
    tag = tag_instance_crud.get(db, id=tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag instance not found"
        )
    
    # Verify project ownership through document
    document = document_crud.get(db, id=tag.document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    project = project_crud.get(db, id=document.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    tag_instance_crud.delete(db, id=tag_id)
