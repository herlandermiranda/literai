# LiterAI - Guide de Démarrage Rapide

Ce guide vous permet de démarrer rapidement avec LiterAI, l'assistant d'écriture littéraire.

## Installation Rapide (5 minutes)

### 1. Prérequis

Assurez-vous d'avoir installé :
- Python 3.11+
- PostgreSQL 14+
- Git

### 2. Installation Backend

```bash
# Cloner le dépôt
git clone <repository-url>
cd literai/backend

# Créer l'environnement virtuel
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate sur Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE literai_db;"
sudo -u postgres psql -c "CREATE USER literai_user WITH PASSWORD 'literai_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE literai_db TO literai_user;"

# Configurer les variables d'environnement
cat > .env << 'EOF'
DATABASE_URL=postgresql://literai_user:literai_password@localhost:5432/literai_db
SECRET_KEY=changez-cette-cle-en-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
LLM_MOCK_MODE=true
OPENAI_API_KEY=votre-cle-api-openai-ici
EOF

# Exécuter les migrations
alembic upgrade head

# Démarrer le serveur
uvicorn app.main:app --reload
```

Le backend est maintenant accessible sur http://localhost:8000

### 3. Vérification

Ouvrez http://localhost:8000/docs dans votre navigateur pour voir la documentation interactive de l'API.

## Utilisation de Base

### 1. Créer un Compte

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"auteur@example.com","password":"MonMotDePasse123!"}'
```

### 2. Se Connecter

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"auteur@example.com","password":"MonMotDePasse123!"}'
```

Vous recevrez un token JWT à utiliser pour les requêtes suivantes.

### 3. Créer un Projet

```bash
TOKEN="votre-token-ici"

curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Mon Premier Roman","description":"Un roman de fantasy épique","language":"fr"}'
```

### 4. Créer un Document

```bash
PROJECT_ID="id-du-projet"

curl -X POST "http://localhost:8000/api/v1/documents/?project_id=$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Chapitre 1","type":"draft","content_raw":"Il était une fois..."}'
```

### 5. Utiliser l'IA (Mode Mock)

```bash
curl -X POST http://localhost:8000/api/v1/llm/continuation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "project_id":"'$PROJECT_ID'",
    "existing_text":"Dans un royaume lointain, où la magie coulait comme une rivière,",
    "target_length":200
  }'
```

## Passage en Mode Production (avec OpenAI)

1. Obtenir une clé API OpenAI sur https://platform.openai.com/

2. Modifier `.env` :
```env
LLM_MOCK_MODE=false
OPENAI_API_KEY=sk-votre-vraie-cle-api-ici
```

3. Redémarrer le serveur :
```bash
pkill -f "uvicorn app.main:app"
uvicorn app.main:app --reload
```

Les requêtes LLM utiliseront maintenant l'API OpenAI réelle.

## Test Complet

Un script de test complet est fourni pour vérifier toutes les fonctionnalités :

```bash
cd /home/ubuntu
./test_complete.sh
```

Ce script teste :
- ✅ Health check
- ✅ Inscription et connexion
- ✅ Création de projet
- ✅ Création de documents
- ✅ Création d'entités (personnages, lieux)
- ✅ Création d'arcs narratifs
- ✅ Création d'événements de timeline
- ✅ Toutes les fonctionnalités LLM (continuation, réécriture, suggestions, analyse)

## Fonctionnalités Principales

### Gestion de Projets
- Créer, modifier, supprimer des projets littéraires
- Organiser par titre, description, langue

### Éditeur de Documents
- Documents hiérarchiques (chapitres, scènes, notes)
- Types : draft, scene, note, outline, worldbuilding, character_sheet, location_sheet
- Sauvegarde automatique
- Compteur de mots/caractères

### Univers Narratif
- **Entités** : personnages, lieux, objets, factions, concepts
- **Arcs narratifs** : suivi des intrigues avec code couleur
- **Timeline** : chronologie des événements

### Assistant IA
- **Continuation** : génère la suite du texte
- **Réécriture** : améliore le style et la clarté
- **Suggestions** : propose des idées créatives
- **Analyse** : évalue la structure et le style

## Prochaines Étapes

1. **Déployer en production** : Voir `README.md` section "Déploiement"
2. **Installer le frontend** : Projet React séparé (voir `literai-frontend`)
3. **Personnaliser les prompts** : Modifier `backend/app/services/prompts.py`
4. **Ajouter des fonctionnalités** : Suivre le guide de développement dans `README.md`

## Dépannage Rapide

### Le serveur ne démarre pas
- Vérifier que PostgreSQL est démarré : `sudo systemctl status postgresql`
- Vérifier les identifiants dans `.env`

### Erreur "database does not exist"
- Créer la base de données : `sudo -u postgres psql -c "CREATE DATABASE literai_db;"`

### Erreur LLM
- En mode mock : vérifier que `LLM_MOCK_MODE=true`
- En mode production : vérifier que `OPENAI_API_KEY` est défini

### CORS errors
- Ajouter l'URL du frontend dans `BACKEND_CORS_ORIGINS` dans `.env`

## Support

Pour plus d'informations, consultez :
- **Documentation complète** : `README.md`
- **API Documentation** : http://localhost:8000/docs
- **Tests** : `test_complete.sh`

---

**Bon courage dans votre écriture ! 📚✨**
