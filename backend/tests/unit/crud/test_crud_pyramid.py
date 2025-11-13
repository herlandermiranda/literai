"""
Tests for CRUD operations on PyramidNode - validates BUG-022 fix.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.crud import pyramid_node as crud_pyramid
from app.schemas.pyramid import PyramidNodeCreate, PyramidNodeUpdate


class TestCRUDPyramidNode:
    """Test CRUD operations for PyramidNode."""
    
    def test_create_pyramid_node(self, db: Session, test_project):
        """Test creating a pyramid node."""
        node_create = PyramidNodeCreate(
            project_id=test_project.id,
            title="Chapter Outline",
            content="Detailed outline content",
            level=0,
            order=0,
            is_generated=False  # BUG-022: Boolean field
        )
        
        node = crud_pyramid.create(db, obj_in=node_create)
        
        assert node is not None
        assert node.title == "Chapter Outline"
        assert node.content == "Detailed outline content"
        assert node.level == 0
        assert node.is_generated == False  # BUG-022: Verify Boolean
    
    def test_create_generated_pyramid_node(self, db: Session, test_project):
        """BUG-022: Test creating a generated pyramid node with is_generated=True."""
        node_create = PyramidNodeCreate(
            project_id=test_project.id,
            title="Generated Node",
            content="AI-generated content",
            level=1,
            order=0,
            is_generated=True  # BUG-022: Boolean True
        )
        
        node = crud_pyramid.create(db, obj_in=node_create)
        
        assert node.is_generated == True  # BUG-022: Verify Boolean True
    
    def test_get_by_project(self, db: Session, test_project):
        """Test getting all pyramid nodes for a project."""
        # Create multiple nodes
        for i in range(3):
            node_create = PyramidNodeCreate(
                project_id=test_project.id,
                title=f"Node {i}",
                content=f"Content {i}",
                level=0,
                order=i
            )
            crud_pyramid.create(db, obj_in=node_create)
        
        nodes = crud_pyramid.get_by_project(db, project_id=test_project.id)
        
        assert len(nodes) == 3
    
    def test_get_by_parent(self, db: Session, test_project):
        """Test getting child nodes of a parent."""
        # Create parent
        parent_create = PyramidNodeCreate(
            project_id=test_project.id,
            title="Parent",
            content="Parent content",
            level=0,
            order=0
        )
        parent = crud_pyramid.create(db, obj_in=parent_create)
        
        # Create children
        for i in range(2):
            child_create = PyramidNodeCreate(
                project_id=test_project.id,
                parent_id=parent.id,
                title=f"Child {i}",
                content=f"Child content {i}",
                level=1,
                order=i
            )
            crud_pyramid.create(db, obj_in=child_create)
        
        children = crud_pyramid.get_by_parent(db, parent_id=parent.id)
        
        assert len(children) == 2
    
    def test_update_pyramid_node(self, db: Session, test_project):
        """Test updating a pyramid node."""
        # Create node
        node_create = PyramidNodeCreate(
            project_id=test_project.id,
            title="Original Title",
            content="Original content",
            level=0,
            order=0
        )
        node = crud_pyramid.create(db, obj_in=node_create)
        
        # Update node
        node_update = PyramidNodeUpdate(
            title="Updated Title",
            content="Updated content"
        )
        updated_node = crud_pyramid.update(db, db_obj=node, obj_in=node_update)
        
        assert updated_node.title == "Updated Title"
        assert updated_node.content == "Updated content"
    
    def test_delete_pyramid_node(self, db: Session, test_project):
        """Test deleting a pyramid node."""
        # Create node
        node_create = PyramidNodeCreate(
            project_id=test_project.id,
            title="To Delete",
            content="Content",
            level=0,
            order=0
        )
        node = crud_pyramid.create(db, obj_in=node_create)
        node_id = node.id
        
        # Delete node
        crud_pyramid.delete(db, id=node_id)
        
        # Verify deletion
        deleted_node = crud_pyramid.get(db, id=node_id)
        assert deleted_node is None
