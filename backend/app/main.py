"""
Main FastAPI application.
"""
import logging
import traceback
import time
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import Headers
from app.core.config import settings
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    debug=True,  # Enable debug mode to see detailed error messages
    redirect_slashes=False  # Disable automatic trailing slash redirects (307)
)

# Proxy headers middleware (must be first to handle X-Forwarded-* headers)
class ProxyHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            # Read X-Forwarded-Proto header to detect HTTPS
            forwarded_proto = request.headers.get("X-Forwarded-Proto")
            if forwarded_proto:
                # Update the request URL scheme
                request.scope["scheme"] = forwarded_proto
            
            # Read X-Forwarded-Host header
            forwarded_host = request.headers.get("X-Forwarded-Host")
            if forwarded_host:
                request.scope["server"] = (forwarded_host.split(":")[0], 443 if forwarded_proto == "https" else 80)
            
            # Log request
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)")
            return response
        except Exception as exc:
            logger.error(f"ProxyHeadersMiddleware error: {exc}", exc_info=True)
            raise

app.add_middleware(ProxyHeadersMiddleware)

# CORS middleware - Allow specific origins when using credentials
# In development: allow localhost and Manus URLs
# In production: replace with actual frontend URL

# Use regex to match Manus URLs dynamically (they change on each restart)
allow_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost",
    "https://localhost",
]

# Add regex patterns for Manus URLs
# Manus dev URLs: https://3000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer
# Manus published: https://literaiapp-kyf7wxnb.manus.space
allow_origin_regex = r"https://[0-9a-z-]+\.(manusvm\.computer|manus\.space)"

logger.info(f"CORS Configuration:")
logger.info(f"  Allow origins: {allow_origins}")
logger.info(f"  Allow origin regex: {allow_origin_regex}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# Include API router FIRST (before static files)
# This ensures /api/v1 routes are matched before the catch-all static files mount
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Health check endpoints (before static files)
@app.get("/api/health")
def api_health():
    """API health check endpoint."""
    return {"status": "healthy", "service": "api"}

@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}

# Serve static files from the frontend build directory LAST
# This allows the backend to serve the frontend on the same domain
# Use a catch-all route instead of mount() to avoid capturing /api/v1 requests
# Path: /home/ubuntu/literai/backend/app/main.py -> /home/ubuntu/literai-frontend/dist/public
frontend_build_path = Path(__file__).parent.parent.parent.parent / "literai-frontend" / "dist" / "public"

if frontend_build_path.exists():
    logger.info(f"Mounting frontend static files from: {frontend_build_path}")
    
    # Serve static files with a catch-all route
    # Note: This route only handles GET requests for static files
    # POST/PUT/DELETE requests to /api/v1 are handled by the API router above
    @app.get("/{path:path}")
    async def serve_static(path: str):
        """Serve static files or index.html for SPA routing."""
        # Don't serve static files for /api/v1 paths (they should be handled by the API router)
        if path.startswith("api/v1"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        
        file_path = frontend_build_path / path
        
        # If the file exists, serve it
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise, serve index.html for SPA routing
        index_path = frontend_build_path / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        # If index.html doesn't exist, return 404
        return JSONResponse({"detail": "Not Found"}, status_code=404)
else:
    logger.warning(f"Frontend build directory not found: {frontend_build_path}")
    logger.warning("Frontend will not be served. Make sure to build the frontend first.")


# Note: Root endpoint removed - StaticFiles will serve index.html
# This prevents the JSON response from blocking the frontend

# Global exception handler for all unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions globally."""
    logger.error(
        f"Unhandled exception in {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    
    # Log full traceback
    error_detail = traceback.format_exc()
    logger.error(f"Traceback:\n{error_detail}")
    
    # Return detailed error response in debug mode
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error": str(exc),
                "type": type(exc).__name__,
                "traceback": error_detail.split('\n')
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
