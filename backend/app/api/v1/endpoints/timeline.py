"""
Timeline endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.deps import get_db, get_current_user
from app.crud.crud_timeline import timeline_event as timeline_event_crud, timeline_link as timeline_link_crud
from app.crud.crud_project import project as project_crud
from app.models.user import User
from app.schemas.timeline import TimelineEvent, TimelineEventCreate, TimelineEventUpdate, TimelineLink, TimelineLinkCreate, TimelineLinkUpdate

router = APIRouter()


@router.get("/", response_model=List[TimelineEvent])
def get_timeline_events(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all timeline events for a project.
    
    Args:
        project_id: Project ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of timeline events
        
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
    
    events = timeline_event_crud.get_by_project(db, project_id=project_id, skip=skip, limit=limit)
    return events


@router.get("/{event_id}", response_model=TimelineEvent)
def get_timeline_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific timeline event.
    
    Args:
        event_id: Timeline event ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Timeline event
        
    Raises:
        HTTPException: If event not found or user doesn't have access
    """
    event = timeline_event_crud.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=event.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return event


@router.post("/", response_model=TimelineEvent, status_code=status.HTTP_201_CREATED)
def create_timeline_event(
    project_id: UUID,
    event_in: TimelineEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new timeline event.
    
    Args:
        project_id: Project ID
        event_in: Timeline event creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created timeline event
        
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
    
    # Convert string date to None (store as string in metadata instead)
    if isinstance(event_in.date, str):
        if not event_in.event_metadata:
            event_in.event_metadata = {}
        event_in.event_metadata['date_string'] = event_in.date
        event_in.date = None
    
    event = timeline_event_crud.create_with_project(db, obj_in=event_in, project_id=project_id)
    return event


@router.put("/{event_id}", response_model=TimelineEvent)
def update_timeline_event(
    event_id: UUID,
    event_in: TimelineEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a timeline event.
    
    Args:
        event_id: Timeline event ID
        event_in: Timeline event update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated timeline event
        
    Raises:
        HTTPException: If event not found or user doesn't have access
    """
    event = timeline_event_crud.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=event.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    event = timeline_event_crud.update(db, db_obj=event, obj_in=event_in)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeline_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a timeline event.
    
    Args:
        event_id: Timeline event ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If event not found or user doesn't have access
    """
    event = timeline_event_crud.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=event.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    timeline_event_crud.delete(db, id=event_id)


# Timeline Link endpoints
@router.get("/{event_id}/links", response_model=List[TimelineLink])
def get_timeline_links(
    event_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all links for a timeline event.
    
    Args:
        event_id: Timeline event ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of timeline links
        
    Raises:
        HTTPException: If event not found or user doesn't have access
    """
    event = timeline_event_crud.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=event.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    links = timeline_link_crud.get_by_event(db, timeline_event_id=event_id, skip=skip, limit=limit)
    return links


@router.post("/links", response_model=TimelineLink, status_code=status.HTTP_201_CREATED)
def create_timeline_link(
    link_in: TimelineLinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new timeline link.
    
    Args:
        link_in: Timeline link creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created timeline link
        
    Raises:
        HTTPException: If event not found or user doesn't have access
    """
    event = timeline_event_crud.get(db, id=link_in.timeline_event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=event.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    link = timeline_link_crud.create(db, obj_in=link_in)
    return link


@router.delete("/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeline_link(
    link_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a timeline link.
    
    Args:
        link_id: Timeline link ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If link not found or user doesn't have access
    """
    link = timeline_link_crud.get(db, id=link_id)
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline link not found"
        )
    
    event = timeline_event_crud.get(db, id=link.timeline_event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=event.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    timeline_link_crud.delete(db, id=link_id)
