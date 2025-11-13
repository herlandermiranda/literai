# Guide d'Installation LiterAI

Guide complet pour installer et déployer LiterAI (frontend + backend).

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Frontend](#installation-frontend)
3. [Installation Backend](#installation-backend)
4. [Configuration](#configuration)
5. [Déploiement Production](#déploiement-production)
6. [Dépannage](#dépannage)

---

## Prérequis

### Système

- **OS** : Linux, macOS, ou Windows (avec WSL2 recommandé)
- **RAM** : Minimum 4 GB (8 GB recommandé)
- **Espace disque** : 2 GB minimum

### Logiciels Requis

#### Frontend
- **Node.js** : Version 22.x ou supérieure
  ```bash
  node --version  # Doit afficher v22.x.x
  ```
- **pnpm** : Gestionnaire de paquets (ou npm/yarn)
  ```bash
  npm install -g pnpm
  ```

#### Backend
- **Python** : Version 3.11 ou supérieure
  ```bash
  python3 --version  # Doit afficher Python 3.11.x
  ```
- **PostgreSQL** : Version 14 ou supérieure
  ```bash
  psql --version  # Doit afficher PostgreSQL 14.x
  ```
- **Pandoc** : Pour les exports (optionnel)
  ```bash
  pandoc --version
  ```

### Comptes Requis

- **OpenAI API Key** : Pour l'assistance IA
  - Créer un compte sur https://platform.openai.com
  - Générer une clé API dans Settings → API Keys

---

## Installation Frontend

### 1. Cloner le Repository

```bash
git clone <repository-url>
cd literai-frontend
```

### 2. Installer les Dépendances

```bash
pnpm install
```

Cela installera toutes les dépendances listées dans `package.json` :
- React 19
- TipTap (éditeur)
- shadcn/ui (composants)
- Tailwind CSS 4
- Vis.js (timeline)
- Cytoscape.js (graphe)
- Et bien d'autres...

### 3. Configurer les Variables d'Environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000

# Titre de l'application (optionnel)
VITE_APP_TITLE=LiterAI

# Logo de l'application (optionnel)
VITE_APP_LOGO=/logo.svg
```

**Note** : Pour la production, remplacer `http://localhost:8000` par l'URL de votre backend déployé.

### 4. Lancer le Serveur de Développement

```bash
pnpm dev
```

L'application sera accessible sur **http://localhost:3000**

### 5. Build pour Production

```bash
pnpm build
```

Les fichiers de production seront générés dans le dossier `dist/`

Pour tester le build de production localement :

```bash
pnpm preview
```

---

## Installation Backend

### 1. Cloner le Repository Backend

```bash
git clone <backend-repository-url>
cd literai-backend
```

### 2. Créer un Environnement Virtuel Python

```bash
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

### 3. Installer les Dépendances Python

```bash
pip install -r requirements.txt
```

Dépendances principales :
- FastAPI
- SQLAlchemy
- PostgreSQL driver (psycopg2)
- OpenAI SDK
- Pydantic
- Uvicorn (serveur ASGI)

### 4. Configurer PostgreSQL

#### Créer une Base de Données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE literai;

# Créer un utilisateur (optionnel)
CREATE USER literai_user WITH PASSWORD 'votre_mot_de_passe';

# Donner les privilèges
GRANT ALL PRIVILEGES ON DATABASE literai TO literai_user;

# Quitter
\q
```

### 5. Configurer les Variables d'Environnement Backend

Créer un fichier `.env` à la racine du backend :

```env
# Base de données
DATABASE_URL=postgresql://literai_user:votre_mot_de_passe@localhost:5432/literai

# OpenAI API
OPENAI_API_KEY=sk-votre-cle-api-openai

# JWT Secret (générer une clé aléatoire sécurisée)
JWT_SECRET=votre-secret-jwt-tres-securise

# CORS Origins (URLs autorisées)
CORS_ORIGINS=http://localhost:3000,https://votre-frontend.com

# Environnement
ENVIRONMENT=development
```

**Générer un JWT_SECRET sécurisé** :
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 6. Initialiser la Base de Données

```bash
# Créer les tables
python -m app.db.init_db

# Ou avec Alembic (si configuré)
alembic upgrade head
```

### 7. Créer un Utilisateur de Test (Optionnel)

```bash
python -m app.scripts.create_user \
  --email demo@literai.com \
  --password demo123 \
  --full-name "Demo User"
```

### 8. Lancer le Serveur Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera accessible sur **http://localhost:8000**

**Vérifier que le backend fonctionne** :
```bash
curl http://localhost:8000/api/v1/health
# Doit retourner: {"status":"ok"}
```

---

## Configuration

### Configuration Frontend

#### Personnaliser le Logo

1. Placer votre logo dans `client/public/` (ex: `logo.svg`)
2. Modifier `client/src/const.ts` :
   ```typescript
   export const APP_LOGO = "/logo.svg";
   ```

#### Personnaliser le Thème

Modifier les couleurs dans `client/src/index.css` :

```css
:root {
  --primary: 262 83% 58%;  /* Couleur principale */
  --secondary: 220 14% 96%;
  --accent: 220 14% 96%;
  /* ... autres variables */
}
```

### Configuration Backend

#### Configurer les Limites de Taux (Rate Limiting)

Dans `app/main.py` :

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/ai/continue")
@limiter.limit("10/minute")  # Max 10 requêtes par minute
async def continue_text(...):
    ...
```

#### Configurer les Modèles OpenAI

Dans `app/services/ai_service.py` :

```python
class AIService:
    def __init__(self):
        self.model = "gpt-4"  # ou "gpt-3.5-turbo" pour réduire les coûts
        self.max_tokens = 1000
```

---

## Déploiement Production

### Déploiement Frontend

#### Option 1 : Manus (Recommandé pour ce projet)

Le projet est déjà configuré pour Manus :

1. Créer un checkpoint dans l'interface Manus
2. Cliquer sur "Publish"
3. Configurer les secrets :
   - `VITE_API_URL` : URL de votre backend en production
   - `VITE_API_BASE_URL` : Même valeur
4. L'application sera accessible sur `https://votre-app.manus.space`

#### Option 2 : Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans le dashboard Vercel
```

#### Option 3 : Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Build
pnpm build

# Déployer
netlify deploy --prod --dir=dist
```

### Déploiement Backend

#### Option 1 : Railway (Recommandé)

1. Créer un compte sur https://railway.app
2. Créer un nouveau projet
3. Ajouter PostgreSQL depuis le marketplace
4. Déployer le backend :
   ```bash
   railway login
   railway init
   railway up
   ```
5. Configurer les variables d'environnement dans le dashboard
6. L'URL du backend sera : `https://votre-app.railway.app`

#### Option 2 : Render

1. Créer un compte sur https://render.com
2. Créer un nouveau "Web Service"
3. Connecter votre repository GitHub
4. Configurer :
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Ajouter une base PostgreSQL depuis le dashboard
6. Configurer les variables d'environnement

#### Option 3 : VPS (DigitalOcean, Linode, etc.)

```bash
# Se connecter au VPS
ssh root@votre-ip

# Installer les dépendances système
apt update && apt upgrade -y
apt install python3 python3-pip postgresql nginx -y

# Cloner le repository
git clone <backend-repo>
cd literai-backend

# Installer les dépendances Python
pip3 install -r requirements.txt

# Configurer PostgreSQL
sudo -u postgres psql
CREATE DATABASE literai;
\q

# Créer le fichier .env avec les bonnes valeurs

# Lancer avec systemd
sudo nano /etc/systemd/system/literai.service
```

Contenu de `literai.service` :

```ini
[Unit]
Description=LiterAI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/literai-backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service
sudo systemctl enable literai
sudo systemctl start literai

# Configurer Nginx comme reverse proxy
sudo nano /etc/nginx/sites-available/literai
```

Contenu de la configuration Nginx :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/literai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Installer SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.votre-domaine.com
```

---

## Dépannage

### Frontend

#### Erreur "Cannot find module"

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
pnpm install
```

#### Erreur de build Vite

```bash
# Vider le cache Vite
rm -rf node_modules/.vite
pnpm dev
```

#### Erreur CORS

Vérifier que `VITE_API_URL` utilise la bonne URL et que le backend autorise l'origine dans `CORS_ORIGINS`.

### Backend

#### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL est lancé
sudo systemctl status postgresql

# Vérifier la connexion
psql -U literai_user -d literai -h localhost
```

#### Erreur OpenAI API

```bash
# Vérifier la clé API
echo $OPENAI_API_KEY

# Tester la clé
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Erreur "Module not found"

```bash
# Réinstaller les dépendances
pip install -r requirements.txt --force-reinstall
```

---

## Scripts Utiles

### Frontend

```bash
# Lancer en mode développement
pnpm dev

# Build pour production
pnpm build

# Prévisualiser le build
pnpm preview

# Linter
pnpm lint

# Formater le code
pnpm format
```

### Backend

```bash
# Lancer le serveur
uvicorn app.main:app --reload

# Créer une migration Alembic
alembic revision --autogenerate -m "Description"

# Appliquer les migrations
alembic upgrade head

# Créer un utilisateur
python -m app.scripts.create_user

# Seed la base de données
python -m app.scripts.seed_db
```

---

## Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter les fichiers `.env`** dans Git
2. **Utiliser des secrets forts** pour JWT_SECRET
3. **Activer HTTPS** en production
4. **Limiter les taux** (rate limiting) sur les endpoints IA
5. **Valider toutes les entrées** utilisateur
6. **Utiliser des variables d'environnement** pour les secrets
7. **Mettre à jour régulièrement** les dépendances

### Checklist de Sécurité

- [ ] `.env` dans `.gitignore`
- [ ] JWT_SECRET aléatoire et sécurisé
- [ ] HTTPS activé (certificat SSL)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Validation des entrées
- [ ] Logs d'erreurs sécurisés (pas de secrets)
- [ ] Backups réguliers de la base de données

---

## Support

Pour toute question :
- Consulter le README.md
- Consulter le GUIDE_UTILISATEUR.md
- Ouvrir une issue sur GitHub
- Contacter l'équipe de support

---

**Bonne installation ! 🚀**
