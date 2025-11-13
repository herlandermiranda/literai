"""
LLM Service for literary writing assistance.

This service handles all interactions with LLM APIs, with support for both
mock mode (for testing) and production mode (with real API calls).

The service is designed to be easily switchable between modes via environment
variable, and all prompts are centralized in prompts.py for easy adjustment.
"""
import os
import json
import time
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services import prompts
from app.models.llm_request import LLMRequest, LLMRequestType, LLMRequestStatus
from app.crud.crud_project import project as project_crud
from app.crud.crud_entity import entity as entity_crud
from app.crud.crud_arc import arc as arc_crud
from app.crud.crud_timeline import timeline_event as timeline_event_crud


class LLMService:
    """
    Service for LLM interactions with mock and production modes.
    
    Mock mode generates realistic but fake responses for testing.
    Production mode uses real OpenAI API calls.
    """
    
    def __init__(self, db: Session, user_id: UUID, use_mock: bool = None):
        """
        Initialize LLM service.
        
        Args:
            db: Database session
            user_id: Current user ID
            use_mock: Whether to use mock mode. If None, reads from environment.
        """
        self.db = db
        self.user_id = user_id
        
        # Determine mode from parameter or environment
        if use_mock is None:
            self.use_mock = os.getenv("LLM_MOCK_MODE", "true").lower() == "true"
        else:
            self.use_mock = use_mock
        
        # Initialize OpenAI client only in production mode
        self.client = None
        if not self.use_mock:
            try:
                from openai import OpenAI
                self.client = OpenAI()  # Uses OPENAI_API_KEY from environment
            except ImportError:
                raise ImportError("OpenAI package not installed. Run: pip install openai")
    
    def _log_request(
        self,
        project_id: UUID,
        request_type: LLMRequestType,
        prompt: str,
        response: str,
        model: str,
        tokens_used: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> LLMRequest:
        """
        Log an LLM request to the database.
        
        Args:
            project_id: Project ID
            request_type: Type of request
            prompt: Full prompt sent to LLM
            response: Response from LLM
            model: Model used
            tokens_used: Number of tokens used
            metadata: Additional metadata
            
        Returns:
            Created LLMRequest instance
        """
        llm_request = LLMRequest(
            project_id=project_id,
            user_id=self.user_id,
            type=request_type,
            model=model,
            status=LLMRequestStatus.COMPLETED,
            input_tokens=tokens_used // 2 if tokens_used else 0,
            output_tokens=tokens_used // 2 if tokens_used else 0,
            request_payload={"prompt": prompt, **metadata} if metadata else {"prompt": prompt},
            response_payload={"response": response}
        )
        self.db.add(llm_request)
        self.db.commit()
        self.db.refresh(llm_request)
        return llm_request
    
    def _get_project_context(self, project_id: UUID) -> Dict[str, Any]:
        """
        Get project context for LLM prompts.
        
        Args:
            project_id: Project ID
            
        Returns:
            Dictionary with project context
        """
        project = project_crud.get(self.db, id=project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        
        return {
            "project_title": project.title,
            "language": project.language,
            "genre": project.description or "General Fiction"
        }
    
    def _get_entities_context(self, project_id: UUID, entity_ids: Optional[List[UUID]] = None) -> str:
        """
        Get entity context for LLM prompts.
        
        Args:
            project_id: Project ID
            entity_ids: Optional list of specific entity IDs to include
            
        Returns:
            Formatted entity context string
        """
        if entity_ids:
            entities = [entity_crud.get(self.db, id=eid) for eid in entity_ids]
            entities = [e for e in entities if e is not None]
        else:
            entities = entity_crud.get_by_project(self.db, project_id=project_id, limit=50)
        
        entity_dicts = [
            {
                "name": e.name,
                "type": e.type.value,
                "description": e.summary or ""
            }
            for e in entities
        ]
        
        return prompts.build_entity_context(entity_dicts)
    
    def _get_arcs_context(self, project_id: UUID, arc_ids: Optional[List[UUID]] = None) -> str:
        """
        Get arc context for LLM prompts.
        
        Args:
            project_id: Project ID
            arc_ids: Optional list of specific arc IDs to include
            
        Returns:
            Formatted arc context string
        """
        if arc_ids:
            arcs = [arc_crud.get(self.db, id=aid) for aid in arc_ids]
            arcs = [a for a in arcs if a is not None]
        else:
            arcs = arc_crud.get_by_project(self.db, project_id=project_id, limit=20)
        
        arc_dicts = [
            {
                "title": a.name,
                "description": a.description or ""
            }
            for a in arcs
        ]
        
        return prompts.build_arc_context(arc_dicts)
    
    def _get_timeline_context(self, project_id: UUID, event_ids: Optional[List[UUID]] = None) -> str:
        """
        Get timeline context for LLM prompts.
        
        Args:
            project_id: Project ID
            event_ids: Optional list of specific event IDs to include
            
        Returns:
            Formatted timeline context string
        """
        if event_ids:
            events = [timeline_event_crud.get(self.db, id=eid) for eid in event_ids]
            events = [e for e in events if e is not None]
        else:
            events = timeline_event_crud.get_by_project(self.db, project_id=project_id, limit=30)
        
        event_dicts = [
            {
                "title": e.title,
                "date_display": e.event_metadata.get('date_string', str(e.date) if e.date else "")
            }
            for e in events
        ]
        
        return prompts.build_timeline_context(event_dicts)
    
    def _call_openai(self, system_prompt: str, user_prompt: str, model: str = "gpt-4.1-mini") -> tuple[str, int]:
        """
        Call OpenAI API.
        
        Args:
            system_prompt: System prompt
            user_prompt: User prompt
            model: Model to use
            
        Returns:
            Tuple of (response_text, tokens_used)
        """
        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        response_text = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        return response_text, tokens_used
    
    def _generate_mock_response(self, request_type: LLMRequestType, user_prompt: str) -> tuple[str, int]:
        """
        Generate a mock response for testing.
        
        Args:
            request_type: Type of request
            user_prompt: User prompt (used to extract context)
            
        Returns:
            Tuple of (mock_response, mock_tokens)
        """
        # Simulate API delay
        time.sleep(0.5)
        
        mock_responses = {
            LLMRequestType.CONTINUATION: """Elle s'arrêta au seuil de la porte, le cœur battant. La pièce était plongée dans une pénombre épaisse, à peine troublée par la lueur vacillante d'une bougie oubliée sur le manteau de la cheminée. L'air sentait le renfermé et quelque chose d'autre, une odeur métallique qu'elle ne parvenait pas à identifier.

"Il y a quelqu'un ?" murmura-t-elle, sa voix tremblante trahissant sa nervosité.

Seul le silence lui répondit, un silence si profond qu'elle pouvait entendre les battements de son propre cœur. Elle fit un pas en avant, puis un autre, ses yeux s'habituant progressivement à l'obscurité. C'est alors qu'elle le vit : une silhouette immobile, assise dans le fauteuil près de la fenêtre.

"Qui êtes-vous ?" demanda-t-elle, sa main cherchant instinctivement le manche du couteau qu'elle avait glissé dans sa poche avant de partir.

La silhouette ne bougea pas, mais une voix grave s'éleva dans l'obscurité :

"Je vous attendais."
""",
            LLMRequestType.REWRITING: """Elle s'immobilisa sur le seuil, le souffle court. Dans la pénombre de la pièce, seule une bougie agonisante jetait des ombres dansantes sur les murs. L'atmosphère était lourde, chargée d'une odeur de renfermé mêlée à quelque chose de plus inquiétant – une senteur métallique qui lui nouait l'estomac.

"Y a-t-il quelqu'un ?" Sa voix n'était qu'un murmure rauque.

Le silence qui suivit était oppressant, presque palpable. Elle avança d'un pas hésitant, puis d'un autre, forçant ses yeux à percer l'obscurité. C'est alors qu'elle distingua la silhouette – une forme humaine, parfaitement immobile, installée dans le fauteuil près de la fenêtre voilée.

Sa main se referma instinctivement sur le manche du couteau dissimulé dans sa poche.

"Qui êtes-vous ?"

La silhouette demeurait figée, mais une voix profonde émergea des ténèbres :

"Je vous attendais."
""",
            LLMRequestType.SUGGESTION: """Voici plusieurs suggestions pour développer cette scène :

**Option 1 - Révélation immédiate (approche directe)**
La silhouette pourrait se révéler être un personnage que le lecteur connaît déjà, créant une surprise ou confirmant des soupçons. Cela permettrait d'avancer rapidement l'intrigue et de créer une confrontation directe.

**Option 2 - Montée de tension (approche suspense)**
Prolonger le mystère en faisant parler la silhouette sans révéler son identité. Elle pourrait donner des indices cryptiques sur ses motivations, créant une atmosphère de menace psychologique avant toute action physique.

**Option 3 - Retournement de situation (approche audacieuse)**
La protagoniste pourrait découvrir que la silhouette est en fait une victime ou un allié inattendu, renversant complètement les attentes du lecteur et ouvrant de nouvelles possibilités narratives.

**Option 4 - Escalade du danger (approche action)**
La silhouette pourrait ne pas être seule. D'autres présences pourraient se révéler dans la pièce, transformant la scène en une situation de danger immédiat nécessitant une réaction rapide de la protagoniste.

Chaque option offre des possibilités différentes pour le développement des personnages et de l'intrigue.
""",
            LLMRequestType.ANALYSIS: """**Analyse de la scène**

**Points forts :**
1. **Atmosphère réussie** : La description crée efficacement une ambiance de suspense et de mystère.
2. **Rythme maîtrisé** : La progression est bien dosée, avec une montée graduelle de la tension.
3. **Dialogue efficace** : Les répliques sont courtes et percutantes.

**Axes d'amélioration :**
1. **Caractérisation** : On pourrait enrichir la scène en révélant davantage sur l'état émotionnel de la protagoniste.
2. **Détails sensoriels** : Ajouter des éléments tactiles ou auditifs renforcerait l'immersion.
3. **Voix narrative** : Le style pourrait être plus distinctif pour refléter la personnalité du protagoniste.
"""
        }
        
        # Get appropriate mock response
        mock_text = mock_responses.get(request_type, "Mock response for testing purposes.")
        mock_tokens = len(mock_text.split()) * 2  # Rough token estimate
        
        return mock_text, mock_tokens
    
    def generate_continuation(
        self,
        project_id: UUID,
        existing_text: str,
        user_instructions: str = "",
        target_length: int = 500,
        entity_ids: Optional[List[UUID]] = None,
        arc_ids: Optional[List[UUID]] = None,
        event_ids: Optional[List[UUID]] = None
    ) -> Dict[str, Any]:
        """
        Generate a continuation of existing text.
        
        Args:
            project_id: Project ID
            existing_text: The text to continue from
            user_instructions: Additional instructions from the user
            target_length: Target length in words
            entity_ids: Optional entity IDs for context
            arc_ids: Optional arc IDs for context
            event_ids: Optional timeline event IDs for context
            
        Returns:
            Dictionary with 'text' and 'request_id' keys
        """
        # Get project context
        project_context = self._get_project_context(project_id)
        
        # Build context strings
        entity_context = self._get_entities_context(project_id, entity_ids)
        arc_context = self._get_arcs_context(project_id, arc_ids)
        timeline_context = self._get_timeline_context(project_id, event_ids)
        
        # Build user prompt
        user_prompt = prompts.CONTINUATION_USER_PROMPT_TEMPLATE.format(
            project_title=project_context["project_title"],
            language=project_context["language"],
            genre=project_context["genre"],
            entity_context=entity_context,
            arc_context=arc_context,
            timeline_context=timeline_context,
            existing_text=existing_text[-2000:],  # Last 2000 chars for context
            user_instructions=user_instructions or "Continue naturally from the existing text.",
            target_length=target_length
        )
        
        # Generate response
        if self.use_mock:
            response_text, tokens_used = self._generate_mock_response(
                LLMRequestType.CONTINUATION, user_prompt
            )
            model = "mock-model"
        else:
            response_text, tokens_used = self._call_openai(
                prompts.CONTINUATION_SYSTEM_PROMPT,
                user_prompt
            )
            model = "gpt-4.1-mini"
        
        # Log request
        llm_request = self._log_request(
            project_id=project_id,
            request_type=LLMRequestType.CONTINUATION,
            prompt=user_prompt,
            response=response_text,
            model=model,
            tokens_used=tokens_used,
            metadata={
                "target_length": target_length,
                "existing_text_length": len(existing_text)
            }
        )
        
        return {
            "text": response_text,
            "request_id": str(llm_request.id)
        }
    
    def rewrite_text(
        self,
        project_id: UUID,
        text_to_rewrite: str,
        rewriting_goals: str,
        user_instructions: str = ""
    ) -> Dict[str, Any]:
        """
        Rewrite text with specific goals.
        
        Args:
            project_id: Project ID
            text_to_rewrite: The text to rewrite
            rewriting_goals: Specific goals for rewriting
            user_instructions: Additional instructions
            
        Returns:
            Dictionary with 'text' and 'request_id' keys
        """
        project_context = self._get_project_context(project_id)
        
        user_prompt = prompts.REWRITING_USER_PROMPT_TEMPLATE.format(
            project_title=project_context["project_title"],
            language=project_context["language"],
            genre=project_context["genre"],
            text_to_rewrite=text_to_rewrite,
            rewriting_goals=rewriting_goals,
            user_instructions=user_instructions or "Improve overall quality while maintaining the core meaning."
        )
        
        if self.use_mock:
            response_text, tokens_used = self._generate_mock_response(
                LLMRequestType.REWRITING, user_prompt
            )
            model = "mock-model"
        else:
            response_text, tokens_used = self._call_openai(
                prompts.REWRITING_SYSTEM_PROMPT,
                user_prompt
            )
            model = "gpt-4.1-mini"
        
        llm_request = self._log_request(
            project_id=project_id,
            request_type=LLMRequestType.REWRITING,
            prompt=user_prompt,
            response=response_text,
            model=model,
            tokens_used=tokens_used,
            metadata={"rewriting_goals": rewriting_goals}
        )
        
        return {
            "text": response_text,
            "request_id": str(llm_request.id)
        }
    
    def get_suggestions(
        self,
        project_id: UUID,
        current_context: str,
        user_question: str,
        entity_ids: Optional[List[UUID]] = None,
        arc_ids: Optional[List[UUID]] = None,
        event_ids: Optional[List[UUID]] = None
    ) -> Dict[str, Any]:
        """
        Get creative suggestions for story development.
        
        Args:
            project_id: Project ID
            current_context: Current story context
            user_question: User's question or challenge
            entity_ids: Optional entity IDs for context
            arc_ids: Optional arc IDs for context
            event_ids: Optional timeline event IDs for context
            
        Returns:
            Dictionary with 'text' and 'request_id' keys
        """
        project_context = self._get_project_context(project_id)
        entity_context = self._get_entities_context(project_id, entity_ids)
        arc_context = self._get_arcs_context(project_id, arc_ids)
        timeline_context = self._get_timeline_context(project_id, event_ids)
        
        user_prompt = prompts.SUGGESTION_USER_PROMPT_TEMPLATE.format(
            project_title=project_context["project_title"],
            language=project_context["language"],
            genre=project_context["genre"],
            entity_context=entity_context,
            arc_context=arc_context,
            timeline_context=timeline_context,
            current_context=current_context,
            user_question=user_question
        )
        
        if self.use_mock:
            response_text, tokens_used = self._generate_mock_response(
                LLMRequestType.SUGGESTION, user_prompt
            )
            model = "mock-model"
        else:
            response_text, tokens_used = self._call_openai(
                prompts.SUGGESTION_SYSTEM_PROMPT,
                user_prompt
            )
            model = "gpt-4.1-mini"
        
        llm_request = self._log_request(
            project_id=project_id,
            request_type=LLMRequestType.SUGGESTION,
            prompt=user_prompt,
            response=response_text,
            model=model,
            tokens_used=tokens_used,
            metadata={"user_question": user_question}
        )
        
        return {
            "text": response_text,
            "request_id": str(llm_request.id)
        }
    
    def analyze_text(
        self,
        project_id: UUID,
        text_to_analyze: str,
        analysis_focus: str,
        user_instructions: str = ""
    ) -> Dict[str, Any]:
        """
        Analyze text with specific focus areas.
        
        Args:
            project_id: Project ID
            text_to_analyze: The text to analyze
            analysis_focus: Specific focus areas for analysis
            user_instructions: Additional instructions
            
        Returns:
            Dictionary with 'text' and 'request_id' keys
        """
        project_context = self._get_project_context(project_id)
        
        user_prompt = prompts.ANALYSIS_USER_PROMPT_TEMPLATE.format(
            project_title=project_context["project_title"],
            language=project_context["language"],
            genre=project_context["genre"],
            text_to_analyze=text_to_analyze,
            analysis_focus=analysis_focus,
            user_instructions=user_instructions or "Provide comprehensive analysis."
        )
        
        if self.use_mock:
            response_text, tokens_used = self._generate_mock_response(
                LLMRequestType.ANALYSIS, user_prompt
            )
            model = "mock-model"
        else:
            response_text, tokens_used = self._call_openai(
                prompts.ANALYSIS_SYSTEM_PROMPT,
                user_prompt
            )
            model = "gpt-4.1-mini"
        
        llm_request = self._log_request(
            project_id=project_id,
            request_type=LLMRequestType.ANALYSIS,
            prompt=user_prompt,
            response=response_text,
            model=model,
            tokens_used=tokens_used,
            metadata={"analysis_focus": analysis_focus}
        )
        
        return {
            "text": response_text,
            "request_id": str(llm_request.id)
        }


def get_llm_service(db: Session, user_id: UUID, use_mock: bool = None) -> LLMService:
    """
    Factory function to get LLM service instance.
    
    Args:
        db: Database session
        user_id: Current user ID
        use_mock: Whether to use mock mode. If None, reads from environment.
        
    Returns:
        LLMService instance
    """
    return LLMService(db, user_id, use_mock)
