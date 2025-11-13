# LiterAI - Monorepo

Architecture monorepo pour LiterAI avec déploiement sur Vercel (frontend) + Railway (backend).

## Structure

```
literai/
├── frontend/          # React + Vite (déploié sur Vercel)
├── backend/           # FastAPI (déploié sur Railway)
├── vercel.json        # Configuration Vercel
├── railway.json       # Configuration Railway
└── README.md          # Ce fichier
```

## Développement Local

### Frontend (Manus)

```bash
cd frontend
pnpm install
pnpm dev
# Accès: http://localhost:3000
```

### Backend (Manus)

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Accès: http://localhost:8000
```

## Déploiement

### Vercel (Frontend)

1. Connecter le repo GitHub à Vercel
2. Configuration automatique via `vercel.json`
3. Build command: `cd frontend && pnpm install && pnpm build`
4. Output directory: `frontend/dist`

### Railway (Backend)

1. Connecter le repo GitHub à Railway
2. Configuration automatique via `railway.json`
3. Start command: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Variables d'Environnement

### Vercel
- `VITE_API_BASE_URL`: URL du backend (configurée automatiquement via `vercel.json`)

### Railway
- `PORT`: Port d'écoute (défaut: 8000)
- Autres variables: à configurer dans Railway dashboard

## Proxy API

Vercel proxy automatiquement `/api/v1/*` vers Railway via `vercel.json`:

```
/api/v1/auth/login → https://railway-backend.up.railway.app/api/v1/auth/login
```

## Git Workflow

```bash
# Cloner le repo
git clone https://github.com/votre-username/literai.git
cd literai

# Créer une branche
git checkout -b feature/ma-feature

# Commiter et pusher
git add .
git commit -m "feat: description"
git push origin feature/ma-feature

# Créer une Pull Request sur GitHub
```

## Notes

- Le frontend et backend se développent indépendamment
- Les déploiements sont automatiques via GitHub (push → Vercel/Railway)
- Le proxy Vercel gère la communication frontend ↔ backend en production
- En développement local, Vite proxy `/api/v1` vers `localhost:8000`
