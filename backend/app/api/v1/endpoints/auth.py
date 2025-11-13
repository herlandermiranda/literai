"""
Authentication endpoints with production-grade security.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional
import logging

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.core.deps import get_db, get_current_user
from app.core.rate_limiter import login_rate_limiter, RateLimitExceeded
from app.crud.crud_user import user as crud_user
from app.crud.crud_refresh_token import refresh_token as crud_refresh_token
from app.crud.crud_audit_log import audit_log as crud_audit_log
from app.schemas.user import UserCreate, User as UserSchema, UserLogin
from app.models.user import User as UserModel

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])


def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    if x_forwarded_for := request.headers.get("X-Forwarded-For"):
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/login", response_model=dict)
async def login(
    user_login: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login endpoint with rate limiting and audit logging.
    
    Returns:
        - access_token: JWT access token (15 min)
        - token_type: "bearer"
        
    Sets HTTP-only cookie:
        - refresh_token: JWT refresh token (7 days)
    """
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "unknown")
    
    try:
        # Rate limiting
        await login_rate_limiter.check_limit(client_ip)
    except RateLimitExceeded as e:
        # Log failed attempt
        crud_audit_log.create_log(
            db,
            user_id=None,
            action="failed_login",
            status="failure",
            ip_address=client_ip,
            user_agent=user_agent,
            details="Rate limit exceeded"
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    
    # Authenticate user
    db_user = crud_user.get_by_email(db, email=user_login.email)
    if not db_user or not verify_password(user_login.password, db_user.password_hash):
        # Log failed attempt
        crud_audit_log.create_log(
            db,
            user_id=None,
            action="failed_login",
            status="failure",
            ip_address=client_ip,
            user_agent=user_agent,
            details="Invalid credentials"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token_str, jti = create_refresh_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(days=7)
    )
    
    # Store refresh token in DB for revocation
    crud_refresh_token.create_token(
        db,
        user_id=str(db_user.id),
        token_jti=jti,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    # Log successful login
    crud_audit_log.create_log(
        db,
        user_id=str(db_user.id),
        action="login",
        status="success",
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    # Return response with HTTP-only cookie
    response = JSONResponse(
        content={
            "access_token": access_token,
            "token_type": "bearer"
        }
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_str,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7*24*60*60,
        path="/api/v1/auth"
    )
    
    return response


@router.post("/refresh", response_model=dict)
async def refresh_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token from HTTP-only cookie.
    
    Returns:
        - access_token: New JWT access token (15 min)
        - token_type: "bearer"
    """
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # Extract refresh token from cookie
    refresh_token_str = request.cookies.get("refresh_token")
    if not refresh_token_str:
        crud_audit_log.create_log(
            db,
            user_id=None,
            action="refresh",
            status="failure",
            ip_address=client_ip,
            user_agent=user_agent,
            details="No refresh token in cookie"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token"
        )
    
    # Validate refresh token
    payload = decode_refresh_token(refresh_token_str)
    if not payload:
        crud_audit_log.create_log(
            db,
            user_id=None,
            action="refresh",
            status="failure",
            ip_address=client_ip,
            user_agent=user_agent,
            details="Invalid refresh token"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    jti = payload.get("jti")
    
    # Check if token is revoked
    token_record = crud_refresh_token.get_valid_token(db, user_id, jti)
    if not token_record:
        crud_audit_log.create_log(
            db,
            user_id=user_id,
            action="refresh",
            status="failure",
            ip_address=client_ip,
            user_agent=user_agent,
            details="Token revoked or expired"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revoked or expired"
        )
    
    # Generate new access token
    new_access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=15)
    )
    
    # Log successful refresh
    crud_audit_log.create_log(
        db,
        user_id=user_id,
        action="refresh",
        status="success",
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    current_user: UserModel = Depends(get_current_user),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Logout by revoking refresh token."""
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # Revoke refresh token
    refresh_token_str = request.cookies.get("refresh_token")
    if refresh_token_str:
        payload = decode_refresh_token(refresh_token_str)
        if payload:
            jti = payload.get("jti")
            crud_refresh_token.revoke_token(db, jti)
    
    # Log logout
    crud_audit_log.create_log(
        db,
        user_id=str(current_user.id),
        action="logout",
        status="success",
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    # Clear cookie
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("refresh_token", path="/api/v1/auth")
    return response


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: UserModel = Depends(get_current_user)
):
    """Get current authenticated user information."""
    return current_user


@router.post("/register", response_model=UserSchema)
async def register(
    user_create: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    """
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # Check if user already exists
    db_user = crud_user.get_by_email(db, email=user_create.email)
    if db_user:
        crud_audit_log.create_log(
            db,
            user_id=None,
            action="register",
            status="failure",
            ip_address=client_ip,
            user_agent=user_agent,
            details="Email already registered"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    db_user = crud_user.create(
        db,
        obj_in=user_create
    )
    
    # Log registration
    crud_audit_log.create_log(
        db,
        user_id=str(db_user.id),
        action="register",
        status="success",
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    return db_user
