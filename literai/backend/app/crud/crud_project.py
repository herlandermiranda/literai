"""
CRUD operations for Project model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    """CRUD operations for Project model."""
    
    def get_by_user(
        self, db: Session, *, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """
        Get all projects for a user.
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of project instances
        """
        return (
            db.query(Project)
            .filter(Project.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_active_by_user(
        self, db: Session, *, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """
        Get active projects for a user.
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of active project instances
        """
        return (
            db.query(Project)
            .filter(Project.user_id == user_id, Project.status == ProjectStatus.ACTIVE)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_owner(
        self, db: Session, *, obj_in: ProjectCreate, user_id: UUID
    ) -> Project:
        """
        Create a new project with owner.
        
        Args:
            db: Database session
            obj_in: Project creation schema
            user_id: Owner user ID
            
        Returns:
            Created project instance
        """
        obj_in_data = obj_in.model_dump()
        db_obj = Project(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def archive(self, db: Session, *, project_id: UUID) -> Optional[Project]:
        """
        Archive a project.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            Archived project instance or None if not found
        """
        project = self.get(db, id=project_id)
        if project:
            project.status = ProjectStatus.ARCHIVED
            db.add(project)
            db.commit()
            db.refresh(project)
        return project


project = CRUDProject(Project)
