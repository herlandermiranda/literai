# LiterAI Backend

Backend FastAPI pour l'assistant d'écriture littéraire LiterAI.

## 🚀 Démarrage Rapide

### Prérequis

- Python 3.11+
- PostgreSQL 14+
- pip ou uv

### Installation

```bash
# Créer et activer l'environnement virtuel
python3.11 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

### Configuration Base de Données

```bash
# Créer la base de données PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE literai_db;"
sudo -u postgres psql -c "CREATE USER literai_user WITH PASSWORD 'literai_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE literai_db TO literai_user;"

# Appliquer les migrations
alembic upgrade head
```

### Lancement

```bash
# Mode développement
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Mode production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Le backend sera accessible sur `http://localhost:8000`

Documentation API : `http://localhost:8000/docs`

## 🧪 Tests

```bash
# Lancer tous les tests
pytest tests/

# Tests avec couverture
pytest tests/ --cov=app --cov-report=html

# Tests spécifiques
pytest tests/unit/services/
pytest tests/unit/crud/
```

## 📁 Structure du Projet

```
backend/
├── app/
│   ├── api/v1/           # Endpoints API
│   ├── core/             # Configuration et sécurité
│   ├── crud/             # Opérations CRUD
│   ├── db/               # Configuration base de données
│   ├── models/           # Modèles SQLAlchemy
│   ├── schemas/          # Schémas Pydantic
│   ├── services/         # Logique métier
│   └── main.py           # Application FastAPI
├── alembic/              # Migrations base de données
├── tests/                # Tests unitaires et d'intégration
└── requirements.txt      # Dépendances Python
```

## 🔧 Fonctionnalités

### Modèles de Données

- **User** : Gestion des utilisateurs
- **Project** : Projets d'écriture
- **Document** : Documents et chapitres
- **Entity** : Personnages, lieux, objets
- **Arc** : Arcs narratifs
- **TimelineEvent** : Événements chronologiques
- **PyramidNode** : Structure pyramidale
- **Version** : Versioning de documents
- **Tag** : Balisage sémantique
- **LLMRequest** : Historique des requêtes LLM

### Services

- **ExportService** : Export Markdown/CSV
- **VersioningService** : Gestion des versions
- **AnalyticsService** : Statistiques de projet
- **PyramidLLMService** : Génération de structure pyramidale
- **SemanticTagService** : Balisage sémantique automatique
- **LLMService** : Intégration LLM (génération, continuation, réécriture)

### Endpoints API

- `/api/v1/auth` : Authentification
- `/api/v1/projects` : Gestion des projets
- `/api/v1/documents` : Gestion des documents
- `/api/v1/entities` : Gestion des entités
- `/api/v1/arcs` : Gestion des arcs narratifs
- `/api/v1/timeline` : Gestion de la timeline
- `/api/v1/pyramid` : Structure pyramidale
- `/api/v1/versions` : Versioning
- `/api/v1/analytics` : Analytics
- `/api/v1/export` : Export
- `/api/v1/semantic_tags` : Balisage sémantique
- `/api/v1/llm` : Services LLM

## 🐛 Bugs Corrigés

Voir [RESTORATION_REPORT.md](./RESTORATION_REPORT.md) pour la liste complète des bugs corrigés :

- **BUG-022** : PyramidNode.is_generated Boolean ✅
- **BUG-023** : Schémas Pydantic alias ✅
- **BUG-025** : Email case-insensitive ✅
- **NC-001** : Export Markdown structure plate ✅
- **NC-003** : export_service utilise rewrite_text() ✅
- **NC-004** : CSV sans colonne Parent ✅
- **NC-005** : Document.versions relationship ✅

## 📊 Couverture de Tests

- **Tests unitaires** : 26 tests (100% passés)
- **Couverture globale** : 51%
- **Couverture services critiques** : 76-99%
- **Couverture modèles** : 100%

## 🔐 Sécurité

- Authentification JWT
- Hash de mots de passe avec bcrypt
- Validation des entrées avec Pydantic
- Protection CORS configurée

## 📝 Variables d'Environnement

```env
# Base de données
DATABASE_URL=postgresql://literai_user:literai_password@localhost:5432/literai_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM (optionnel)
LLM_MOCK_MODE=true
OPENAI_API_KEY=your-openai-key
```

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
2. Commiter les changements : `git commit -m "Ajout nouvelle fonctionnalité"`
3. Pousser la branche : `git push origin feature/nouvelle-fonctionnalite`
4. Créer une Pull Request

## 📄 Licence

MIT License - voir LICENSE pour plus de détails

## 📞 Support

Pour toute question ou problème :
- Consulter [RESTORATION_REPORT.md](./RESTORATION_REPORT.md)
- Vérifier la documentation API : `http://localhost:8000/docs`
- Examiner les tests : `tests/`

---

**Version** : 1.0.0  
**Date de restauration** : 11 novembre 2025  
**Statut** : ✅ Production-ready
