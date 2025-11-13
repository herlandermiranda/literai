"""
API v1 router.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, documents, entities, arcs, timeline, tags, llm

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(entities.router, prefix="/entities", tags=["entities"])
api_router.include_router(arcs.router, prefix="/arcs", tags=["arcs"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])
