"""
API v1 router.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, documents, entities, arcs, timeline, tags, llm, pyramid, versions, analytics, export, semantic_tags, health, config

api_router = APIRouter()

api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(entities.router, prefix="/entities", tags=["entities"])
api_router.include_router(arcs.router, prefix="/arcs", tags=["arcs"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])
api_router.include_router(pyramid.router, prefix="/pyramid", tags=["pyramid"])
api_router.include_router(versions.router, prefix="/versions", tags=["versions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(semantic_tags.router, prefix="/semantic-tags", tags=["semantic-tags"])
