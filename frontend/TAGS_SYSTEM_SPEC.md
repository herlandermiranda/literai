# Spécification Technique du Système de Tags/Balisage Sémantique

## Vue d'Ensemble

Système de balisage hybride Markdown/XML pour taguer des entités narratives (personnages, lieux, événements, thèmes) dans le texte avec résolution automatique vers la base de données et trois modes d'affichage.

## Architecture

### Backend (FastAPI + PostgreSQL)

**Modèles** :
- `Tag` : Représentation d'un tag dans le texte
  - `id`: UUID
  - `document_id`: FK vers Document
  - `entity_type`: Enum (character, place, event, theme)
  - `entity_id`: FK vers Entity (nullable si non résolu)
  - `text_content`: Texte tagué
  - `start_offset`: Position début dans le texte
  - `end_offset`: Position fin dans le texte
  - `confidence`: Float (0-1) pour résolution auto
  - `manually_linked`: Boolean

**Endpoints** :
- `POST /api/v1/tags/resolve` : Résolution automatique d'entités
  - Input : `{ "text": "Milo", "entity_type": "character", "project_id": "..." }`
  - Output : `{ "entity_id": "...", "confidence": 0.95, "suggestions": [...] }`
  - Logique : Fuzzy matching + LLM pour disambiguation

- `GET /api/v1/tags/document/{document_id}` : Récupérer tous les tags d'un document
- `POST /api/v1/tags/` : Créer un tag manuellement
- `PUT /api/v1/tags/{tag_id}` : Mettre à jour un tag
- `DELETE /api/v1/tags/{tag_id}` : Supprimer un tag

**Service de Résolution** :
```python
class EntityResolver:
    def resolve(self, text: str, entity_type: str, project_id: str):
        # 1. Fuzzy matching avec Fuse.js-like (fuzzywuzzy)
        candidates = self.fuzzy_search(text, entity_type, project_id)
        
        # 2. Si ambiguïté, utiliser LLM
        if len(candidates) > 1:
            best_match = self.llm_disambiguate(text, candidates)
            return best_match
        
        # 3. Si aucun match, suggérer création
        if not candidates:
            return None
        
        return candidates[0]
```

### Frontend (React + TipTap)

**Syntaxe de Balisage** :

Format court (Markdown-like) :
```
[[character:Milo]] finit par gagner.
[[place:Plaine Noire]] était déserte.
[[event:Combat contre la Hyène]] fut décisif.
[[theme:Mérite]] est central.
```

Format long (XML-like) :
```xml
<character id="uuid-milo">Milo</character> finit par gagner.
<place id="uuid-plaine">Plaine Noire</place> était déserte.
```

**Parser Client** :

```typescript
interface ParsedTag {
  type: 'character' | 'place' | 'event' | 'theme';
  text: string;
  entityId?: string;
  startOffset: number;
  endOffset: number;
}

class MarkupParser {
  // Parse texte avec balises → AST
  parse(text: string): ParsedTag[]
  
  // Mode Brut : Strip toutes balises
  toPlainText(text: string): string
  
  // Mode Coloré : Génère HTML avec highlights
  toHighlightedHTML(text: string, tags: ParsedTag[]): string
  
  // Mode Code : Affiche balises avec coloration
  toCodeView(text: string): string
}
```

**Composants** :

1. `MarkupEditor.tsx` : Éditeur avec auto-complétion
   - Extension TipTap pour balises
   - Suggestions en temps réel (debounced API calls)
   - Highlighting inline

2. `ViewModeSwitcher.tsx` : Switch entre modes
   - Boutons : Brut / Coloré / Code
   - Sauvegarde du mode préféré

3. `EntityTooltip.tsx` : Tooltip au survol
   - Affiche infos entité
   - Lien vers fiche détaillée

4. `TagResolutionPanel.tsx` : Panel pour tags non résolus
   - Liste tags avec faible confidence
   - Interface pour lier manuellement

## Workflow Utilisateur

### Mode Édition (Coloré par défaut)

1. Utilisateur tape `[[char` → Auto-complétion suggère `[[character:...]]`
2. Utilisateur tape `[[character:Milo]]` → API résout automatiquement
3. Si résolu : Highlight bleu + tooltip au survol
4. Si non résolu : Highlight orange + suggestion de lier manuellement

### Switch de Mode

- **Brut** : Pour lecture immersive, export PDF/ePub
- **Coloré** : Pour navigation et édition (par défaut)
- **Code** : Pour édition technique des balises

## Couleurs par Type

- **Personnages** : Bleu (#3b82f6)
- **Lieux** : Vert (#10b981)
- **Événements** : Rouge (#ef4444)
- **Thèmes** : Violet (#8b5cf6)
- **Non résolu** : Orange (#f59e0b)

## Intégration avec Pyramide/Timeline

- Tags dans nœuds pyramidaux → Liens automatiques vers timeline
- Changement dans texte → Update tags via BDD sync
- Timeline events → Suggérés pour auto-tagging

## Technologies

**Backend** :
- `fuzzywuzzy` : Fuzzy string matching
- `python-Levenshtein` : Accélération fuzzy matching
- Service LLM existant pour disambiguation

**Frontend** :
- Extension TipTap custom pour balises
- `react-markdown` pour mode code
- CSS custom pour highlights

## MVP Scope

**Phase 1** (Actuelle) :
- ✅ Parser basique (regex)
- ✅ Mode Brut (strip tags)
- ✅ Mode Coloré (highlights simples)
- ✅ Résolution manuelle

**Phase 2** (Future) :
- ⏳ Résolution automatique (fuzzy + LLM)
- ⏳ Auto-complétion TipTap
- ⏳ Mode Code avec coloration syntaxique
- ⏳ Intégration timeline/pyramide

## Exemple Concret

**Texte original** :
```
Milo finit par gagner. Pas par la force, mais par l'usure.
La Plaine Noire s'étendait devant lui.
```

**Avec balises** :
```
[[character:Milo]] finit par gagner. Pas par la force, mais par l'usure.
[[place:Plaine Noire]] s'étendait devant lui.
```

**Mode Brut** :
```
Milo finit par gagner. Pas par la force, mais par l'usure.
La Plaine Noire s'étendait devant lui.
```

**Mode Coloré** :
```html
<span class="tag-character" data-entity-id="uuid-milo">Milo</span> finit par gagner...
<span class="tag-place" data-entity-id="uuid-plaine">Plaine Noire</span> s'étendait...
```

**Mode Code** :
```
[[character:Milo|id=uuid-milo]] finit par gagner...
[[place:Plaine Noire|id=uuid-plaine]] s'étendait...
```
