"""
Arc endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.deps import get_db, get_current_user
from app.crud.crud_arc import arc as arc_crud, arc_link as arc_link_crud
from app.crud.crud_project import project as project_crud
from app.models.user import User
from app.schemas.arc import Arc, ArcCreate, ArcUpdate, ArcLink, ArcLinkCreate, ArcLinkUpdate

router = APIRouter()


@router.get("/", response_model=List[Arc])
def get_arcs(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all arcs for a project.
    
    Args:
        project_id: Project ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of arcs
        
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
    
    arcs = arc_crud.get_by_project(db, project_id=project_id, skip=skip, limit=limit)
    return arcs


@router.get("/{arc_id}", response_model=Arc)
def get_arc(
    arc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific arc.
    
    Args:
        arc_id: Arc ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Arc
        
    Raises:
        HTTPException: If arc not found or user doesn't have access
    """
    arc = arc_crud.get(db, id=arc_id)
    if not arc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=arc.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return arc


@router.post("/", response_model=Arc, status_code=status.HTTP_201_CREATED)
def create_arc(
    project_id: UUID,
    arc_in: ArcCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new arc.
    
    Args:
        project_id: Project ID
        arc_in: Arc creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created arc
        
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
    
    arc = arc_crud.create_with_project(db, obj_in=arc_in, project_id=project_id)
    return arc


@router.put("/{arc_id}", response_model=Arc)
def update_arc(
    arc_id: UUID,
    arc_in: ArcUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an arc.
    
    Args:
        arc_id: Arc ID
        arc_in: Arc update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated arc
        
    Raises:
        HTTPException: If arc not found or user doesn't have access
    """
    arc = arc_crud.get(db, id=arc_id)
    if not arc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=arc.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    arc = arc_crud.update(db, db_obj=arc, obj_in=arc_in)
    return arc


@router.delete("/{arc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_arc(
    arc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an arc.
    
    Args:
        arc_id: Arc ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If arc not found or user doesn't have access
    """
    arc = arc_crud.get(db, id=arc_id)
    if not arc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=arc.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    arc_crud.delete(db, id=arc_id)


# Arc Link endpoints
@router.get("/{arc_id}/links", response_model=List[ArcLink])
def get_arc_links(
    arc_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all links for an arc.
    
    Args:
        arc_id: Arc ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of arc links
        
    Raises:
        HTTPException: If arc not found or user doesn't have access
    """
    arc = arc_crud.get(db, id=arc_id)
    if not arc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=arc.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    arc_links = arc_link_crud.get_by_arc(db, arc_id=arc_id, skip=skip, limit=limit)
    return arc_links


@router.post("/links", response_model=ArcLink, status_code=status.HTTP_201_CREATED)
def create_arc_link(
    arc_link_in: ArcLinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new arc link.
    
    Args:
        arc_link_in: Arc link creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created arc link
        
    Raises:
        HTTPException: If arc not found or user doesn't have access
    """
    arc = arc_crud.get(db, id=arc_link_in.arc_id)
    if not arc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=arc.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    arc_link = arc_link_crud.create(db, obj_in=arc_link_in)
    return arc_link


@router.delete("/links/{arc_link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_arc_link(
    arc_link_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an arc link.
    
    Args:
        arc_link_id: Arc link ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If arc link not found or user doesn't have access
    """
    arc_link = arc_link_crud.get(db, id=arc_link_id)
    if not arc_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc link not found"
        )
    
    arc = arc_crud.get(db, id=arc_link.arc_id)
    if not arc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arc not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=arc.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    arc_link_crud.delete(db, id=arc_link_id)
