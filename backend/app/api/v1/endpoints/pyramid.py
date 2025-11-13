"""
Pyramid endpoints for hierarchical story structure.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core import deps
from app.crud import pyramid_node as crud_pyramid
from app.crud.crud_project import CRUDProject
from app.models.project import Project

crud_project = CRUDProject(Project)
from app.schemas.pyramid import (
    PyramidNode,
    PyramidNodeCreate,
    PyramidNodeUpdate,
    PyramidGenerateRequest,
    PyramidGenerateResponse,
    PyramidCoherenceCheck
)
from app.services.pyramid_llm_service import pyramid_llm_service

router = APIRouter()


@router.get("/projects/{project_id}", response_model=List[PyramidNode])
def get_project_pyramid_by_path(
    project_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all pyramid nodes for a project (path parameter)."""
    nodes = crud_pyramid.get_by_project(db, project_id=project_id)
    return nodes


@router.get("/nodes/", response_model=List[PyramidNode])
def get_project_pyramid_by_query(
    project_id: UUID,  # Query parameter
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all pyramid nodes for a project (query parameter)."""
    nodes = crud_pyramid.get_by_project(db, project_id=project_id)
    return nodes


@router.get("/nodes/{node_id}", response_model=PyramidNode)
def get_pyramid_node(
    node_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get a specific pyramid node."""
    node = crud_pyramid.get(db, id=node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Pyramid node not found")
    return node


@router.post("/nodes/", response_model=PyramidNode, status_code=201)
def create_pyramid_node(
    node_in: PyramidNodeCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new pyramid node."""
    # Validate that the project exists
    project = crud_project.get(db, id=node_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    node = crud_pyramid.create(db, obj_in=node_in)
    
    # Create automatic initial version
    from app.crud import version as version_crud
    from app.schemas.version import VersionCreate
    
    version_in = VersionCreate(
        project_id=node.project_id,
        pyramid_node_id=node.id,
        commit_message="Initial version: Created pyramid node",
        author_email=current_user.email if hasattr(current_user, 'email') else "system",
        content_snapshot=node.content,
        metadata_snapshot=None
    )
    version_crud.create(db, obj_in=version_in)
    
    return node


@router.put("/nodes/{node_id}", response_model=PyramidNode)
def update_pyramid_node(
    node_id: UUID,
    node_in: PyramidNodeUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Update a pyramid node and create automatic version."""
    from app.crud import crud_version
    from app.schemas.version import VersionCreate
    
    node = crud_pyramid.get(db, id=node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Pyramid node not found")
    
    # Store old content for versioning
    old_content = node.content
    
    # Update the node
    node = crud_pyramid.update(db, db_obj=node, obj_in=node_in)
    
    # Create automatic version if content changed
    if node.content != old_content:
        from app.crud import version as version_crud
        from app.schemas.version import VersionCreate
        
        version_in = VersionCreate(
            project_id=node.project_id,
            pyramid_node_id=node_id,
            commit_message=f"Auto-save: Updated pyramid node",
            author_email=current_user.email if hasattr(current_user, 'email') else "system",
            content_snapshot=node.content,
            metadata_snapshot=None
        )
        version_crud.create(db, obj_in=version_in)
    
    return node


@router.delete("/nodes/{node_id}")
def delete_pyramid_node(
    node_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Delete a pyramid node."""
    node = crud_pyramid.get(db, id=node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Pyramid node not found")
    crud_pyramid.remove(db, id=node_id)
    return {"status": "deleted"}


@router.post("/generate", response_model=PyramidGenerateResponse)
def generate_pyramid_nodes(
    request: PyramidGenerateRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Generate pyramid nodes using LLM."""
    if request.direction == "down":
        # Generate children from parent
        if not request.node_id:
            raise HTTPException(status_code=400, detail="node_id required for downward generation")
        
        parent_node = crud_pyramid.get(db, id=request.node_id)
        if not parent_node:
            raise HTTPException(status_code=404, detail="Parent node not found")
        
        generated_nodes = pyramid_llm_service.generate_children(
            db,
            parent_node=parent_node,
            user_id=current_user.id,
            count=request.count
        )
        
        return PyramidGenerateResponse(
            generated_nodes=generated_nodes,
            parent_node=parent_node
        )
    
    elif request.direction == "up":
        # Generate parent from children
        if not request.node_id:
            raise HTTPException(status_code=400, detail="node_id required for upward generation")
        
        # Get siblings of the node
        node = crud_pyramid.get(db, id=request.node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node not found")
        
        siblings = crud_pyramid.get_by_parent(db, parent_id=node.parent_id) if node.parent_id else [node]
        
        parent_node = pyramid_llm_service.generate_parent(
            db,
            child_nodes=siblings,
            project_id=node.project_id,
            user_id=current_user.id
        )
        
        return PyramidGenerateResponse(
            generated_nodes=[parent_node],
            parent_node=None
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid direction")


@router.post("/{node_id}/check-coherence", response_model=PyramidCoherenceCheck)
def check_pyramid_coherence(
    node_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Check coherence of a pyramid node."""
    node = crud_pyramid.get(db, id=node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Pyramid node not found")
    
    coherence_check = pyramid_llm_service.check_coherence(db, node=node, user_id=current_user.id)
    return coherence_check
