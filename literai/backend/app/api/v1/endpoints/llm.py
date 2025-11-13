"""
LLM endpoints for literary writing assistance.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.crud.crud_project import project as project_crud
from app.models.user import User
from app.services.llm_service import get_llm_service
from app.schemas.llm import (
    ContinuationRequest,
    RewritingRequest,
    SuggestionRequest,
    AnalysisRequest,
    LLMResponse,
    LLMRequestHistory
)
from app.models.llm_request import LLMRequest

router = APIRouter()


def verify_project_access(db: Session, project_id: UUID, user: User):
    """
    Verify that the user has access to the project.
    
    Args:
        db: Database session
        project_id: Project ID
        user: Current user
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    project = project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )


@router.post("/continuation", response_model=LLMResponse)
def generate_continuation(
    request: ContinuationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a continuation of existing text.
    
    Args:
        request: Continuation request data (includes project_id)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Generated continuation
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    verify_project_access(db, request.project_id, current_user)
    
    llm_service = get_llm_service(db, current_user.id)
    result = llm_service.generate_continuation(
        project_id=request.project_id,
        existing_text=request.existing_text,
        user_instructions=request.user_instructions,
        target_length=request.target_length,
        entity_ids=request.entity_ids,
        arc_ids=request.arc_ids,
        event_ids=request.event_ids
    )
    
    return result


@router.post("/rewrite", response_model=LLMResponse)
def rewrite_text(
    request: RewritingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rewrite text with specific goals.
    
    Args:
        request: Rewriting request data (includes project_id)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Rewritten text
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    verify_project_access(db, request.project_id, current_user)
    
    llm_service = get_llm_service(db, current_user.id)
    result = llm_service.rewrite_text(
        project_id=request.project_id,
        text_to_rewrite=request.text_to_rewrite,
        rewriting_goals=request.rewriting_goals,
        user_instructions=request.user_instructions
    )
    
    return result


@router.post("/suggestions", response_model=LLMResponse)
def get_suggestions(
    request: SuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get creative suggestions for story development.
    
    Args:
        request: Suggestion request data (includes project_id)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Creative suggestions
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    verify_project_access(db, request.project_id, current_user)
    
    llm_service = get_llm_service(db, current_user.id)
    result = llm_service.get_suggestions(
        project_id=request.project_id,
        current_context=request.current_context,
        user_question=request.user_question,
        entity_ids=request.entity_ids,
        arc_ids=request.arc_ids,
        event_ids=request.event_ids
    )
    
    return result


@router.post("/analyze", response_model=LLMResponse)
def analyze_text(
    request: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze text with specific focus areas.
    
    Args:
        request: Analysis request data (includes project_id)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Text analysis
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    verify_project_access(db, request.project_id, current_user)
    
    llm_service = get_llm_service(db, current_user.id)
    result = llm_service.analyze_text(
        project_id=request.project_id,
        text_to_analyze=request.text_to_analyze,
        analysis_focus=request.analysis_focus,
        user_instructions=request.user_instructions
    )
    
    return result


@router.get("/history/{project_id}", response_model=List[LLMRequestHistory])
def get_llm_history(
    project_id: UUID,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get LLM request history for a project.
    
    Args:
        project_id: Project ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of LLM request history
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    verify_project_access(db, project_id, current_user)
    
    requests = (
        db.query(LLMRequest)
        .filter(LLMRequest.project_id == project_id)
        .order_by(LLMRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        LLMRequestHistory(
            id=req.id,
            request_type=req.request_type.value,
            prompt=req.prompt[:500] + "..." if len(req.prompt) > 500 else req.prompt,
            response=req.response[:500] + "..." if len(req.response) > 500 else req.response,
            model=req.model,
            tokens_used=req.tokens_used,
            status=req.status.value,
            created_at=req.created_at.isoformat()
        )
        for req in requests
    ]
