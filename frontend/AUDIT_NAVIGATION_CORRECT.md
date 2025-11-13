# Navigation Réelle de l'Application (Vérifiée dans le Code Source)

## Structure de l'Interface

### 1. Page d'Authentification (`/auth`)
- Formulaire de connexion/inscription
- Redirection vers `/dashboard` après connexion réussie

### 2. Dashboard (`/dashboard`)
- Liste des projets de l'utilisateur
- Bouton "Nouveau Projet"
- Clic sur un projet → Redirection vers `/project/{id}`

### 3. Page Projet (`/project/{id}`)

**Layout** :
- **Header** (en haut) : Titre du projet + bouton "Retour" + bouton "Sauvegarder"
- **Sidebar gauche** (w-64) : Arborescence des documents uniquement (DocumentSidebar)
- **Zone principale** : **Menu horizontal de tabs** + contenu du tab sélectionné

**Menu Horizontal de Tabs** (vérifié ligne 262-303 de ProjectPage.tsx) :

| Tab | Icône | Composant | Description |
|-----|-------|-----------|-------------|
| **Éditeur** | FileText | RichTextEditor | Éditeur de texte riche TipTap |
| **Entités** | Users | EntitiesPanel | Gestion personnages/lieux/objets |
| **Arcs Narratifs** | GitBranch | ArcsPanel | Gestion des arcs narratifs |
| **Timeline** | Clock | TimelinePanel | Gestion simple des événements |
| **Assistant IA** | Sparkles | AIAssistantPanel | Continuation, réécriture, suggestions, analyse |
| **Timeline Interactive** | Clock | TimelineView | Timeline Vis.js avec drag & drop |
| **Graphe** | GitBranch | GraphView | Graphe Cytoscape.js des dépendances |
| **Export** | FileText | ExportPanel | Exports multi-formats (PDF, ePub, etc.) |
| **Pyramide** | GitBranch | PyramidView | Structure pyramidale 5 niveaux + IA |
| **Analytics** | FileText | AnalyticsDashboard | Tableau de bord analytique |

## Accès aux Fonctionnalités Principales

### Pyramide Multi-Niveaux (5 niveaux) avec IA Bidirectionnelle

**Chemin** : Dashboard → Cliquer sur projet → Tab "Pyramide"

**Composant** : `PyramidView.tsx` (ligne 26 de ProjectPage.tsx)

**Fonctionnalités visibles** :
- Arborescence interactive avec react-arborist
- Boutons d'action pour chaque nœud :
  - **Expand** : Génération descendante (LLM crée sous-nœuds)
  - **Summarize** : Résumé ascendant (LLM résume enfants)
  - **Check Consistency** : Vérification cohérence multi-niveaux
  - **History** : Accès au versioning Git-like
- Édition inline des nœuds
- Zoom bidirectionnel (expand/collapse)

### Graphe de Dépendances

**Chemin** : Dashboard → Cliquer sur projet → Tab "Graphe"

**Composant** : `GraphView.tsx` (ligne 24 de ProjectPage.tsx)

**Fonctionnalités visibles** :
- Visualisation Cytoscape.js avec force-directed layout
- Filtres par type (entités, arcs, événements)
- Highlighting interactif
- Détection noeuds isolés et boucles
- Export PNG
- Analyse LLM des impacts

### Timeline Interactive

**Chemin** : Dashboard → Cliquer sur projet → Tab "Timeline Interactive"

**Composant** : `TimelineView.tsx` (ligne 23 de ProjectPage.tsx)

**Fonctionnalités visibles** :
- Timeline Vis.js interactive
- Drag & drop pour réorganiser événements
- Zoom bidirectionnel
- Filtres par type
- Suggestions LLM pour combler trous chronologiques

## Différence entre "Timeline" et "Timeline Interactive"

- **Timeline** (tab 4) : Panel simple de gestion des événements (CRUD)
- **Timeline Interactive** (tab 6) : Visualisation Vis.js avancée avec interactions

## Conclusion

**Toutes les fonctionnalités demandées sont accessibles via le menu horizontal de tabs** :
- ✅ Pyramide multi-niveaux : Tab "Pyramide"
- ✅ Graphe de dépendances : Tab "Graphe"
- ✅ Timeline interactive : Tab "Timeline Interactive"

**La sidebar à gauche ne contient QUE l'arborescence des documents**, pas la navigation principale.
