"""
Pyramid LLM service for hierarchical story structure generation.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.pyramid_node import PyramidNode
from app.models.project import Project
from app.crud import pyramid_node as crud_pyramid
from app.schemas.pyramid import PyramidNodeCreate, PyramidCoherenceCheck
from app.services.llm_service import get_llm_service


class PyramidLLMService:
    """Service for LLM-powered pyramid structure generation."""
    
    @staticmethod
    def generate_children(
        db: Session,
        *,
        parent_node: PyramidNode,
        user_id: UUID,
        count: int = 3
    ) -> List[PyramidNode]:
        """
        Generate child nodes from a parent node (downward expansion).
        
        Args:
            db: Database session
            parent_node: Parent pyramid node
            user_id: User ID for LLM service
            count: Number of children to generate
            
        Returns:
            List of generated child nodes
        """
        # Get LLM service
        llm_service = get_llm_service(db, user_id)
        
        # Use generate_continuation to create children
        prompt_text = f"{parent_node.title}\n\n{parent_node.content}"
        instructions = f"Break down this story element into {count} more detailed sub-elements. Each should expand on a specific aspect."
        
        result = llm_service.generate_continuation(
            project_id=parent_node.project_id,
            existing_text=prompt_text,
            user_instructions=instructions,
            target_length=300
        )
        
        generated_text = result.get("generated_text", "")
        
        # Simple parsing: split by double newlines and create nodes
        parts = [p.strip() for p in generated_text.split("\n\n") if p.strip()]
        
        children = []
        for i in range(min(count, len(parts))):
            # Try to extract title and content
            lines = parts[i].split("\n", 1)
            title = lines[0].strip("# ").strip() if lines else f"Sub-element {i+1}"
            content = lines[1].strip() if len(lines) > 1 else parts[i]
            
            child_create = PyramidNodeCreate(
                project_id=parent_node.project_id,
                parent_id=parent_node.id,
                title=title[:500],  # Limit to max length
                content=content,
                level=parent_node.level + 1,
                order=i,
                is_generated=True
            )
            child = crud_pyramid.create(db, obj_in=child_create)
            children.append(child)
        
        # If not enough parts, create placeholder children
        for i in range(len(children), count):
            child_create = PyramidNodeCreate(
                project_id=parent_node.project_id,
                parent_id=parent_node.id,
                title=f"Generated sub-element {i+1}",
                content=f"Detailed expansion of: {parent_node.title}",
                level=parent_node.level + 1,
                order=i,
                is_generated=True
            )
            child = crud_pyramid.create(db, obj_in=child_create)
            children.append(child)
        
        return children
    
    @staticmethod
    def generate_parent(
        db: Session,
        *,
        child_nodes: List[PyramidNode],
        project_id: UUID,
        user_id: UUID
    ) -> PyramidNode:
        """
        Generate a parent node from child nodes (upward synthesis).
        
        Args:
            db: Database session
            child_nodes: List of child pyramid nodes
            project_id: Project ID
            user_id: User ID for LLM service
            
        Returns:
            Generated parent node
        """
        # Get LLM service
        llm_service = get_llm_service(db, user_id)
        
        # Combine children content
        combined_text = "\n\n".join([
            f"**{node.title}**\n{node.content[:200]}..."
            for node in child_nodes
        ])
        
        instructions = "Synthesize these detailed elements into a single high-level summary that encompasses all of them."
        
        result = llm_service.generate_continuation(
            project_id=project_id,
            existing_text=combined_text,
            user_instructions=instructions,
            target_length=200
        )
        
        generated_text = result.get("generated_text", "")
        
        # Extract title and content
        lines = generated_text.split("\n", 1)
        title = lines[0].strip("# ").strip() if lines else "Synthesized Summary"
        content = lines[1].strip() if len(lines) > 1 else generated_text
        
        # Create parent node
        parent_create = PyramidNodeCreate(
            project_id=project_id,
            parent_id=None,
            title=title[:500],
            content=content,
            level=max(0, child_nodes[0].level - 1),
            order=0,
            is_generated=True
        )
        parent = crud_pyramid.create(db, obj_in=parent_create)
        
        # Update children to point to new parent
        for child in child_nodes:
            child.parent_id = parent.id
            db.add(child)
        db.commit()
        
        return parent
    
    @staticmethod
    def check_coherence(
        db: Session,
        *,
        node: PyramidNode,
        user_id: UUID
    ) -> PyramidCoherenceCheck:
        """
        Check coherence of a pyramid node with its parent and children.
        
        Args:
            db: Database session
            node: Pyramid node to check
            user_id: User ID for LLM service
            
        Returns:
            Coherence check result
        """
        # Get LLM service
        llm_service = get_llm_service(db, user_id)
        
        # Get parent and children
        parent = db.query(PyramidNode).filter(PyramidNode.id == node.parent_id).first() if node.parent_id else None
        children = crud_pyramid.get_by_parent(db, parent_id=node.id)
        
        # Build context
        context_parts = [f"Current: {node.title}\n{node.content}"]
        if parent:
            context_parts.append(f"Parent: {parent.title}")
        if children:
            context_parts.append(f"Children: {', '.join([c.title for c in children])}")
        
        context = "\n\n".join(context_parts)
        instructions = "Analyze this pyramid structure for coherence. List any issues and suggestions."
        
        result = llm_service.analyze_text(
            project_id=node.project_id,
            text=context,
            analysis_type="coherence_check",
            user_instructions=instructions
        )
        
        analysis = result.get("analysis", {})
        
        # Simple parsing of analysis
        is_coherent = "coherent" in analysis.get("summary", "").lower()
        issues = analysis.get("issues", [])
        suggestions = analysis.get("suggestions", [])
        
        return PyramidCoherenceCheck(
            node_id=node.id,
            is_coherent=is_coherent,
            issues=issues if isinstance(issues, list) else [],
            suggestions=suggestions if isinstance(suggestions, list) else []
        )


pyramid_llm_service = PyramidLLMService()
