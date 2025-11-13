# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2025-11-10

### Ajouté

#### Fonctionnalités Principales
- **Gestion de projets et documents** avec arborescence hiérarchique
- **Éditeur de texte riche** (TipTap) avec sauvegarde automatique
- **Structure pyramidale 5 niveaux** avec IA bidirectionnelle :
  - Génération descendante (Expand)
  - Résumé ascendant (Summarize)
  - Vérification de cohérence multi-niveaux
  - Système de versioning Git-like
- **Gestion des entités narratives** (personnages, lieux, objets)
- **Arcs narratifs** avec suivi de progression
- **Timeline interactive** (Vis.js) avec drag & drop
- **Graphe de dépendances** (Cytoscape.js) avec analyse IA
- **Assistant IA** :
  - Continuation de texte
  - Réécriture et amélioration
  - Suggestions narratives
  - Analyse littéraire (ton, rythme, thèmes)
- **Tableau de bord analytique** :
  - Graphiques de complétion pyramidale
  - Statistiques de mots
  - Productivité quotidienne
  - Alertes structurelles IA
- **Exports multi-formats** (PDF, ePub, DOCX, RTF, Markdown, CSV)

#### Interface Utilisateur
- Design moderne avec shadcn/ui et Tailwind CSS 4
- Mode clair/sombre (configurable)
- Navigation par tabs horizontales
- Sidebar d'arborescence de documents
- Composants réactifs et accessibles

#### Authentification
- Système de connexion/inscription
- Gestion des tokens JWT
- Protection des routes

### Corrigé

- **Bug de double connexion** : Redirection automatique après authentification
- **Menu responsive** : Affichage sur plusieurs lignes si nécessaire
- **Erreur Mixed Content HTTP/HTTPS** : Configuration ProxyHeadersMiddleware
- **Doubles slashes dans les URLs API** : Nettoyage des endpoints

### Documentation

- README.md complet avec installation et utilisation
- GUIDE_UTILISATEUR.md détaillé pour toutes les fonctionnalités
- INSTALLATION.md avec instructions de déploiement
- AUDIT_FONCTIONNALITES.md listant toutes les fonctionnalités
- TAGS_SYSTEM_SPEC.md pour le système de balisage (à implémenter)
- PROXY_FIX_NOTES.md pour la configuration HTTPS

### Technique

- Architecture React 19 + TypeScript
- Intégration TipTap pour l'édition
- Vis.js pour la timeline
- Cytoscape.js pour le graphe
- react-arborist pour l'arborescence pyramidale
- Recharts pour les analytics
- API REST avec FastAPI (backend séparé)

## [À Venir]

### Version 1.1.0 (Planifiée)

- **Système de tags/balisage sémantique** :
  - Parser de balises `[[type:nom]]`
  - Trois modes d'affichage (brut/coloré/code)
  - Résolution automatique d'entités (fuzzy + LLM)
  - Auto-complétion dans l'éditeur
- **Recherche globale** : Barre de recherche pour projets, documents, entités
- **Collaboration temps réel** : Édition collaborative multi-utilisateurs
- **Mode hors-ligne** : Service worker pour édition sans connexion
- **Thèmes personnalisables** : Éditeur de thèmes dans l'interface

### Version 1.2.0 (Planifiée)

- **Import de projets** : Scrivener, Word, Markdown
- **Intégration calendrier** : Planification d'écriture
- **Objectifs de mots** : Suivi quotidien/hebdomadaire
- **Statistiques avancées** : Analyse de style, vocabulaire, etc.
- **Templates de projets** : Modèles prédéfinis (roman, nouvelle, etc.)

---

## Types de Changements

- `Ajouté` : Nouvelles fonctionnalités
- `Modifié` : Changements dans les fonctionnalités existantes
- `Déprécié` : Fonctionnalités bientôt supprimées
- `Supprimé` : Fonctionnalités supprimées
- `Corrigé` : Corrections de bugs
- `Sécurité` : Corrections de vulnérabilités
