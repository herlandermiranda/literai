"""
CRUD operations for PyramidNode model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.pyramid_node import PyramidNode
from app.schemas.pyramid import PyramidNodeCreate, PyramidNodeUpdate


class CRUDPyramidNode(CRUDBase[PyramidNode, PyramidNodeCreate, PyramidNodeUpdate]):
    """CRUD operations for PyramidNode model."""
    
    def get_by_project(
        self, db: Session, *, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[PyramidNode]:
        """
        Get all pyramid nodes for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of pyramid nodes
        """
        return (
            db.query(PyramidNode)
            .filter(PyramidNode.project_id == project_id)
            .order_by(PyramidNode.level, PyramidNode.order)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_parent(
        self, db: Session, *, parent_id: UUID
    ) -> List[PyramidNode]:
        """
        Get all child nodes of a parent node.
        
        Args:
            db: Database session
            parent_id: Parent node ID
            
        Returns:
            List of child pyramid nodes
        """
        return (
            db.query(PyramidNode)
            .filter(PyramidNode.parent_id == parent_id)
            .order_by(PyramidNode.order)
            .all()
        )
    
    def get_root_nodes(
        self, db: Session, *, project_id: UUID
    ) -> List[PyramidNode]:
        """
        Get all root nodes (level 0, no parent) for a project.
        
        Args:
            db: Database session
            project_id: Project ID
            
        Returns:
            List of root pyramid nodes
        """
        return (
            db.query(PyramidNode)
            .filter(
                PyramidNode.project_id == project_id,
                PyramidNode.parent_id.is_(None)
            )
            .order_by(PyramidNode.order)
            .all()
        )
    
    def get_by_level(
        self, db: Session, *, project_id: UUID, level: int
    ) -> List[PyramidNode]:
        """
        Get all nodes at a specific level in a project.
        
        Args:
            db: Database session
            project_id: Project ID
            level: Pyramid level
            
        Returns:
            List of pyramid nodes at the specified level
        """
        return (
            db.query(PyramidNode)
            .filter(
                PyramidNode.project_id == project_id,
                PyramidNode.level == level
            )
            .order_by(PyramidNode.order)
            .all()
        )
    
    def update_order(
        self, db: Session, *, node_id: UUID, new_order: int
    ) -> Optional[PyramidNode]:
        """
        Update the order of a pyramid node.
        
        Args:
            db: Database session
            node_id: Node ID
            new_order: New order value
            
        Returns:
            Updated pyramid node or None if not found
        """
        node = db.query(PyramidNode).filter(PyramidNode.id == node_id).first()
        if not node:
            return None
        
        node.order = new_order
        db.add(node)
        db.commit()
        db.refresh(node)
        return node


pyramid_node = CRUDPyramidNode(PyramidNode)
