"""
Configuration endpoints for frontend discovery
"""
from fastapi import APIRouter, Request
import os

router = APIRouter(prefix="/config", tags=["config"])

@router.get("/backend-url")
async def get_backend_url(request: Request):
    """
    Return the backend URL for frontend discovery
    This allows the frontend to discover the correct backend URL
    even when Manus assigns different suffixes to frontend and backend
    """
    # Get the backend URL from the request
    # The backend is accessible at the same host as the request
    backend_url = f"{request.url.scheme}://{request.url.netloc}"
    
    return {
        "backendUrl": backend_url,
        "status": "ok"
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "literai-backend"
    }
