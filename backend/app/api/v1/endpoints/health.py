"""
Health check endpoint for monitoring.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core import deps

router = APIRouter()


@router.get("/")
def health_check(db: Session = Depends(deps.get_db)):
    """
    Health check endpoint.
    
    Returns:
        dict: Health status with database connectivity check
    """
    try:
        # Test database connectivity (SQLAlchemy 2.0 syntax)
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "service": "literai-backend"
    }
