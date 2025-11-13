# LiterAI - Assistant d'Écriture Littéraire

Assistant d'écriture littéraire propulsé par l'IA, conçu pour aider les auteurs à structurer, développer et enrichir leurs projets narratifs grâce à des outils avancés de planification et d'analyse.

## 🎯 Fonctionnalités Principales

### ✅ Gestion de Projets et Documents
- Création et organisation de projets littéraires
- Éditeur de texte riche (TipTap) avec sauvegarde automatique
- Arborescence hiérarchique de documents
- Compteur de mots et statistiques d'écriture

### ✅ Structure Pyramidale Multi-Niveaux (5 niveaux)
- Organisation hiérarchique du récit (du concept global aux détails)
- **IA bidirectionnelle** :
  - **Génération descendante** (Expand) : L'IA crée des sous-nœuds détaillés
  - **Résumé ascendant** (Summarize) : L'IA résume les enfants en un nœud parent
  - **Vérification de cohérence** multi-niveaux
- Édition inline avec arborescence interactive
- Système de versioning Git-like (commits, diff, restauration)

### ✅ Gestion des Entités Narratives
- **Personnages** : Fiches détaillées avec traits, motivations, arcs
- **Lieux** : Descriptions, atmosphères, importance narrative
- **Objets** : Objets significatifs avec symbolisme

### ✅ Arcs Narratifs
- Définition et suivi des arcs narratifs
- Liens avec personnages et événements
- Visualisation de la progression

### ✅ Timeline Interactive
- Timeline Vis.js avec drag & drop
- Zoom bidirectionnel et filtres par type
- Suggestions LLM pour combler les trous chronologiques
- Gestion des événements avec dates et descriptions

### ✅ Graphe de Dépendances
- Visualisation Cytoscape.js des relations entre entités
- Force-directed layout avec highlighting interactif
- Filtres par type (entités, arcs, événements)
- Détection des nœuds isolés et boucles
- Export PNG et analyse LLM des impacts

### ✅ Assistant IA Intégré
- **Continuation** : Prolongement du texte selon le style
- **Réécriture** : Amélioration du style et de la clarté
- **Suggestions** : Propositions d'amélioration
- **Analyse** : Analyse littéraire (ton, rythme, thèmes)

### ✅ Tableau de Bord Analytique
- Graphiques de complétion par niveau pyramidal
- Statistiques de mots par niveau/nœud
- Graphiques de productivité quotidienne
- Alertes de déséquilibres structurels (LLM)

### ✅ Exports Multi-Formats
- **PDF** : Mise en page professionnelle
- **ePub** : Format ebook
- **Word (DOCX)** : Édition externe
- **RTF** : Compatibilité universelle
- **Markdown** : Format texte structuré
- **CSV** : Import Scrivener
- Option "polish with LLM" pour amélioration avant export

## 🏗️ Architecture Technique

### Frontend
- **Framework** : React 19 + TypeScript
- **Routing** : Wouter
- **UI** : shadcn/ui + Tailwind CSS 4
- **Éditeur** : TipTap (éditeur WYSIWYG)
- **Timeline** : Vis.js
- **Graphe** : Cytoscape.js
- **Arborescence** : react-arborist
- **Charts** : Recharts

### Backend (Séparé)
- **Framework** : FastAPI (Python)
- **Base de données** : PostgreSQL
- **ORM** : SQLAlchemy
- **IA** : OpenAI GPT-4
- **Export** : Pandoc

### Déploiement
- **Frontend** : Static hosting (Manus, Vercel, Netlify)
- **Backend** : À déployer séparément (Railway, Render, VPS)

## 📦 Installation

### Prérequis
- Node.js 22.x
- pnpm (ou npm/yarn)
- Backend LiterAI déployé et accessible

### Installation Frontend

1. **Cloner le repository**
```bash
git clone <repository-url>
cd literai-frontend
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` à la racine :
```env
VITE_API_URL=https://votre-backend-url.com
VITE_API_BASE_URL=https://votre-backend-url.com
```

4. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

5. **Build pour production**
```bash
pnpm build
```

Les fichiers de production seront dans le dossier `dist/`

## 🚀 Déploiement

### Déploiement Frontend (Manus)

Le projet est déjà configuré pour Manus. Après avoir créé un checkpoint :
1. Cliquer sur "Publish" dans l'interface Manus
2. L'application sera accessible sur `https://votre-app.manus.space`

### Déploiement Backend (Requis)

Le backend doit être déployé séparément. Options recommandées :
- **Railway** : Déploiement simple avec PostgreSQL intégré
- **Render** : Alternative gratuite avec PostgreSQL
- **VPS** : Contrôle total (DigitalOcean, Linode, etc.)

Après déploiement, mettre à jour `VITE_API_URL` dans les secrets Manus.

## 📖 Guide Utilisateur

Voir [GUIDE_UTILISATEUR.md](./GUIDE_UTILISATEUR.md) pour un guide complet d'utilisation.

## 🗂️ Structure du Projet

```
literai-frontend/
├── client/                    # Code frontend
│   ├── public/               # Assets statiques
│   ├── src/
│   │   ├── components/       # Composants React
│   │   │   ├── ui/          # Composants shadcn/ui
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── PyramidView.tsx
│   │   │   ├── GraphView.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   └── ...
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── Auth.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ProjectPage.tsx
│   │   ├── contexts/        # Contextes React
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/             # Utilitaires
│   │   │   ├── api.ts       # Client API
│   │   │   └── utils.ts
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── const.ts         # Constantes
│   │   ├── App.tsx          # Composant racine
│   │   └── main.tsx         # Point d'entrée
│   ├── index.html
│   └── package.json
├── shared/                   # Types partagés (placeholder)
├── vite.config.ts           # Configuration Vite
├── tailwind.config.ts       # Configuration Tailwind
├── tsconfig.json            # Configuration TypeScript
├── README.md                # Ce fichier
├── GUIDE_UTILISATEUR.md     # Guide utilisateur complet
├── AUDIT_FONCTIONNALITES.md # Audit des fonctionnalités
├── TAGS_SYSTEM_SPEC.md      # Spécification système de tags
└── todo.md                  # Suivi des tâches

```

## 🔧 Configuration

### Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `https://api.literai.com` |
| `VITE_API_BASE_URL` | URL de base de l'API | `https://api.literai.com` |
| `VITE_APP_TITLE` | Titre de l'application | `LiterAI` |

### Personnalisation

**Logo** : Modifier `APP_LOGO` dans `client/src/const.ts`

**Thème** : Modifier les couleurs dans `client/src/index.css` (variables CSS)

**Favicon** : Via l'interface de gestion (Settings → General)

## 🐛 Dépannage

### Problème de connexion au backend

**Symptôme** : Erreur "Mixed Content" ou 403/401

**Solution** :
1. Vérifier que `VITE_API_URL` utilise HTTPS (pas HTTP)
2. Vérifier que le backend est accessible
3. Vérifier que le backend a `ProxyHeadersMiddleware` configuré

### Erreur de token expiré

**Symptôme** : Erreur 401 après un certain temps

**Solution** : Se déconnecter et se reconnecter pour obtenir un nouveau token

### Menu de tabs coupé

**Symptôme** : Certains onglets ne sont pas visibles

**Solution** : Déjà corrigé dans la dernière version (flex-wrap)

## 📝 Documentation Technique

- **[AUDIT_FONCTIONNALITES.md](./AUDIT_FONCTIONNALITES.md)** : Liste complète des fonctionnalités implémentées
- **[TAGS_SYSTEM_SPEC.md](./TAGS_SYSTEM_SPEC.md)** : Spécification du système de balisage sémantique
- **[PROXY_FIX_NOTES.md](./PROXY_FIX_NOTES.md)** : Notes sur la configuration proxy HTTPS

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **shadcn/ui** : Composants UI de qualité
- **TipTap** : Éditeur WYSIWYG extensible
- **Vis.js** : Timeline interactive
- **Cytoscape.js** : Visualisation de graphes
- **OpenAI** : API GPT-4 pour l'assistance IA

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation dans le dossier `docs/`
- Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2025  
**Auteur** : Équipe LiterAI
