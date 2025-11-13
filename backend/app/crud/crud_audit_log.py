"""
CRUD operations for AuditLog model.
"""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
from app.models.audit_log import AuditLog
from app.crud.base import CRUDBase


class CRUDAuditLog(CRUDBase[AuditLog, dict, dict]):
    """CRUD operations for AuditLog."""

    def create_log(
        self,
        db: Session,
        user_id: Optional[str],
        action: str,
        status: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[str] = None
    ) -> AuditLog:
        """Create a new audit log entry."""
        db_obj = AuditLog(
            user_id=user_id,
            action=action,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_user_logs(
        self,
        db: Session,
        user_id: str,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs for a specific user."""
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.created_at.desc()).limit(limit).all()

    def get_failed_logins(
        self,
        db: Session,
        hours: int = 24,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get failed login attempts in the last N hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return db.query(AuditLog).filter(
            AuditLog.action == "failed_login",
            AuditLog.status == "failure",
            AuditLog.created_at >= cutoff_time
        ).order_by(AuditLog.created_at.desc()).limit(limit).all()

    def get_failed_logins_by_ip(
        self,
        db: Session,
        ip_address: str,
        hours: int = 1
    ) -> int:
        """Count failed login attempts from a specific IP in the last N hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return db.query(AuditLog).filter(
            AuditLog.action == "failed_login",
            AuditLog.status == "failure",
            AuditLog.ip_address == ip_address,
            AuditLog.created_at >= cutoff_time
        ).count()

    def cleanup_old_logs(self, db: Session, days: int = 90) -> int:
        """Delete audit logs older than N days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        result = db.query(AuditLog).filter(
            AuditLog.created_at < cutoff_date
        ).delete()
        db.commit()
        return result


audit_log = CRUDAuditLog(AuditLog)
