# LiterAI - Assistant d'Écriture Littéraire

**LiterAI** est une application web complète d'aide à l'écriture littéraire, conçue pour accompagner les auteurs dans la création de romans, nouvelles et autres œuvres narratives. L'application combine une interface utilisateur moderne avec des fonctionnalités avancées d'intelligence artificielle pour offrir une expérience d'écriture professionnelle et intuitive.

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Utilisation](#utilisation)
7. [API Documentation](#api-documentation)
8. [Déploiement](#déploiement)
9. [Développement](#développement)
10. [Tests](#tests)

---

## Vue d'ensemble

LiterAI offre un environnement d'écriture complet qui permet aux auteurs de :

- **Organiser leurs projets littéraires** avec une structure hiérarchique de documents (chapitres, scènes, notes, fiches de personnages, etc.)
- **Gérer l'univers narratif** en créant des fiches détaillées pour les personnages, lieux, objets, factions et concepts
- **Structurer les arcs narratifs** pour suivre l'évolution des différentes intrigues
- **Maintenir une chronologie cohérente** avec une timeline interactive
- **Bénéficier d'une assistance IA** pour la continuation de texte, la réécriture, les suggestions créatives et l'analyse littéraire
- **Sauvegarder automatiquement** leur travail en temps réel

### Caractéristiques Principales

- **Interface moderne et intuitive** : Éditeur de texte riche avec formatage, compteur de mots/caractères, et navigation fluide
- **Gestion complète de projets** : Arborescence de documents, organisation par type, recherche et filtrage
- **Base de données relationnelle** : PostgreSQL pour une gestion robuste et performante des données
- **Authentification sécurisée** : Système JWT pour protéger les données des utilisateurs
- **API RESTful complète** : Backend FastAPI avec documentation automatique (Swagger/OpenAPI)
- **Intégration LLM** : Support pour OpenAI GPT-4 avec mode mock pour les tests
- **Prompt Engineering professionnel** : Prompts optimisés pour chaque fonctionnalité LLM
- **Responsive Design** : Interface adaptée aux différentes tailles d'écran

---

## Architecture

### Stack Technologique

#### Backend
- **Framework** : FastAPI 0.104.1
- **Base de données** : PostgreSQL 14+
- **ORM** : SQLAlchemy 2.0.23
- **Migrations** : Alembic 1.12.1
- **Authentification** : JWT (python-jose)
- **Sécurité** : Passlib avec bcrypt
- **LLM** : OpenAI Python SDK 1.3.5

#### Frontend
- **Framework** : React 19
- **Routing** : Wouter
- **Styling** : Tailwind CSS 4
- **UI Components** : shadcn/ui
- **Éditeur** : TipTap
- **HTTP Client** : Fetch API native

### Structure du Projet

```
literai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py              # Routeur principal
│   │   │       └── endpoints/          # Endpoints par fonctionnalité
│   │   │           ├── auth.py         # Authentification
│   │   │           ├── projects.py     # Gestion des projets
│   │   │           ├── documents.py    # Gestion des documents
│   │   │           ├── entities.py     # Gestion des entités
│   │   │           ├── arcs.py         # Arcs narratifs
│   │   │           ├── timeline.py     # Timeline
│   │   │           ├── tags.py         # Tags/annotations
│   │   │           └── llm.py          # Fonctionnalités LLM
│   │   ├── core/
│   │   │   ├── config.py               # Configuration
│   │   │   ├── security.py             # Sécurité et JWT
│   │   │   └── deps.py                 # Dépendances FastAPI
│   │   ├── crud/                       # Opérations CRUD
│   │   ├── db/                         # Configuration base de données
│   │   ├── models/                     # Modèles SQLAlchemy
│   │   ├── schemas/                    # Schémas Pydantic
│   │   ├── services/
│   │   │   ├── llm_service.py          # Service LLM
│   │   │   └── prompts.py              # Prompts engineering
│   │   └── main.py                     # Point d'entrée FastAPI
│   ├── alembic/                        # Migrations
│   ├── requirements.txt                # Dépendances Python
│   └── .env                            # Variables d'environnement
│
└── frontend/                           # (Non inclus dans ce dépôt)
    └── (Projet React séparé)
```

### Modèle de Données

#### Entités Principales

1. **User** : Utilisateurs de l'application
   - `id`, `email`, `hashed_password`, `created_at`, `updated_at`

2. **Project** : Projets littéraires
   - `id`, `user_id`, `title`, `description`, `language`, `created_at`, `updated_at`

3. **Document** : Documents (chapitres, scènes, notes, etc.)
   - `id`, `project_id`, `parent_id`, `title`, `type`, `content_raw`, `content_html`, `word_count`, `char_count`, `order_index`, `created_at`, `updated_at`
   - Types : `draft`, `scene`, `note`, `outline`, `worldbuilding`, `character_sheet`, `location_sheet`

4. **Entity** : Éléments de l'univers narratif
   - `id`, `project_id`, `type`, `name`, `slug`, `summary`, `data`, `created_at`, `updated_at`
   - Types : `character`, `location`, `item`, `faction`, `concept`

5. **Arc** : Arcs narratifs
   - `id`, `project_id`, `name`, `description`, `color`, `arc_metadata`, `created_at`, `updated_at`

6. **TimelineEvent** : Événements de la chronologie
   - `id`, `project_id`, `title`, `description`, `date`, `order_index`, `event_metadata`, `created_at`, `updated_at`

7. **TagInstance** : Tags/annotations sur les documents
   - `id`, `document_id`, `entity_id`, `tag_type`, `start_offset`, `end_offset`, `tag_metadata`, `created_at`

8. **LLMRequest** : Historique des requêtes LLM
   - `id`, `user_id`, `project_id`, `type`, `prompt`, `response`, `model`, `tokens_used`, `status`, `created_at`

#### Relations

- Un **User** peut avoir plusieurs **Projects**
- Un **Project** peut avoir plusieurs **Documents**, **Entities**, **Arcs**, et **TimelineEvents**
- Les **Documents** peuvent avoir une structure hiérarchique (parent-enfant)
- Les **TagInstances** lient les **Documents** aux **Entities**
- Les **ArcLinks** lient les **Arcs** aux **Documents**
- Les **TimelineLinks** lient les **TimelineEvents** aux **Documents** et **Entities**

---

## Fonctionnalités

### 1. Gestion de Projets

- Création, édition et suppression de projets littéraires
- Métadonnées : titre, description, langue
- Liste de tous les projets de l'utilisateur

### 2. Éditeur de Documents

- **Éditeur de texte riche** avec TipTap :
  - Formatage : gras, italique, souligné, barré
  - Listes à puces et numérotées
  - Titres (H1, H2, H3)
  - Citations
  - Code inline et blocs de code
- **Sauvegarde automatique** : après 2 secondes d'inactivité
- **Compteur de mots et caractères** en temps réel
- **Types de documents** : brouillon, scène, note, plan, worldbuilding, fiche de personnage, fiche de lieu
- **Arborescence hiérarchique** : organisation parent-enfant
- **Navigation fluide** entre les documents

### 3. Gestion des Entités

- **Types d'entités** : personnages, lieux, objets, factions, concepts
- **Fiches détaillées** : nom, type, résumé, données personnalisées (JSON)
- **Slug automatique** : génération d'identifiants URL-friendly
- **Filtrage par type** : affichage sélectif des entités
- **CRUD complet** : création, lecture, mise à jour, suppression

### 4. Arcs Narratifs

- **Création d'arcs** : nom, description, couleur (visualisation)
- **Liaison avec documents** : suivi de l'importance de l'arc dans chaque document
- **Métadonnées flexibles** : stockage de données supplémentaires en JSON
- **Visualisation** : code couleur pour identifier rapidement les arcs

### 5. Timeline

- **Événements chronologiques** : titre, description, date
- **Support de dates flexibles** : dates réelles (date) ou textuelles (stockées en métadonnées)
- **Ordre personnalisé** : index d'ordre pour les événements sans date précise
- **Liaison avec documents et entités** : contexte narratif complet
- **Tri et filtrage** : organisation chronologique

### 6. Fonctionnalités LLM

#### a) Continuation de Texte
- **Génération de suite** : continue le texte existant de manière cohérente
- **Paramètres ajustables** : longueur cible (50-2000 mots), instructions personnalisées
- **Contexte enrichi** : utilise les entités, arcs et événements de timeline sélectionnés
- **Prompt optimisé** : respect du style, du ton et de la langue du projet

#### b) Réécriture
- **Objectifs spécifiques** : amélioration du style, clarification, enrichissement, etc.
- **Instructions personnalisées** : contrôle précis du résultat
- **Préservation du sens** : maintien du message original
- **Prompt optimisé** : focus sur les objectifs de réécriture

#### c) Suggestions Créatives
- **Idées narratives** : propositions de développements possibles
- **Contexte narratif** : basé sur la situation actuelle
- **Questions utilisateur** : réponses aux défis créatifs
- **Contexte enrichi** : utilise les entités, arcs et événements pertinents
- **Prompt optimisé** : suggestions variées et créatives

#### d) Analyse de Texte
- **Analyse littéraire** : structure, style, rythme, cohérence
- **Focus personnalisé** : analyse ciblée sur des aspects spécifiques
- **Retour constructif** : points forts et axes d'amélioration
- **Prompt optimisé** : analyse détaillée et professionnelle

### 7. Système d'Authentification

- **Inscription** : création de compte avec email et mot de passe
- **Connexion** : authentification JWT
- **Sécurité** : hachage bcrypt des mots de passe
- **Protection des routes** : middleware d'authentification
- **Gestion de session** : tokens JWT avec expiration

### 8. Système de Tags/Annotations

- **Annotations dans le texte** : marquage de portions de texte
- **Liaison avec entités** : référencement des personnages, lieux, etc.
- **Types de tags** : mention, description, action, etc.
- **Offsets de position** : début et fin de l'annotation dans le texte
- **Métadonnées** : informations supplémentaires sur le tag

---

## Installation

### Prérequis

- **Python** : 3.11+
- **PostgreSQL** : 14+
- **Node.js** : 22+ (pour le frontend)
- **pnpm** : Package manager pour le frontend

### Installation du Backend

1. **Cloner le dépôt** :
   ```bash
   git clone <repository-url>
   cd literai/backend
   ```

2. **Créer un environnement virtuel** :
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate  # Windows
   ```

3. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurer PostgreSQL** :
   ```bash
   sudo -u postgres psql
   CREATE DATABASE literai_db;
   CREATE USER literai_user WITH PASSWORD 'literai_password';
   GRANT ALL PRIVILEGES ON DATABASE literai_db TO literai_user;
   \q
   ```

5. **Configurer les variables d'environnement** :
   Copier `.env.example` vers `.env` et ajuster les valeurs :
   ```bash
   cp .env.example .env
   ```

6. **Exécuter les migrations** :
   ```bash
   alembic upgrade head
   ```

7. **Démarrer le serveur** :
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Installation du Frontend

*(Le frontend est un projet séparé - voir le dépôt `literai-frontend`)*

---

## Configuration

### Variables d'Environnement Backend

Créer un fichier `.env` à la racine du dossier `backend/` :

```env
# Database
DATABASE_URL=postgresql://literai_user:literai_password@localhost:5432/literai_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# LLM
LLM_MOCK_MODE=true
OPENAI_API_KEY=your-openai-api-key-here
```

### Configuration PostgreSQL

Assurez-vous que PostgreSQL est configuré pour accepter les connexions locales :

```bash
# /etc/postgresql/14/main/pg_hba.conf
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
```

### Configuration OpenAI

Pour utiliser les fonctionnalités LLM en mode production :

1. Obtenir une clé API OpenAI sur [platform.openai.com](https://platform.openai.com/)
2. Définir `LLM_MOCK_MODE=false` dans `.env`
3. Définir `OPENAI_API_KEY=sk-...` avec votre clé API

---

## Utilisation

### Démarrage Rapide

1. **Démarrer le backend** :
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Accéder à l'API** :
   - Documentation interactive : http://localhost:8000/docs
   - API alternative : http://localhost:8000/redoc
   - Health check : http://localhost:8000/health

3. **Créer un compte** :
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"SecurePassword123!"}'
   ```

4. **Se connecter** :
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"SecurePassword123!"}'
   ```

5. **Créer un projet** :
   ```bash
   curl -X POST http://localhost:8000/api/v1/projects/ \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-token>" \
     -d '{"title":"Mon Premier Roman","description":"Un roman fantastique","language":"fr"}'
   ```

### Workflow Typique

1. **Créer un projet** : Définir le titre, la description et la langue
2. **Créer des documents** : Ajouter des chapitres, scènes, notes
3. **Définir les entités** : Créer des fiches pour les personnages, lieux, etc.
4. **Structurer les arcs** : Définir les intrigues principales et secondaires
5. **Établir la chronologie** : Créer les événements clés de la timeline
6. **Écrire et réviser** : Utiliser l'éditeur avec sauvegarde automatique
7. **Utiliser l'IA** : Demander de l'aide pour la continuation, la réécriture, etc.
8. **Annoter le texte** : Lier les mentions de personnages et lieux

---

## API Documentation

### Authentification

#### POST `/api/v1/auth/register`
Inscription d'un nouvel utilisateur.

**Request Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "2025-11-10T10:00:00"
}
```

#### POST `/api/v1/auth/login`
Connexion et obtention d'un token JWT.

**Request Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Projets

#### GET `/api/v1/projects/`
Liste tous les projets de l'utilisateur.

**Headers** : `Authorization: Bearer <token>`

**Response** :
```json
[
  {
    "id": "uuid",
    "title": "Mon Premier Roman",
    "description": "Un roman fantastique",
    "language": "fr",
    "created_at": "2025-11-10T10:00:00",
    "updated_at": "2025-11-10T10:00:00"
  }
]
```

#### POST `/api/v1/projects/`
Crée un nouveau projet.

**Headers** : `Authorization: Bearer <token>`

**Request Body** :
```json
{
  "title": "Mon Premier Roman",
  "description": "Un roman fantastique",
  "language": "fr"
}
```

#### GET `/api/v1/projects/{project_id}`
Récupère un projet spécifique.

#### PUT `/api/v1/projects/{project_id}`
Met à jour un projet.

#### DELETE `/api/v1/projects/{project_id}`
Supprime un projet.

### Documents

#### GET `/api/v1/documents/?project_id={project_id}`
Liste tous les documents d'un projet.

#### POST `/api/v1/documents/?project_id={project_id}`
Crée un nouveau document.

**Request Body** :
```json
{
  "title": "Chapitre 1",
  "type": "draft",
  "content_raw": "Il était une fois...",
  "parent_id": null
}
```

#### GET `/api/v1/documents/{document_id}`
Récupère un document spécifique.

#### PUT `/api/v1/documents/{document_id}`
Met à jour un document.

#### DELETE `/api/v1/documents/{document_id}`
Supprime un document.

### Entités

#### GET `/api/v1/entities/?project_id={project_id}`
Liste toutes les entités d'un projet.

**Query Parameters** :
- `type` (optional) : Filtrer par type (character, location, item, faction, concept)

#### POST `/api/v1/entities/?project_id={project_id}`
Crée une nouvelle entité.

**Request Body** :
```json
{
  "name": "Aria Stormwind",
  "type": "character",
  "summary": "Une jeune mage au talent exceptionnel",
  "data": {
    "age": 22,
    "abilities": ["Magie du feu", "Télépathie"]
  }
}
```

**Note** : Le champ `slug` est généré automatiquement à partir du `name` si non fourni.

### Arcs Narratifs

#### GET `/api/v1/arcs/?project_id={project_id}`
Liste tous les arcs narratifs d'un projet.

#### POST `/api/v1/arcs/?project_id={project_id}`
Crée un nouvel arc narratif.

**Request Body** :
```json
{
  "name": "La Quête du Cristal",
  "description": "Aria doit retrouver le Cristal Éternel",
  "color": "#3b82f6"
}
```

### Timeline

#### GET `/api/v1/timeline/?project_id={project_id}`
Liste tous les événements de la timeline d'un projet.

#### POST `/api/v1/timeline/?project_id={project_id}`
Crée un nouvel événement de timeline.

**Request Body** :
```json
{
  "title": "La Découverte",
  "description": "Aria découvre ses pouvoirs",
  "date": "An 1, Jour 1",
  "order_index": 0
}
```

**Note** : Le champ `date` peut être une chaîne de caractères (stockée dans `event_metadata['date_string']`) ou un objet date Python.

### Fonctionnalités LLM

#### POST `/api/v1/llm/continuation`
Génère une continuation de texte.

**Request Body** :
```json
{
  "project_id": "uuid",
  "existing_text": "Dans un royaume lointain...",
  "target_length": 500,
  "user_instructions": "Introduire un conflit",
  "entity_ids": ["uuid1", "uuid2"],
  "arc_ids": ["uuid3"],
  "event_ids": ["uuid4"]
}
```

**Response** :
```json
{
  "text": "... la suite générée ...",
  "request_id": "uuid"
}
```

#### POST `/api/v1/llm/rewrite`
Réécrit un texte avec des objectifs spécifiques.

**Request Body** :
```json
{
  "project_id": "uuid",
  "text_to_rewrite": "Aria était une fille. Elle avait des pouvoirs.",
  "rewriting_goals": "Rendre le texte plus littéraire et descriptif",
  "user_instructions": "Utiliser des métaphores"
}
```

#### POST `/api/v1/llm/suggestions`
Obtient des suggestions créatives.

**Request Body** :
```json
{
  "project_id": "uuid",
  "current_context": "Aria vient de découvrir qu'elle peut contrôler le feu",
  "user_question": "Que peut-il se passer ensuite ?",
  "entity_ids": ["uuid1"],
  "arc_ids": ["uuid2"],
  "event_ids": ["uuid3"]
}
```

#### POST `/api/v1/llm/analyze`
Analyse un texte.

**Request Body** :
```json
{
  "project_id": "uuid",
  "text_to_analyze": "Dans un royaume lointain...",
  "analysis_focus": "Style et structure",
  "user_instructions": "Focus sur le rythme narratif"
}
```

---

## Déploiement

### Déploiement Backend

#### Option 1 : Serveur VPS (Recommandé)

1. **Préparer le serveur** :
   ```bash
   sudo apt update
   sudo apt install python3.11 python3.11-venv postgresql nginx
   ```

2. **Configurer PostgreSQL** :
   ```bash
   sudo -u postgres psql
   CREATE DATABASE literai_db;
   CREATE USER literai_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE literai_db TO literai_user;
   \q
   ```

3. **Cloner et installer** :
   ```bash
   cd /var/www
   git clone <repository-url> literai
   cd literai/backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configurer les variables d'environnement** :
   ```bash
   nano .env
   # Définir DATABASE_URL, SECRET_KEY, OPENAI_API_KEY, etc.
   ```

5. **Exécuter les migrations** :
   ```bash
   alembic upgrade head
   ```

6. **Configurer systemd** :
   ```bash
   sudo nano /etc/systemd/system/literai.service
   ```

   Contenu :
   ```ini
   [Unit]
   Description=LiterAI FastAPI Application
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/var/www/literai/backend
   Environment="PATH=/var/www/literai/backend/venv/bin"
   ExecStart=/var/www/literai/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```

7. **Démarrer le service** :
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start literai
   sudo systemctl enable literai
   ```

8. **Configurer Nginx** :
   ```bash
   sudo nano /etc/nginx/sites-available/literai
   ```

   Contenu :
   ```nginx
   server {
       listen 80;
       server_name api.literai.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/literai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Configurer SSL avec Let's Encrypt** :
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.literai.com
   ```

#### Option 2 : Docker

1. **Créer un Dockerfile** :
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   RUN apt-get update && apt-get install -y postgresql-client

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Créer un docker-compose.yml** :
   ```yaml
   version: '3.8'

   services:
     db:
       image: postgres:14
       environment:
         POSTGRES_DB: literai_db
         POSTGRES_USER: literai_user
         POSTGRES_PASSWORD: literai_password
       volumes:
         - postgres_data:/var/lib/postgresql/data

     backend:
       build: ./backend
       ports:
         - "8000:8000"
       environment:
         DATABASE_URL: postgresql://literai_user:literai_password@db:5432/literai_db
         SECRET_KEY: your-secret-key
         OPENAI_API_KEY: your-openai-key
       depends_on:
         - db

   volumes:
     postgres_data:
   ```

3. **Démarrer les conteneurs** :
   ```bash
   docker-compose up -d
   ```

### Déploiement Frontend

*(Voir la documentation du projet `literai-frontend`)*

---

## Développement

### Structure du Code Backend

#### Modèles (models/)
Définissent la structure de la base de données avec SQLAlchemy.

Exemple : `models/project.py`
```python
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
```

#### Schémas (schemas/)
Définissent les structures de données pour la validation avec Pydantic.

Exemple : `schemas/project.py`
```python
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    language: str = "en"

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

#### CRUD (crud/)
Opérations de base de données réutilisables.

Exemple : `crud/crud_project.py`
```python
class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    def get_by_user(self, db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Project]:
        return db.query(Project).filter(Project.user_id == user_id).offset(skip).limit(limit).all()

project = CRUDProject(Project)
```

#### Endpoints (api/v1/endpoints/)
Définissent les routes de l'API.

Exemple : `api/v1/endpoints/projects.py`
```python
@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = project_crud.create_with_user(db, obj_in=project_in, user_id=current_user.id)
    return project
```

#### Services (services/)
Logique métier complexe.

Exemple : `services/llm_service.py`
```python
class LLMService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def generate_continuation(self, project_id: UUID, existing_text: str, target_length: int = 500) -> LLMResponse:
        # Logique de génération
        pass
```

### Ajout d'une Nouvelle Fonctionnalité

1. **Créer le modèle** dans `models/`
2. **Créer les schémas** dans `schemas/`
3. **Créer le CRUD** dans `crud/`
4. **Créer les endpoints** dans `api/v1/endpoints/`
5. **Ajouter le routeur** dans `api/v1/api.py`
6. **Créer la migration** :
   ```bash
   alembic revision --autogenerate -m "Add new feature"
   alembic upgrade head
   ```

### Prompt Engineering

Les prompts LLM sont centralisés dans `services/prompts.py` pour faciliter l'ajustement et l'optimisation.

Structure d'un prompt :
```python
CONTINUATION_SYSTEM_PROMPT = """
Vous êtes un assistant d'écriture littéraire expert...
"""

CONTINUATION_USER_PROMPT_TEMPLATE = """
Projet : {project_title}
Langue : {language}
Genre : {genre}

Texte existant :
{existing_text}

Instructions : {user_instructions}
Longueur cible : {target_length} mots

Contexte :
{entity_context}
{arc_context}
{timeline_context}

Générez une continuation...
"""
```

### Bonnes Pratiques

1. **Sécurité** :
   - Toujours valider les entrées utilisateur avec Pydantic
   - Utiliser des requêtes paramétrées (SQLAlchemy ORM)
   - Vérifier les permissions avant chaque opération
   - Hacher les mots de passe avec bcrypt

2. **Performance** :
   - Utiliser des index sur les colonnes fréquemment recherchées
   - Limiter les résultats des requêtes (pagination)
   - Utiliser `select_related` / `joinedload` pour éviter N+1 queries

3. **Code** :
   - Suivre PEP 8 pour le style Python
   - Documenter les fonctions avec des docstrings
   - Utiliser des types hints
   - Écrire des tests unitaires

4. **Base de données** :
   - Toujours créer une migration pour les changements de schéma
   - Tester les migrations sur une copie de la base de données
   - Utiliser des transactions pour les opérations critiques

---

## Tests

### Tests Backend

#### Tests Unitaires

Créer des tests dans `tests/` :

```python
# tests/test_projects.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_project():
    # S'authentifier
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    token = response.json()["access_token"]
    
    # Créer un projet
    response = client.post("/api/v1/projects/", json={
        "title": "Test Project",
        "description": "A test project",
        "language": "en"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert response.status_code == 201
    assert response.json()["title"] == "Test Project"
```

#### Exécuter les Tests

```bash
pytest tests/ -v
```

#### Tests d'Intégration

Un script de test complet est fourni : `test_complete.sh`

```bash
cd /home/ubuntu
./test_complete.sh
```

Ce script teste :
- Health check
- Inscription et connexion
- Création de projet
- Création de documents
- Création d'entités
- Création d'arcs narratifs
- Création d'événements de timeline
- Toutes les fonctionnalités LLM (continuation, réécriture, suggestions, analyse)
- Récupération des listes

### Tests Frontend

*(Voir la documentation du projet `literai-frontend`)*

### Tests LLM

Le mode mock permet de tester les fonctionnalités LLM sans consommer de tokens OpenAI :

1. Définir `LLM_MOCK_MODE=true` dans `.env`
2. Les réponses seront générées localement avec un délai simulé
3. Aucune clé API OpenAI n'est nécessaire

Pour tester avec un vrai modèle :

1. Définir `LLM_MOCK_MODE=false` dans `.env`
2. Définir `OPENAI_API_KEY=sk-...` avec une clé API valide
3. Les requêtes seront envoyées à l'API OpenAI

---

## Annexes

### Commandes Utiles

#### Backend

```bash
# Créer une migration
alembic revision --autogenerate -m "Description"

# Appliquer les migrations
alembic upgrade head

# Revenir à une migration précédente
alembic downgrade -1

# Voir l'historique des migrations
alembic history

# Démarrer le serveur en mode développement
uvicorn app.main:app --reload

# Démarrer le serveur en mode production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Exécuter les tests
pytest tests/ -v

# Vérifier le style du code
flake8 app/

# Formater le code
black app/
```

#### Base de Données

```bash
# Se connecter à PostgreSQL
psql -U literai_user -d literai_db

# Sauvegarder la base de données
pg_dump -U literai_user literai_db > backup.sql

# Restaurer la base de données
psql -U literai_user literai_db < backup.sql

# Voir les tables
\dt

# Voir la structure d'une table
\d projects
```

### Dépannage

#### Problème : Erreur de connexion à la base de données

**Solution** :
1. Vérifier que PostgreSQL est démarré : `sudo systemctl status postgresql`
2. Vérifier les identifiants dans `.env`
3. Vérifier que l'utilisateur a les permissions : `GRANT ALL PRIVILEGES ON DATABASE literai_db TO literai_user;`

#### Problème : Erreur lors de la migration

**Solution** :
1. Vérifier que la base de données est accessible
2. Revenir à la migration précédente : `alembic downgrade -1`
3. Supprimer la migration problématique dans `alembic/versions/`
4. Recréer la migration : `alembic revision --autogenerate -m "Description"`

#### Problème : Erreur LLM "API key not found"

**Solution** :
1. Vérifier que `OPENAI_API_KEY` est défini dans `.env`
2. Vérifier que `LLM_MOCK_MODE=false` si vous voulez utiliser l'API réelle
3. Redémarrer le serveur pour recharger les variables d'environnement

#### Problème : CORS errors dans le frontend

**Solution** :
1. Vérifier que l'URL du frontend est dans `BACKEND_CORS_ORIGINS` dans `.env`
2. Exemple : `BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]`
3. Redémarrer le serveur backend

### Ressources

- **FastAPI Documentation** : https://fastapi.tiangolo.com/
- **SQLAlchemy Documentation** : https://docs.sqlalchemy.org/
- **Alembic Documentation** : https://alembic.sqlalchemy.org/
- **Pydantic Documentation** : https://docs.pydantic.dev/
- **OpenAI API Documentation** : https://platform.openai.com/docs/
- **PostgreSQL Documentation** : https://www.postgresql.org/docs/

---

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Auteur

**Manus AI** - Développé avec soin et professionnalisme.

## Remerciements

Merci à tous les contributeurs et à la communauté open-source pour les outils et bibliothèques utilisés dans ce projet.

---

**Note** : Cette documentation est maintenue à jour avec chaque version du projet. Pour toute question ou suggestion, veuillez ouvrir une issue sur le dépôt GitHub.
