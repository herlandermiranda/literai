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
    
    def __init__(self, db: Session, use_mock: bool = None):
        """
        Initialize LLM service.
        
        Args:
            db: Database session
            use_mock: Whether to use mock mode. If None, reads from environment.
        """
        self.db = db
        
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
        user_id: UUID,
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
            user_id: User ID
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
            user_id=user_id,
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
                "description": e.description or ""
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
                "title": a.title,
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
                "date_display": e.date_display or ""
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

**Option 5 - Dimension psychologique (approche introspective)**
La silhouette pourrait représenter quelque chose de plus symbolique – un fantôme du passé, une hallucination, ou une manifestation des peurs intérieures de la protagoniste, ajoutant une couche de profondeur psychologique à la scène.

Chaque option offre des possibilités différentes pour le développement des personnages et de l'intrigue. Le choix dépendra de la direction que vous souhaitez donner à votre récit et du rythme que vous voulez maintenir.
""",
            LLMRequestType.ANALYSIS: """**Analyse de la scène**

**Points forts :**
1. **Atmosphère réussie** : La description crée efficacement une ambiance de suspense et de mystère. L'utilisation de détails sensoriels (pénombre, odeur métallique, silence) immerge le lecteur.

2. **Rythme maîtrisé** : La progression est bien dosée, avec une montée graduelle de la tension à travers les actions de la protagoniste.

3. **Dialogue efficace** : Les répliques sont courtes et percutantes, renforçant le suspense sans ralentir le rythme.

**Axes d'amélioration :**
1. **Caractérisation de la protagoniste** : On pourrait enrichir la scène en révélant davantage sur son état émotionnel ou ses motivations. Pourquoi est-elle là ? Qu'espère-t-elle ou craint-elle de trouver ?

2. **Détails sensoriels supplémentaires** : Bien que l'atmosphère soit présente, on pourrait ajouter des éléments tactiles (température de la pièce, texture sous ses pieds) ou auditifs (craquements, respiration) pour renforcer l'immersion.

3. **Voix narrative** : Le style est solide mais pourrait être plus distinctif. Considérez d'intensifier la voix narrative pour qu'elle reflète mieux la personnalité unique de votre protagoniste.

4. **Réaction physique** : La mention du couteau est excellente, mais on pourrait développer davantage les réactions corporelles de la protagoniste (tremblements, sueur, tension musculaire) pour renforcer l'impact émotionnel.

**Suggestions spécifiques :**
- Envisagez de varier la longueur des phrases pour créer un rythme plus dynamique
- La révélation finale ("Je vous attendais") est forte, mais pourrait être précédée d'un détail visuel ou sonore supplémentaire pour maximiser son impact
- Considérez l'ajout d'un élément de backstory subtil qui enrichirait la compréhension de la situation sans ralentir l'action

Dans l'ensemble, c'est une scène efficace qui remplit bien sa fonction narrative. Avec quelques ajustements pour approfondir la caractérisation et enrichir les détails sensoriels, elle pourrait devenir vraiment mémorable.
""",
            LLMRequestType.CHARACTER_DEVELOPMENT: """**Développement du personnage**

**Profil psychologique approfondi :**

**Traits de personnalité fondamentaux :**
- **Courage pragmatique** : Elle n'est pas téméraire, mais elle agit malgré sa peur. Le fait qu'elle ait pris un couteau montre qu'elle se prépare aux dangers plutôt que de les nier.
- **Vigilance** : Son attention aux détails (odeur métallique, silence) suggère quelqu'un d'observateur, peut-être formé ou habitué aux situations dangereuses.
- **Détermination** : Elle avance malgré sa nervosité, ce qui indique une forte motivation sous-jacente.

**Backstory suggérée :**
Pour justifier ces traits, elle pourrait avoir :
- Une expérience passée de danger ou de trahison qui l'a rendue méfiante mais résiliente
- Une formation (militaire, policière, ou autodidacte) qui explique sa préparation
- Une mission personnelle importante qui justifie qu'elle prenne ces risques

**Arc de développement potentiel :**
1. **Point de départ** : Compétente mais isolée, se fiant uniquement à elle-même
2. **Défi central** : Apprendre à faire confiance à nouveau tout en naviguant dans un monde dangereux
3. **Évolution** : Découvrir que la force vient aussi de la vulnérabilité et des connexions humaines
4. **Transformation** : Devenir une leader qui protège les autres tout en restant fidèle à sa nature prudente

**Conflits internes :**
- Tension entre le besoin de contrôle et l'impossibilité de tout prévoir
- Lutte entre l'isolement protecteur et le désir de connexion humaine
- Questionnement sur la ligne entre prudence et paranoïa

**Relations et dynamiques :**
- Avec la silhouette : Cette rencontre pourrait forcer une confrontation avec ses peurs ou ses préjugés
- Avec d'autres personnages : Elle pourrait jouer le rôle de protectrice réticente, créant des tensions intéressantes
- Avec elle-même : Un dialogue interne constant entre instinct et raison

**Voix et manières distinctives :**
- Langage précis, économe en mots
- Gestes calculés, peu de mouvements superflus
- Humour sec comme mécanisme de défense
- Observation constante de son environnement

Ce développement crée un personnage complexe et crédible qui peut porter une narration sur le long terme tout en offrant de nombreuses possibilités d'évolution et de conflit.
""",
            LLMRequestType.WORLDBUILDING: """**Éléments de worldbuilding**

**Contexte géographique et architectural :**
La maison semble être une demeure ancienne, probablement située dans une zone isolée ou un quartier délaissé. L'architecture suggère :
- Construction du XIXe siècle avec cheminée et fenêtres à carreaux
- Plusieurs pièces interconnectées avec des portes épaisses
- Isolation phonique naturelle due aux murs épais
- Possibilité de passages secrets ou de pièces cachées typiques de l'époque

**Atmosphère et ambiance du lieu :**
- **Histoire du bâtiment** : Cette maison a probablement connu plusieurs propriétaires, chacun laissant sa marque. Les murs pourraient receler des secrets, des cachettes, des messages gravés.
- **État actuel** : L'abandon apparent (poussière, air renfermé) suggère que le lieu n'est plus habité régulièrement, mais la bougie allumée indique une présence récente.
- **Réputation locale** : Dans le voisinage, cette maison pourrait avoir une réputation – lieu de rencontres clandestines, refuge pour marginaux, ou simplement une curiosité architecturale évitée par les superstitieux.

**Contexte social et temporel :**
- **Époque** : L'utilisation de bougies comme éclairage principal suggère soit une époque historique, soit un contexte où l'électricité n'est pas fiable ou volontairement évitée.
- **Société** : Un monde où les gens ont besoin de se cacher, de se rencontrer en secret, où la méfiance est justifiée.
- **Codes sociaux** : Le fait que la protagoniste porte un couteau suggère une société où l'auto-défense est nécessaire et acceptée.

**Système de pouvoir et d'organisation :**
- Présence possible d'organisations clandestines ou de réseaux secrets
- Autorités officielles peut-être corrompues ou inefficaces
- Nécessité pour les individus de se protéger eux-mêmes

**Éléments sensoriels distinctifs du monde :**
- **Odeurs** : Métallique (sang ? métal ? alchimie ?), renfermé, cire de bougie
- **Sons** : Silence inhabituel, absence de bruits urbains normaux
- **Lumière** : Pénombre constante, dépendance aux sources de lumière faibles
- **Texture** : Poussière, bois ancien, pierre froide

**Implications narratives :**
Ce monde semble être un lieu de secrets et de dangers, où les apparences sont trompeuses et où chacun doit être vigilant. Il offre de riches possibilités pour des intrigues de mystère, de conspiration, ou de survie dans un environnement hostile ou moralement ambigu.
""",
            LLMRequestType.DIALOGUE_ENHANCEMENT: """"Y a-t-il quelqu'un ?"

Le silence s'étira, lourd de menaces non formulées. Elle avança, chaque pas résonnant dans le vide.

Puis elle le vit.

"Qui êtes-vous ?" Sa main trouva le manche du couteau. Le métal froid contre sa paume était rassurant.

Un long moment s'écoula. La silhouette ne bougea pas. Quand la voix s'éleva enfin, elle sembla venir de partout à la fois :

"Je vous attendais."

"Vraiment ?" Elle força un sourire dans sa voix, masquant sa peur. "J'aurais apprécié une invitation plus formelle."

"Vous êtes venue quand même."

"La curiosité." Elle fit un pas de côté, cherchant un meilleur angle. "Ou la stupidité. Je n'ai pas encore décidé."

"Vous êtes prudente. C'est bien."

"Prudente ?" Un rire sec lui échappa. "Si j'étais prudente, je ne serais pas ici."

La silhouette bougea enfin, se penchant légèrement en avant. La lumière de la bougie éclaira brièvement un visage – ou plutôt, l'ombre d'un visage.

"Pourtant vous êtes venue armée."

"Vieille habitude." Elle resserra sa prise sur le couteau. "On ne sait jamais qui on va rencontrer dans le noir."

"Sage précaution." Une pause. "Mais insuffisante."

Le ton n'était pas menaçant – c'était pire. C'était l'assurance tranquille de quelqu'un qui contrôle totalement la situation.

Elle déglutit, forçant sa voix à rester ferme :

"Qu'est-ce que vous voulez ?"

"La même chose que vous." La silhouette se leva lentement. "La vérité."
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


def get_llm_service(db: Session, use_mock: bool = None) -> LLMService:
    """
    Factory function to get LLM service instance.
    
    Args:
        db: Database session
        use_mock: Whether to use mock mode. If None, reads from environment.
        
    Returns:
        LLMService instance
    """
    return LLMService(db, use_mock)
