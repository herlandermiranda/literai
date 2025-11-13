"""
Entity endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.deps import get_db, get_current_user
from app.crud.crud_entity import entity as entity_crud
from app.crud.crud_project import project as project_crud
from app.models.user import User
from app.models.entity import EntityType
from app.schemas.entity import Entity, EntityCreate, EntityUpdate

router = APIRouter()


@router.get("/", response_model=List[Entity])
def get_entities(
    project_id: UUID,
    entity_type: Optional[EntityType] = Query(None),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all entities for a project, optionally filtered by type.
    
    Args:
        project_id: Project ID
        entity_type: Optional entity type filter
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of entities
        
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
    
    if entity_type:
        entities = entity_crud.get_by_project_and_type(
            db, project_id=project_id, entity_type=entity_type, skip=skip, limit=limit
        )
    else:
        entities = entity_crud.get_by_project(db, project_id=project_id, skip=skip, limit=limit)
    
    return entities


@router.get("/{entity_id}", response_model=Entity)
def get_entity(
    entity_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific entity.
    
    Args:
        entity_id: Entity ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Entity
        
    Raises:
        HTTPException: If entity not found or user doesn't have access
    """
    entity = entity_crud.get(db, id=entity_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=entity.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return entity


@router.post("/", response_model=Entity, status_code=status.HTTP_201_CREATED)
def create_entity(
    project_id: UUID,
    entity_in: EntityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new entity.
    
    Args:
        project_id: Project ID
        entity_in: Entity creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created entity
        
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
    
    # Generate slug if not provided
    if not entity_in.slug:
        import re
        slug = re.sub(r'[^a-z0-9]+', '-', entity_in.name.lower()).strip('-')
        entity_in.slug = slug
    
    # Check if slug already exists
    existing_entity = entity_crud.get_by_slug(db, project_id=project_id, slug=entity_in.slug)
    if existing_entity:
        # Add a suffix to make it unique
        import uuid
        entity_in.slug = f"{entity_in.slug}-{str(uuid.uuid4())[:8]}"
    
    entity = entity_crud.create_with_project(db, obj_in=entity_in, project_id=project_id)
    return entity


@router.put("/{entity_id}", response_model=Entity)
def update_entity(
    entity_id: UUID,
    entity_in: EntityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an entity.
    
    Args:
        entity_id: Entity ID
        entity_in: Entity update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated entity
        
    Raises:
        HTTPException: If entity not found or user doesn't have access
    """
    entity = entity_crud.get(db, id=entity_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=entity.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if new slug conflicts with existing entity
    if entity_in.slug and entity_in.slug != entity.slug:
        existing_entity = entity_crud.get_by_slug(db, project_id=entity.project_id, slug=entity_in.slug)
        if existing_entity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Entity with this slug already exists in this project"
            )
    
    entity = entity_crud.update(db, db_obj=entity, obj_in=entity_in)
    return entity


@router.delete("/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity(
    entity_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an entity.
    
    Args:
        entity_id: Entity ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If entity not found or user doesn't have access
    """
    entity = entity_crud.get(db, id=entity_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found"
        )
    
    # Verify project ownership
    project = project_crud.get(db, id=entity.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    entity_crud.delete(db, id=entity_id)
