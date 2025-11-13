# Architecture du Système de Balisage Sémantique

Document d'architecture technique pour l'implémentation du système de balisage hybride Markdown/XML avec résolution automatique d'entités.

## Vue d'Ensemble

Le système de balisage permet d'annoter sémantiquement le texte narratif avec des balises pour personnages, lieux, événements, thèmes, etc. Il offre trois modes d'affichage (brut/coloré/code) et une résolution automatique d'entités via fuzzy matching et LLM.

### Objectifs

1. **Balisage intuitif** : Syntaxe simple (Markdown-like et XML-like)
2. **Résolution automatique** : Liens automatiques vers entités existantes
3. **Multi-vues** : Trois modes d'affichage pour différents usages
4. **Intégration** : Liens avec pyramide, timeline et entités
5. **Performance** : Parsing rapide et recherche optimisée

## Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Text Renderer│  │ Mode Switch  │  │ Autocomplete │      │
│  │ (3 modes)    │  │ (B/C/R)      │  │ Extension    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│  ┌────────▼────────────────▼──────────────────▼──────┐      │
│  │          Client-Side Parser (Markdown/XML)        │      │
│  └────────────────────────┬──────────────────────────┘      │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP API
┌───────────────────────────▼──────────────────────────────────┐
│                     Backend (FastAPI)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Tag Parser   │  │ Entity       │  │ LLM Service  │      │
│  │ Service      │  │ Resolver     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│  ┌────────▼────────────────▼──────────────────▼──────┐      │
│  │              Database (PostgreSQL)                │      │
│  │  - Tags                                           │      │
│  │  - EntityResolutions                              │      │
│  │  - Characters, Places, Events                     │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Syntaxe de Balisage

### Format Markdown-like (Recommandé)

```markdown
[[character:Milo]]
[[place:Plaine Noire]]
[[event:Combat contre la Hyène]]
[[theme:Mérite]]
[[note:Commentaire auteur]]
```

### Format XML-like (Alternatif)

```xml
<character>Milo</character>
<place>Plaine Noire</place>
<event>Combat contre la Hyène</event>
<theme>Mérite</theme>
<note>Commentaire auteur</note>
```

### Attributs Optionnels

```markdown
[[character:Milo|id=milo-123|level=high]]
[[event:Combat|timeline-id=event-456]]
```

## Modèles de Données

### Backend (PostgreSQL)

#### Table `tags`

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,  -- character, place, event, theme, note, link
    text VARCHAR(500) NOT NULL,  -- Texte de la balise
    start_pos INTEGER NOT NULL,  -- Position de début dans le texte
    end_pos INTEGER NOT NULL,    -- Position de fin
    attributes JSONB,            -- Attributs optionnels (id, level, timeline-id)
    resolved_entity_id UUID,     -- ID de l'entité résolue (peut être NULL)
    resolved_entity_type VARCHAR(50),  -- Type d'entité (character, place, event)
    resolution_confidence FLOAT, -- Score de confiance (0-1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_document ON tags(document_id);
CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_resolved_entity ON tags(resolved_entity_id, resolved_entity_type);
```

#### Table `entity_resolutions`

```sql
CREATE TABLE entity_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,  -- character, place, event
    method VARCHAR(50) NOT NULL,       -- fuzzy, llm, manual
    confidence FLOAT NOT NULL,         -- Score 0-1
    metadata JSONB,                    -- Détails de la résolution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resolutions_tag ON entity_resolutions(tag_id);
CREATE INDEX idx_resolutions_entity ON entity_resolutions(entity_id, entity_type);
```

### Frontend (TypeScript)

```typescript
// Types pour les balises
export type TagType = 'character' | 'place' | 'event' | 'theme' | 'note' | 'link';

export interface Tag {
  id: string;
  type: TagType;
  text: string;
  startPos: number;
  endPos: number;
  attributes?: Record<string, string>;
  resolvedEntity?: {
    id: string;
    type: string;
    name: string;
    confidence: number;
  };
}

export interface ParsedText {
  raw: string;
  tags: Tag[];
}

// Modes d'affichage
export type DisplayMode = 'raw' | 'colored' | 'code';
```

## Composants Frontend

### 1. Parser Client

**Fichier** : `client/src/lib/tagParser.ts`

**Responsabilités** :
- Parser les balises Markdown-like et XML-like
- Extraire les attributs
- Générer la structure de tags

**Algorithme** :
```typescript
function parseText(text: string): ParsedText {
  const tags: Tag[] = [];
  
  // Regex pour [[type:text|attr=val]]
  const markdownRegex = /\[\[(\w+):([^\]|]+)(\|[^\]]+)?\]\]/g;
  
  // Regex pour <type attr="val">text</type>
  const xmlRegex = /<(\w+)([^>]*)>([^<]+)<\/\1>/g;
  
  // Parser Markdown-like
  let match;
  while ((match = markdownRegex.exec(text)) !== null) {
    tags.push({
      type: match[1] as TagType,
      text: match[2],
      startPos: match.index,
      endPos: match.index + match[0].length,
      attributes: parseAttributes(match[3])
    });
  }
  
  // Parser XML-like
  while ((match = xmlRegex.exec(text)) !== null) {
    tags.push({
      type: match[1] as TagType,
      text: match[3],
      startPos: match.index,
      endPos: match.index + match[0].length,
      attributes: parseAttributes(match[2])
    });
  }
  
  return { raw: text, tags };
}
```

### 2. Text Renderer

**Fichier** : `client/src/components/TextRenderer.tsx`

**Responsabilités** :
- Afficher le texte selon le mode choisi
- Gérer les interactions (hover, click)
- Appliquer les styles

**Modes** :

#### Mode Brut (Raw)
```typescript
function renderRaw(parsed: ParsedText): string {
  let result = parsed.raw;
  // Supprimer toutes les balises
  for (const tag of parsed.tags.reverse()) {
    result = result.substring(0, tag.startPos) + 
             tag.text + 
             result.substring(tag.endPos);
  }
  return result;
}
```

#### Mode Coloré (Colored)
```typescript
function renderColored(parsed: ParsedText): JSX.Element {
  const segments = [];
  let lastPos = 0;
  
  for (const tag of parsed.tags) {
    // Texte avant la balise
    if (tag.startPos > lastPos) {
      segments.push(parsed.raw.substring(lastPos, tag.startPos));
    }
    
    // Balise avec highlight
    segments.push(
      <TagHighlight
        key={tag.id}
        tag={tag}
        onClick={() => navigateToEntity(tag)}
        onHover={() => showTooltip(tag)}
      >
        {tag.text}
      </TagHighlight>
    );
    
    lastPos = tag.endPos;
  }
  
  // Texte après la dernière balise
  if (lastPos < parsed.raw.length) {
    segments.push(parsed.raw.substring(lastPos));
  }
  
  return <>{segments}</>;
}
```

**Couleurs par type** :
```css
.tag-character { background-color: rgba(59, 130, 246, 0.2); color: #1e40af; }
.tag-place { background-color: rgba(34, 197, 94, 0.2); color: #15803d; }
.tag-event { background-color: rgba(249, 115, 22, 0.2); color: #c2410c; }
.tag-theme { background-color: rgba(168, 85, 247, 0.2); color: #6b21a8; }
.tag-note { background-color: rgba(156, 163, 175, 0.2); color: #374151; }
```

#### Mode Code (Code)
```typescript
function renderCode(parsed: ParsedText): JSX.Element {
  return (
    <pre className="language-markdown">
      <code>{parsed.raw}</code>
    </pre>
  );
}
```

### 3. Mode Switch

**Fichier** : `client/src/components/ModeSwitch.tsx`

```typescript
export function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className="flex gap-2 p-2 bg-muted rounded-lg">
      <Button
        variant={mode === 'raw' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('raw')}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Brut
      </Button>
      <Button
        variant={mode === 'colored' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('colored')}
      >
        <Palette className="w-4 h-4 mr-2" />
        Coloré
      </Button>
      <Button
        variant={mode === 'code' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('code')}
      >
        <Code className="w-4 h-4 mr-2" />
        Code
      </Button>
    </div>
  );
}
```

### 4. Auto-Complétion TipTap

**Fichier** : `client/src/components/editor/TagAutocomplete.ts`

**Extension TipTap personnalisée** :

```typescript
import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';

export const TagAutocomplete = Extension.create({
  name: 'tagAutocomplete',
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '[[',  // Déclencheur
        pluginKey: new PluginKey('tagAutocomplete'),
        
        // Recherche des suggestions
        items: async ({ query }) => {
          const response = await fetch(
            `/api/v1/tags/autocomplete?q=${query}`
          );
          return response.json();
        },
        
        // Rendu du menu
        render: () => {
          let component;
          return {
            onStart: (props) => {
              component = new SuggestionMenu(props);
            },
            onUpdate: (props) => {
              component.update(props);
            },
            onExit: () => {
              component.destroy();
            }
          };
        },
        
        // Insertion de la balise
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent(`[[${props.type}:${props.name}]]`)
            .run();
        }
      })
    ];
  }
});
```

## Services Backend

### 1. Tag Parser Service

**Fichier** : `backend/app/services/tag_parser.py`

```python
import re
from typing import List, Dict, Any
from app.models.tag import Tag

class TagParserService:
    """Service pour parser les balises dans le texte"""
    
    # Regex pour [[type:text|attr=val]]
    MARKDOWN_PATTERN = r'\[\[(\w+):([^\]|]+)(\|[^\]]+)?\]\]'
    
    # Regex pour <type attr="val">text</type>
    XML_PATTERN = r'<(\w+)([^>]*)>([^<]+)</\1>'
    
    def parse_text(self, text: str, document_id: str) -> List[Tag]:
        """Parse le texte et extrait les balises"""
        tags = []
        
        # Parser Markdown-like
        for match in re.finditer(self.MARKDOWN_PATTERN, text):
            tag = Tag(
                document_id=document_id,
                type=match.group(1),
                text=match.group(2),
                start_pos=match.start(),
                end_pos=match.end(),
                attributes=self._parse_attributes(match.group(3))
            )
            tags.append(tag)
        
        # Parser XML-like
        for match in re.finditer(self.XML_PATTERN, text):
            tag = Tag(
                document_id=document_id,
                type=match.group(1),
                text=match.group(3),
                start_pos=match.start(),
                end_pos=match.end(),
                attributes=self._parse_xml_attributes(match.group(2))
            )
            tags.append(tag)
        
        return tags
    
    def _parse_attributes(self, attr_string: str) -> Dict[str, Any]:
        """Parse les attributs |key=val|key2=val2"""
        if not attr_string:
            return {}
        
        attrs = {}
        for pair in attr_string.strip('|').split('|'):
            if '=' in pair:
                key, val = pair.split('=', 1)
                attrs[key.strip()] = val.strip()
        return attrs
    
    def _parse_xml_attributes(self, attr_string: str) -> Dict[str, Any]:
        """Parse les attributs XML key="val" key2="val2" """
        attrs = {}
        for match in re.finditer(r'(\w+)="([^"]*)"', attr_string):
            attrs[match.group(1)] = match.group(2)
        return attrs
```

### 2. Entity Resolver Service

**Fichier** : `backend/app/services/entity_resolver.py`

```python
from typing import List, Optional, Tuple
from fuzzywuzzy import fuzz
from app.services.ai_service import AIService
from app.models.character import Character
from app.models.place import Place
from app.models.event import Event

class EntityResolverService:
    """Service pour résoudre automatiquement les entités"""
    
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
        self.fuzzy_threshold = 80  # Score minimum pour fuzzy match
        self.llm_threshold = 0.7   # Confiance minimum pour LLM
    
    async def resolve_entity(
        self,
        tag_text: str,
        tag_type: str,
        project_id: str
    ) -> Optional[Tuple[str, str, float, str]]:
        """
        Résout une entité via fuzzy matching puis LLM si nécessaire
        
        Returns:
            (entity_id, entity_type, confidence, method) ou None
        """
        
        # 1. Essayer fuzzy matching
        fuzzy_result = await self._fuzzy_match(tag_text, tag_type, project_id)
        if fuzzy_result and fuzzy_result[2] >= self.fuzzy_threshold:
            return (*fuzzy_result, 'fuzzy')
        
        # 2. Si fuzzy échoue, essayer LLM
        llm_result = await self._llm_resolve(tag_text, tag_type, project_id)
        if llm_result and llm_result[2] >= self.llm_threshold:
            return (*llm_result, 'llm')
        
        return None
    
    async def _fuzzy_match(
        self,
        text: str,
        entity_type: str,
        project_id: str
    ) -> Optional[Tuple[str, str, float]]:
        """Recherche fuzzy dans la base de données"""
        
        # Récupérer les entités du projet
        entities = await self._get_entities(entity_type, project_id)
        
        best_match = None
        best_score = 0
        
        for entity in entities:
            # Calculer le score de similarité
            score = fuzz.ratio(text.lower(), entity.name.lower())
            
            if score > best_score:
                best_score = score
                best_match = entity
        
        if best_match and best_score >= self.fuzzy_threshold:
            return (best_match.id, entity_type, best_score / 100.0)
        
        return None
    
    async def _llm_resolve(
        self,
        text: str,
        entity_type: str,
        project_id: str
    ) -> Optional[Tuple[str, str, float]]:
        """Résolution via LLM pour entités ambiguës"""
        
        # Récupérer les entités candidates
        entities = await self._get_entities(entity_type, project_id)
        
        if not entities:
            return None
        
        # Construire le prompt
        entity_list = "\n".join([
            f"- {e.id}: {e.name} ({e.description[:100]}...)"
            for e in entities
        ])
        
        prompt = f"""Résous l'entité suivante dans le contexte du projet:

Texte: "{text}"
Type: {entity_type}

Entités disponibles:
{entity_list}

Réponds au format JSON:
{{
  "entity_id": "uuid ou null",
  "confidence": 0.0-1.0,
  "reasoning": "explication"
}}

Si aucune entité ne correspond, retourne null pour entity_id.
"""
        
        # Appeler le LLM
        response = await self.ai_service.complete(prompt)
        result = json.loads(response)
        
        if result["entity_id"] and result["confidence"] >= self.llm_threshold:
            return (result["entity_id"], entity_type, result["confidence"])
        
        return None
    
    async def _get_entities(self, entity_type: str, project_id: str):
        """Récupère les entités selon le type"""
        if entity_type == 'character':
            return await Character.get_by_project(project_id)
        elif entity_type == 'place':
            return await Place.get_by_project(project_id)
        elif entity_type == 'event':
            return await Event.get_by_project(project_id)
        return []
```

### 3. Endpoints API

**Fichier** : `backend/app/api/v1/endpoints/tags.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from app.services.tag_parser import TagParserService
from app.services.entity_resolver import EntityResolverService

router = APIRouter()

@router.post("/documents/{document_id}/parse")
async def parse_document_tags(
    document_id: str,
    parser: TagParserService = Depends()
):
    """Parse le texte du document et extrait les balises"""
    document = await Document.get(document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    
    tags = parser.parse_text(document.content, document_id)
    
    # Sauvegarder les tags
    for tag in tags:
        await tag.save()
    
    return {"tags": [tag.dict() for tag in tags]}

@router.post("/documents/{document_id}/resolve")
async def resolve_document_entities(
    document_id: str,
    resolver: EntityResolverService = Depends()
):
    """Résout automatiquement les entités des balises"""
    tags = await Tag.get_by_document(document_id)
    
    resolutions = []
    for tag in tags:
        result = await resolver.resolve_entity(
            tag.text,
            tag.type,
            tag.document.project_id
        )
        
        if result:
            entity_id, entity_type, confidence, method = result
            tag.resolved_entity_id = entity_id
            tag.resolved_entity_type = entity_type
            tag.resolution_confidence = confidence
            await tag.save()
            
            resolutions.append({
                "tag_id": tag.id,
                "entity_id": entity_id,
                "confidence": confidence,
                "method": method
            })
    
    return {"resolutions": resolutions}

@router.post("/tags/autocomplete")
async def autocomplete_tags(
    q: str,
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Auto-complétion pour les balises"""
    suggestions = []
    
    # Rechercher dans les personnages
    characters = await Character.search(q, project_id)
    suggestions.extend([
        {"type": "character", "name": c.name, "id": c.id}
        for c in characters
    ])
    
    # Rechercher dans les lieux
    places = await Place.search(q, project_id)
    suggestions.extend([
        {"type": "place", "name": p.name, "id": p.id}
        for p in places
    ])
    
    # Rechercher dans les événements
    events = await Event.search(q, project_id)
    suggestions.extend([
        {"type": "event", "name": e.title, "id": e.id}
        for e in events
    ])
    
    return {"suggestions": suggestions[:10]}  # Limiter à 10 résultats
```

## Intégration avec l'Existant

### 1. Pyramide

- Ajouter un filtre par niveau (`level` attribute)
- Afficher les tags dans chaque nœud pyramidal
- Propager les tags lors de l'expand/summarize

### 2. Timeline

- Lier automatiquement les tags `event` à la timeline
- Afficher les tags dans les événements
- Permettre la création d'événements depuis les tags

### 3. Entités

- Synchroniser les modifications d'entités avec les tags
- Afficher les occurrences de tags dans les fiches entités
- Permettre la navigation bidirectionnelle

## Performance et Optimisation

### Caching

- Cache des résolutions d'entités (Redis)
- Cache des suggestions d'auto-complétion
- Invalidation lors de modifications d'entités

### Indexes Base de Données

- Index sur `document_id`, `type`, `resolved_entity_id`
- Index full-text sur `text` pour recherche rapide

### Lazy Loading

- Charger les tags uniquement quand nécessaire
- Parser à la demande (pas à chaque affichage)

## Tests

### Tests Unitaires

- Parser Markdown et XML
- Fuzzy matching
- LLM resolution
- Modes d'affichage

### Tests d'Intégration

- Parsing + résolution end-to-end
- Auto-complétion
- Synchronisation avec entités

### Tests de Performance

- Parsing de documents longs (>10k mots)
- Résolution de nombreuses entités (>100)
- Auto-complétion rapide (<100ms)

## Migration et Déploiement

### Étapes

1. Créer les tables `tags` et `entity_resolutions`
2. Ajouter les endpoints API
3. Implémenter le parser frontend
4. Ajouter l'auto-complétion TipTap
5. Créer l'interface de switch
6. Intégrer avec pyramide/timeline
7. Tests complets
8. Documentation utilisateur

### Rollback

- Les tags sont optionnels (pas de breaking change)
- Possibilité de désactiver la fonctionnalité via feature flag
- Migration réversible

## Conclusion

Cette architecture fournit un système de balisage complet, performant et extensible. Elle s'intègre naturellement avec l'existant tout en offrant de nouvelles capacités puissantes pour l'annotation sémantique du texte narratif.

**Estimation de développement** : 40-60 heures
**Complexité** : Moyenne-Élevée
**Impact** : Élevé (fonctionnalité majeure)
