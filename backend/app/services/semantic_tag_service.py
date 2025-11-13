"""
Semantic tag service for parsing and resolving tags in text.
"""
import re
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from fuzzywuzzy import fuzz

from app.models.semantic_tag import Tag, TagType, EntityResolution
from app.models.entity import Entity
from app.crud import tag as crud_tag, entity as crud_entity, entity_resolution as crud_entity_resolution
from app.schemas.semantic_tag import TagCreate


class SemanticTagService:
    """Service for parsing and resolving semantic tags."""
    
    # Regex patterns for tag parsing
    MARKDOWN_PATTERN = r'\[\[(\w+):([^\]]+)\]\]'
    XML_PATTERN = r'<(\w+)>([^<]+)</\1>'
    
    @staticmethod
    def parse_tags(text: str, project_id: UUID, document_id: Optional[UUID] = None) -> List[Tuple[TagType, str, int, int, str]]:
        """
        Parse semantic tags from text.
        
        Args:
            text: Text to parse
            project_id: Project ID
            document_id: Document ID (optional)
            
        Returns:
            List of tuples: (tag_type, tag_name, start_pos, end_pos, syntax)
        """
        tags = []
        
        # Parse Markdown-style tags [[type:name]]
        for match in re.finditer(SemanticTagService.MARKDOWN_PATTERN, text):
            tag_type_str = match.group(1).lower()
            tag_name = match.group(2).strip()
            start_pos = match.start()
            end_pos = match.end()
            
            # Validate tag type
            try:
                tag_type = TagType(tag_type_str)
                tags.append((tag_type, tag_name, start_pos, end_pos, "markdown"))
            except ValueError:
                # Invalid tag type, skip
                pass
        
        # Parse XML-style tags <type>name</type>
        for match in re.finditer(SemanticTagService.XML_PATTERN, text):
            tag_type_str = match.group(1).lower()
            tag_name = match.group(2).strip()
            start_pos = match.start()
            end_pos = match.end()
            
            # Validate tag type
            try:
                tag_type = TagType(tag_type_str)
                tags.append((tag_type, tag_name, start_pos, end_pos, "xml"))
            except ValueError:
                # Invalid tag type, skip
                pass
        
        return tags
    
    @staticmethod
    def resolve_entity(
        db: Session,
        *,
        project_id: UUID,
        tag_name: str,
        tag_type: TagType,
        threshold: int = 80
    ) -> Optional[Entity]:
        """
        Resolve a tag name to an entity using fuzzy matching.
        
        Args:
            db: Database session
            project_id: Project ID
            tag_name: Tag name to resolve
            tag_type: Tag type
            threshold: Minimum match score (0-100)
            
        Returns:
            Matched entity or None
        """
        # Get all entities of the matching type
        entities = crud_entity.get_by_project(db, project_id=project_id)
        
        # Filter by type if it's a character, place, or event
        if tag_type in [TagType.CHARACTER, TagType.PLACE, TagType.EVENT]:
            # Map tag types to entity types
            type_mapping = {
                TagType.CHARACTER: "character",
                TagType.PLACE: "location",
                TagType.EVENT: "event"
            }
            entity_type_str = type_mapping.get(tag_type)
            if entity_type_str:
                entities = [e for e in entities if e.type.value == entity_type_str]
        
        # Fuzzy match
        best_match = None
        best_score = 0
        
        for entity in entities:
            score = fuzz.ratio(tag_name.lower(), entity.name.lower())
            if score > best_score and score >= threshold:
                best_score = score
                best_match = entity
        
        return best_match
    
    @staticmethod
    def create_tags_from_text(
        db: Session,
        *,
        text: str,
        project_id: UUID,
        document_id: Optional[UUID] = None,
        auto_resolve: bool = True
    ) -> List[Tag]:
        """
        Parse text and create tag instances in database.
        
        Args:
            db: Database session
            text: Text to parse
            project_id: Project ID
            document_id: Document ID (optional)
            auto_resolve: Whether to auto-resolve entities
            
        Returns:
            List of created tags
        """
        parsed_tags = SemanticTagService.parse_tags(text, project_id, document_id)
        created_tags = []
        
        for tag_type, tag_name, start_pos, end_pos, syntax in parsed_tags:
            # Auto-resolve entity if requested
            resolved_entity_id = None
            if auto_resolve:
                entity = SemanticTagService.resolve_entity(
                    db,
                    project_id=project_id,
                    tag_name=tag_name,
                    tag_type=tag_type
                )
                if entity:
                    resolved_entity_id = entity.id
            
            # Create tag
            tag_create = TagCreate(
                project_id=project_id,
                document_id=document_id,
                tag_type=tag_type,
                tag_name=tag_name,
                start_position=start_pos,
                end_position=end_pos,
                syntax=syntax,
                resolved_entity_id=resolved_entity_id
            )
            tag = crud_tag.create(db, obj_in=tag_create)
            created_tags.append(tag)
        
        return created_tags
    
    @staticmethod
    def get_autocomplete_suggestions(
        db: Session,
        *,
        project_id: UUID,
        tag_type: TagType,
        partial_name: str,
        limit: int = 10
    ) -> List[str]:
        """
        Get autocomplete suggestions for tag names.
        
        Args:
            db: Database session
            project_id: Project ID
            tag_type: Tag type
            partial_name: Partial tag name
            limit: Maximum number of suggestions
            
        Returns:
            List of suggested tag names
        """
        # Get entities matching the type
        entities = crud_entity.get_by_project(db, project_id=project_id)
        
        # Filter by type
        type_mapping = {
            TagType.CHARACTER: "character",
            TagType.PLACE: "location",
            TagType.EVENT: "event"
        }
        entity_type_str = type_mapping.get(tag_type)
        if entity_type_str:
            entities = [e for e in entities if e.type.value == entity_type_str]
        
        # Fuzzy match and sort by score
        suggestions = []
        for entity in entities:
            score = fuzz.partial_ratio(partial_name.lower(), entity.name.lower())
            if score > 50:  # Minimum threshold
                suggestions.append((entity.name, score))
        
        # Sort by score descending
        suggestions.sort(key=lambda x: x[1], reverse=True)
        
        return [name for name, _ in suggestions[:limit]]


semantic_tag_service = SemanticTagService()
