"""
Semantic tags endpoints for advanced text markup.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core import deps
from app.crud import tag as crud_tag, entity_resolution as crud_entity_resolution
from app.schemas.semantic_tag import (
    Tag,
    TagCreate,
    TagUpdate,
    EntityResolution,
    EntityResolutionCreate,
    EntityResolutionUpdate,
    TagParseRequest,
    TagParseResponse,
    TagAutocompleteRequest,
    TagAutocompleteResponse,
    TagValidateRequest,
    TagValidateResponse
)
from app.services.semantic_tag_service import semantic_tag_service

router = APIRouter()


@router.get("/projects/{project_id}/tags", response_model=List[Tag])
def get_project_tags(
    project_id: UUID,
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all tags for a project."""
    tags = crud_tag.get_by_project(db, project_id=project_id, skip=skip, limit=limit)
    return tags


@router.get("/documents/{document_id}/tags", response_model=List[Tag])
def get_document_tags(
    document_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all tags for a document."""
    tags = crud_tag.get_by_document(db, document_id=document_id)
    return tags


@router.post("/tags", response_model=Tag)
def create_tag(
    tag_in: TagCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new tag."""
    tag = crud_tag.create(db, obj_in=tag_in)
    return tag


@router.put("/tags/{tag_id}", response_model=Tag)
def update_tag(
    tag_id: UUID,
    tag_in: TagUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update a tag."""
    tag = crud_tag.get(db, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag = crud_tag.update(db, db_obj=tag, obj_in=tag_in)
    return tag


@router.delete("/tags/{tag_id}")
def delete_tag(
    tag_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Delete a tag."""
    tag = crud_tag.get(db, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    crud_tag.remove(db, id=tag_id)
    return {"status": "deleted"}


@router.post("/tags/parse", response_model=TagParseResponse)
def parse_tags(
    request: TagParseRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Parse tags from text and create them in database."""
    tags = semantic_tag_service.create_tags_from_text(
        db,
        text=request.text,
        project_id=request.project_id,
        document_id=request.document_id,
        auto_resolve=True
    )
    
    unresolved_tags = [tag.tag_name for tag in tags if tag.resolved_entity_id is None]
    
    return TagParseResponse(
        tags=tags,
        unresolved_tags=unresolved_tags
    )


@router.post("/tags/autocomplete", response_model=TagAutocompleteResponse)
def autocomplete_tags(
    request: TagAutocompleteRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get autocomplete suggestions for tag names."""
    suggestions = semantic_tag_service.get_autocomplete_suggestions(
        db,
        project_id=request.project_id,
        tag_type=request.tag_type,
        partial_name=request.partial_name
    )
    
    return TagAutocompleteResponse(suggestions=suggestions)


@router.post("/tags/validate", response_model=TagValidateResponse)
def validate_tags(
    request: TagValidateRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Validate a list of tags."""
    errors = []
    
    for tag_create in request.tags:
        # Basic validation
        if tag_create.start_position >= tag_create.end_position:
            errors.append(f"Invalid position for tag '{tag_create.tag_name}'")
        
        if not tag_create.tag_name.strip():
            errors.append("Tag name cannot be empty")
    
    return TagValidateResponse(
        valid=len(errors) == 0,
        errors=errors
    )


# Entity Resolution endpoints

@router.get("/projects/{project_id}/entity-resolutions", response_model=List[EntityResolution])
def get_project_entity_resolutions(
    project_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all entity resolutions for a project."""
    resolutions = crud_entity_resolution.get_by_project(db, project_id=project_id)
    return resolutions


@router.post("/entity-resolutions", response_model=EntityResolution)
def create_entity_resolution(
    resolution_in: EntityResolutionCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new entity resolution."""
    resolution = crud_entity_resolution.create(db, obj_in=resolution_in)
    return resolution


@router.put("/entity-resolutions/{resolution_id}", response_model=EntityResolution)
def update_entity_resolution(
    resolution_id: UUID,
    resolution_in: EntityResolutionUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update an entity resolution."""
    resolution = crud_entity_resolution.get(db, id=resolution_id)
    if not resolution:
        raise HTTPException(status_code=404, detail="Entity resolution not found")
    resolution = crud_entity_resolution.update(db, db_obj=resolution, obj_in=resolution_in)
    return resolution


@router.delete("/entity-resolutions/{resolution_id}")
def delete_entity_resolution(
    resolution_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Delete an entity resolution."""
    resolution = crud_entity_resolution.get(db, id=resolution_id)
    if not resolution:
        raise HTTPException(status_code=404, detail="Entity resolution not found")
    crud_entity_resolution.remove(db, id=resolution_id)
    return {"status": "deleted"}
