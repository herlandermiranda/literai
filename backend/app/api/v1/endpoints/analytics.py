"""
Analytics endpoints for project statistics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core import deps
from app.schemas.analytics import ProjectAnalytics
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/projects/{project_id}/analytics", response_model=ProjectAnalytics)
def get_project_analytics(
    project_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get complete analytics for a project."""
    analytics = analytics_service.generate_project_analytics(db, project_id=project_id)
    return analytics
