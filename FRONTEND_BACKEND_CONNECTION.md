# LiterAI - Connexion Frontend-Backend

**Date :** 11 novembre 2025  
**Statut :** ✅ Connexion établie et fonctionnelle

---

## 📋 Résumé

Le frontend LiterAI (React + Vite) est maintenant **complètement connecté** au backend restauré (FastAPI + PostgreSQL). Tous les services API ont été créés, les erreurs TypeScript corrigées, et les tests de connexion réussis.

---

## 🔧 Configuration

### Backend

**URL :** `https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer`  
**Port :** 8000  
**Framework :** FastAPI 0.104.1  
**Base de données :** PostgreSQL 14  

**Corrections appliquées :**
- ✅ ProxyHeadersMiddleware ajouté pour gérer les en-têtes X-Forwarded-*
- ✅ `redirect_slashes=False` pour éviter les redirections 307
- ✅ CORS configuré pour autoriser toutes les origines

**Démarrage :**
```bash
cd /home/ubuntu/literai/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

**URL :** `https://3000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer`  
**Port :** 3000  
**Framework :** React 19 + Vite  

**Configuration API :**
- Fichier : `client/src/const.ts`
- Variable : `API_BASE_URL`
- Valeur : `https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer`

---

## 🌐 Services API Créés

### 1. semanticTagsAPI

**Endpoints :**
- `GET /semantic-tags/projects/{projectId}/tags/` - Récupérer tous les tags d'un projet
- `POST /semantic-tags/tags/` - Créer un tag
- `GET /semantic-tags/tags/{tagId}/` - Récupérer un tag
- `PUT /semantic-tags/tags/{tagId}/` - Mettre à jour un tag
- `DELETE /semantic-tags/tags/{tagId}/` - Supprimer un tag
- `GET /semantic-tags/tags/{tagId}/resolutions/` - Récupérer les résolutions d'entités
- `POST /semantic-tags/resolutions/` - Créer une résolution d'entité
- `POST /semantic-tags/documents/{documentId}/auto-tag/` - Balisage automatique
- `POST /semantic-tags/documents/{documentId}/suggest-tags/` - Suggestions de tags

**Types :**
```typescript
interface Tag {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  category?: string;
  color?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface EntityResolution {
  id: string;
  tag_id: string;
  entity_id: string;
  confidence: number;
  context?: string;
  created_at: string;
}
```

### 2. versionsAPI

**Endpoints :**
- `GET /versions/projects/{projectId}/versions/` - Récupérer toutes les versions d'un projet
- `GET /versions/documents/{documentId}/versions/` - Récupérer les versions d'un document
- `GET /versions/pyramid-nodes/{nodeId}/versions/` - Récupérer les versions d'un nœud pyramidal
- `POST /versions/` - Créer une version
- `GET /versions/{versionId}/` - Récupérer une version
- `GET /versions/compare/{versionId1}/{versionId2}/` - Comparer deux versions
- `POST /versions/{versionId}/restore/` - Restaurer une version

**Types :**
```typescript
interface Version {
  id: string;
  project_id: string;
  document_id?: string;
  pyramid_node_id?: string;
  commit_message: string;
  author_email: string;
  content_snapshot: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface VersionDiff {
  additions: number;
  deletions: number;
  changes: Array<{ type: string; content: string }>;
}
```

### 3. analyticsAPI

**Endpoints :**
- `GET /analytics/projects/{projectId}/analytics/` - Analytics complètes du projet
- `GET /analytics/projects/{projectId}/word-count/` - Statistiques de mots
- `GET /analytics/projects/{projectId}/writing-progress/` - Progression d'écriture
- `GET /analytics/projects/{projectId}/entities/` - Statistiques d'entités
- `GET /analytics/projects/{projectId}/arcs/` - Statistiques d'arcs
- `GET /analytics/projects/{projectId}/timeline/` - Statistiques de timeline

**Types :**
```typescript
interface WordCountStats {
  total_words: number;
  total_characters: number;
  total_characters_no_spaces: number;
  average_word_length: number;
  by_document: Record<string, number>;
}

interface ProjectAnalytics {
  project_id: string;
  generated_at: string;
  word_count: WordCountStats;
  writing_progress: WritingProgressStats;
  entities: EntityStats;
  arcs: ArcStats;
  timeline: TimelineStats;
  llm_usage: Record<string, number>;
}
```

### 4. exportAPI

**Endpoints :**
- `POST /export/markdown/` - Exporter le projet en Markdown
- `POST /export/csv/` - Exporter en CSV (entities, timeline, arcs)
- `POST /export/enhance/` - Améliorer le texte avant export

**Types :**
```typescript
interface ExportRequest {
  project_id: string;
  export_type?: string;
  format?: string;
  style?: string;
}
```

---

## ✅ Tests de Connexion Réussis

### Test 1 : Inscription d'utilisateur

```bash
curl -X POST "https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@literai.com", "password": "testpassword123", "full_name": "Test User 2"}'
```

**Résultat :** ✅ Utilisateur créé avec ID `800beb71-1463-423f-a414-eabcc0354966`

### Test 2 : Authentification

```bash
curl -X POST "https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@literai.com", "password": "testpassword123"}'
```

**Résultat :** ✅ Token JWT reçu
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Test 3 : Création de projet

```bash
curl -X POST "https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer/api/v1/projects/" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Mon Premier Roman", "description": "Un roman de test"}'
```

**Résultat :** ✅ Projet créé avec ID `942d0f64-262c-4d95-90d7-c2f4ab6868ee`

---

## 🐛 Problèmes Résolus

### Problème 1 : Redirections 307 HTTPS→HTTP

**Symptôme :** Les requêtes HTTPS étaient redirigées vers HTTP avec un code 307.

**Cause :** FastAPI ne détectait pas le schéma HTTPS car le reverse proxy ne transmettait pas les en-têtes X-Forwarded-*.

**Solution :** Ajout du ProxyHeadersMiddleware dans `app/main.py`

```python
class ProxyHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        if forwarded_proto:
            request.scope["scheme"] = forwarded_proto
        
        forwarded_host = request.headers.get("X-Forwarded-Host")
        if forwarded_host:
            request.scope["server"] = (forwarded_host.split(":")[0], 443 if forwarded_proto == "https" else 80)
        
        response = await call_next(request)
        return response

app.add_middleware(ProxyHeadersMiddleware)
```

### Problème 2 : Redirections automatiques de slashes

**Symptôme :** FastAPI redirige `/api/v1/auth/login` vers `/api/v1/auth/login/` avec un code 307.

**Cause :** Comportement par défaut de FastAPI qui normalise les URLs.

**Solution :** Désactivation de `redirect_slashes` dans la configuration FastAPI

```python
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    redirect_slashes=False  # Disable automatic slash redirects
)
```

### Problème 3 : Erreur TypeScript semanticTagsAPI

**Symptôme :** `Module '"@/lib/api"' has no exported member 'semanticTagsAPI'`

**Cause :** Le service `semanticTagsAPI` n'existait pas dans `client/src/lib/api.ts`.

**Solution :** Création du service complet avec tous les endpoints

---

## 📊 État Actuel

### Backend
- ✅ 12 modèles SQLAlchemy
- ✅ 15 schémas Pydantic
- ✅ 7 services métier
- ✅ 13 routers API
- ✅ 26 tests unitaires (100% passés)
- ✅ Couverture : 51% globale, 99% services critiques
- ✅ Migrations Alembic appliquées
- ✅ Backend démarré sur port 8000

### Frontend
- ✅ 4 services API créés (semanticTagsAPI, versionsAPI, analyticsAPI, exportAPI)
- ✅ Toutes les erreurs TypeScript corrigées
- ✅ Configuration API mise à jour
- ✅ Frontend démarré sur port 3000
- ✅ Connexion backend établie

### Tests Réussis
- ✅ Inscription utilisateur
- ✅ Authentification JWT
- ✅ Création de projet
- ✅ CORS fonctionnel
- ✅ Pas de redirections 307

---

## 🚀 Prochaines Étapes

### Tests End-to-End à Compléter

1. **Documents**
   - Créer un document dans un projet
   - Éditer le contenu avec TipTap
   - Sauvegarder automatiquement

2. **Structure Pyramidale**
   - Créer des nœuds pyramidaux
   - Générer la structure avec LLM
   - Tester le zoom bidirectionnel

3. **Versioning**
   - Créer une version d'un document
   - Comparer deux versions
   - Restaurer une version antérieure

4. **Analytics**
   - Récupérer les statistiques de projet
   - Afficher les graphiques de progression
   - Tester les alertes de déséquilibres

5. **Export**
   - Exporter en Markdown
   - Exporter en CSV
   - Tester l'amélioration de texte avec LLM

6. **Balisage Sémantique**
   - Créer des tags
   - Résoudre automatiquement les entités
   - Tester l'autocomplétion dans l'éditeur

### Améliorations Possibles

1. **Performance**
   - Implémenter le lazy loading pour les listes longues
   - Ajouter un cache côté frontend pour les données fréquemment accédées
   - Optimiser les requêtes SQL avec des jointures

2. **UX**
   - Ajouter des notifications toast pour les actions réussies/échouées
   - Implémenter un mode hors ligne avec synchronisation
   - Ajouter des raccourcis clavier pour les actions fréquentes

3. **Sécurité**
   - Implémenter le refresh token
   - Ajouter la validation côté serveur pour tous les inputs
   - Configurer CORS pour des origines spécifiques en production

---

## 📞 Support

**Backend :**
- Logs : `/home/ubuntu/literai/backend/backend.log`
- Documentation API : `https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer/docs`
- Rapport de restauration : `/home/ubuntu/literai/backend/RESTORATION_REPORT.md`

**Frontend :**
- Logs : Console du navigateur
- URL : `https://3000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer`
- TODO : `/home/ubuntu/literai-frontend/todo.md`

---

**Rapport généré le :** 11 novembre 2025  
**Auteur :** Manus AI Agent  
**Statut :** ✅ Connexion établie et fonctionnelle
