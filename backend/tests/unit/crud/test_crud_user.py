"""
Tests for CRUD operations on User - validates BUG-025 fix.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.crud import user as crud_user
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


class TestCRUDUser:
    """Test CRUD operations for User."""
    
    def test_create_user(self, db: Session):
        """Test creating a user."""
        user_create = UserCreate(
            email="newuser@example.com",
            password="password123"
        )
        
        user = crud_user.create(db, obj_in=user_create)
        
        assert user is not None
        assert user.email == "newuser@example.com"
        assert user.password_hash is not None
    
    def test_get_by_email_case_insensitive(self, db: Session):
        """BUG-025: Test email lookup is case-insensitive."""
        # Create user with lowercase email
        user_create = UserCreate(
            email="testuser@example.com",
            password="password123"
        )
        user = crud_user.create(db, obj_in=user_create)
        
        # BUG-025: Search with different case should work
        user_upper = crud_user.get_by_email(db, email="TESTUSER@EXAMPLE.COM")
        user_mixed = crud_user.get_by_email(db, email="TestUser@Example.Com")
        user_lower = crud_user.get_by_email(db, email="testuser@example.com")
        
        # BUG-025: All should return the same user
        assert user_upper is not None
        assert user_mixed is not None
        assert user_lower is not None
        assert user_upper.id == user.id
        assert user_mixed.id == user.id
        assert user_lower.id == user.id
