"""
CRUD operations for RefreshToken model.
"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.refresh_token import RefreshToken
from app.crud.base import CRUDBase


class CRUDRefreshToken(CRUDBase[RefreshToken, dict, dict]):
    """CRUD operations for RefreshToken."""

    def create_token(
        self,
        db: Session,
        user_id: str,
        token_jti: str,
        expires_at: datetime
    ) -> RefreshToken:
        """Create a new refresh token."""
        db_obj = RefreshToken(
            user_id=user_id,
            token_jti=token_jti,
            expires_at=expires_at
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_jti(self, db: Session, token_jti: str) -> RefreshToken | None:
        """Get refresh token by JWT ID."""
        return db.query(RefreshToken).filter(
            RefreshToken.token_jti == token_jti
        ).first()

    def get_valid_token(
        self,
        db: Session,
        user_id: str,
        token_jti: str
    ) -> RefreshToken | None:
        """Get valid (not revoked and not expired) refresh token."""
        token = db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.token_jti == token_jti,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.utcnow()
        ).first()
        return token

    def revoke_token(self, db: Session, token_jti: str) -> RefreshToken | None:
        """Revoke a refresh token."""
        token = self.get_by_jti(db, token_jti)
        if token:
            token.revoke()
            db.commit()
            db.refresh(token)
        return token

    def revoke_all_user_tokens(self, db: Session, user_id: str) -> int:
        """Revoke all refresh tokens for a user."""
        tokens = db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None)
        ).all()
        
        for token in tokens:
            token.revoke()
        
        db.commit()
        return len(tokens)

    def cleanup_expired_tokens(self, db: Session) -> int:
        """Delete expired tokens (older than 30 days)."""
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        result = db.query(RefreshToken).filter(
            RefreshToken.expires_at < cutoff_date
        ).delete()
        
        db.commit()
        return result


refresh_token = CRUDRefreshToken(RefreshToken)
