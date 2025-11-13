"""
Version endpoints for Git-like versioning.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core import deps
from app.crud import version as crud_version
from app.schemas.version import (
    Version,
    VersionCreate,
    VersionDiff,
    VersionRestore
)
from app.services.versioning_service import versioning_service

router = APIRouter()


@router.get("/projects/{project_id}/versions", response_model=List[Version])
def get_project_versions(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all versions for a project."""
    versions = crud_version.get_by_project(db, project_id=project_id, skip=skip, limit=limit)
    return versions


@router.get("/documents/{document_id}/versions", response_model=List[Version])
def get_document_versions(
    document_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all versions for a document."""
    versions = crud_version.get_by_document(db, document_id=document_id, skip=skip, limit=limit)
    return versions


@router.get("/pyramid/{pyramid_node_id}/versions", response_model=List[Version])
def get_pyramid_node_versions(
    pyramid_node_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all versions for a pyramid node."""
    versions = crud_version.get_by_pyramid_node(db, pyramid_node_id=pyramid_node_id, skip=skip, limit=limit)
    return versions


@router.post("/versions", response_model=Version)
def create_version(
    version_in: VersionCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new version (commit)."""
    version = crud_version.create(db, obj_in=version_in)
    return version


@router.get("/versions/{version_id}", response_model=Version)
def get_version(
    version_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get a specific version."""
    version = crud_version.get(db, id=version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version


@router.post("/versions/diff", response_model=VersionDiff)
def get_version_diff(
    version_a_id: UUID,
    version_b_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get diff between two versions."""
    try:
        diff = versioning_service.get_version_diff(
            db,
            version_a_id=version_a_id,
            version_b_id=version_b_id
        )
        return diff
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/versions/restore")
def restore_version(
    restore_request: VersionRestore,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Restore content from a version."""
    result = versioning_service.restore_version(
        db,
        version_id=restore_request.version_id,
        author_email=current_user.email,
        create_new_version=restore_request.create_new_version
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Version not found or restore failed")
    
    return {"status": "restored", "entity_id": str(result.id)}
