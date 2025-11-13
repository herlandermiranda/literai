# Guide Utilisateur LiterAI

Guide complet pour utiliser toutes les fonctionnalités de LiterAI, votre assistant d'écriture littéraire propulsé par l'IA.

## 📚 Table des Matières

1. [Premiers Pas](#premiers-pas)
2. [Gestion des Projets](#gestion-des-projets)
3. [Éditeur de Texte](#éditeur-de-texte)
4. [Structure Pyramidale](#structure-pyramidale)
5. [Entités Narratives](#entités-narratives)
6. [Arcs Narratifs](#arcs-narratifs)
7. [Timeline](#timeline)
8. [Graphe de Dépendances](#graphe-de-dépendances)
9. [Assistant IA](#assistant-ia)
10. [Analytics](#analytics)
11. [Export](#export)

---

## Premiers Pas

### Créer un Compte

1. Accéder à l'application LiterAI
2. Cliquer sur l'onglet "Inscription"
3. Renseigner :
   - Email
   - Mot de passe
   - Nom complet (optionnel)
4. Cliquer sur "S'inscrire"
5. Vous serez automatiquement connecté et redirigé vers le dashboard

### Se Connecter

1. Accéder à l'application
2. Onglet "Connexion" (par défaut)
3. Entrer email et mot de passe
4. Cliquer sur "Se connecter"
5. Redirection automatique vers le dashboard

---

## Gestion des Projets

### Créer un Nouveau Projet

1. Depuis le **Dashboard**, cliquer sur "**Nouveau Projet**"
2. Renseigner :
   - **Titre** : Nom de votre projet (ex: "Le Royaume des Ombres")
   - **Description** : Résumé ou pitch (optionnel)
3. Cliquer sur "**Créer**"
4. Le projet apparaît dans la liste

### Ouvrir un Projet

1. Depuis le **Dashboard**, cliquer sur la **carte du projet**
2. Vous accédez à la page du projet avec tous les outils

### Supprimer un Projet

1. Depuis le **Dashboard**, cliquer sur l'icône **poubelle** sur la carte du projet
2. Confirmer la suppression

---

## Éditeur de Texte

L'éditeur TipTap est accessible via l'onglet **"Éditeur"** dans la page projet.

### Fonctionnalités de l'Éditeur

**Barre d'outils** :
- **Gras** (Ctrl+B)
- **Italique** (Ctrl+I)
- **Souligné** (Ctrl+U)
- **Titres** (H1, H2, H3)
- **Listes** (à puces, numérotées)
- **Citations**
- **Code**
- **Liens**

### Arborescence de Documents

**Sidebar gauche** : Affiche l'arborescence hiérarchique des documents

**Créer un document** :
1. Cliquer sur "**+ Nouveau Document**" dans la sidebar
2. Entrer le nom du document
3. Le document apparaît dans l'arborescence

**Naviguer entre documents** :
- Cliquer sur un document dans la sidebar pour l'ouvrir

**Organiser** :
- Drag & drop pour réorganiser (si implémenté)

### Sauvegarde

- **Sauvegarde automatique** : Toutes les modifications sont sauvegardées automatiquement
- **Sauvegarde manuelle** : Cliquer sur "**Sauvegarder**" dans le header

---

## Structure Pyramidale

La pyramide permet d'organiser votre récit sur **5 niveaux** hiérarchiques, du concept global aux détails.

### Accès

Page Projet → Onglet **"Pyramide"**

### Niveaux de la Pyramide

1. **Niveau 1** : Concept global / Thème principal
2. **Niveau 2** : Actes / Parties principales
3. **Niveau 3** : Chapitres / Séquences
4. **Niveau 4** : Scènes / Sections
5. **Niveau 5** : Paragraphes / Détails

### Créer un Nœud

1. Cliquer sur "**+ Ajouter Nœud**" au niveau souhaité
2. Entrer le titre du nœud
3. (Optionnel) Ajouter une description

### Éditer un Nœud

1. Cliquer sur le nœud dans l'arborescence
2. Modifier le titre ou la description inline
3. Sauvegarder automatiquement

### Actions IA sur les Nœuds

Chaque nœud dispose de **3 actions IA** :

#### 1. **Expand** (Génération Descendante)

**Usage** : Générer automatiquement des sous-nœuds détaillés

**Comment** :
1. Sélectionner un nœud
2. Cliquer sur "**Expand**"
3. L'IA crée 3-5 sous-nœuds avec titres et descriptions
4. Réviser et ajuster si nécessaire

**Exemple** :
- Nœud parent : "Acte 1 : Le Départ"
- Sous-nœuds générés :
  - "Chapitre 1 : La Vie Ordinaire"
  - "Chapitre 2 : L'Appel à l'Aventure"
  - "Chapitre 3 : Le Refus de l'Appel"

#### 2. **Summarize** (Résumé Ascendant)

**Usage** : Résumer plusieurs nœuds enfants en un nœud parent

**Comment** :
1. Sélectionner un nœud parent avec plusieurs enfants
2. Cliquer sur "**Summarize**"
3. L'IA génère un résumé cohérent du parent basé sur les enfants
4. Réviser et ajuster

**Exemple** :
- Enfants : "Chapitre 1", "Chapitre 2", "Chapitre 3"
- Parent résumé : "Acte 1 : Introduction du héros et déclenchement de l'aventure"

#### 3. **Check Consistency** (Vérification de Cohérence)

**Usage** : Vérifier la cohérence entre niveaux

**Comment** :
1. Sélectionner un nœud
2. Cliquer sur "**Check Consistency**"
3. L'IA analyse :
   - Cohérence parent-enfants
   - Progression logique
   - Contradictions potentielles
4. Rapport avec suggestions d'amélioration

### Versioning (Historique)

Chaque nœud dispose d'un **historique Git-like** :

1. Cliquer sur "**History**" sur un nœud
2. Voir la liste des versions (commits)
3. Comparer deux versions (diff)
4. Restaurer une version antérieure

---

## Entités Narratives

Gérez les personnages, lieux et objets de votre récit.

### Accès

Page Projet → Onglet **"Entités"**

### Types d'Entités

1. **Personnages** (Characters)
2. **Lieux** (Places)
3. **Objets** (Objects)

### Créer une Entité

1. Cliquer sur "**+ Nouvelle Entité**"
2. Choisir le type (Personnage / Lieu / Objet)
3. Remplir la fiche :
   - **Nom**
   - **Description**
   - **Traits** (pour personnages)
   - **Rôle narratif**
4. Cliquer sur "**Créer**"

### Éditer une Entité

1. Cliquer sur l'entité dans la liste
2. Modifier les champs
3. Sauvegarder

### Supprimer une Entité

1. Cliquer sur l'icône **poubelle** sur la carte de l'entité
2. Confirmer

### Fiches Détaillées

**Personnages** :
- Nom, âge, apparence
- Traits de personnalité
- Motivations
- Arc narratif
- Relations avec autres personnages

**Lieux** :
- Nom, localisation
- Description physique
- Atmosphère
- Importance narrative

**Objets** :
- Nom, description
- Symbolisme
- Rôle dans l'intrigue

---

## Arcs Narratifs

Définissez et suivez les arcs narratifs de votre récit.

### Accès

Page Projet → Onglet **"Arcs Narratifs"**

### Créer un Arc

1. Cliquer sur "**+ Nouvel Arc**"
2. Renseigner :
   - **Titre** (ex: "Arc de Rédemption de Milo")
   - **Description**
   - **Personnages liés**
3. Cliquer sur "**Créer**"

### Progression de l'Arc

1. Définir les **étapes clés** de l'arc
2. Lier des **événements** de la timeline
3. Suivre la progression (%)

---

## Timeline

Gérez la chronologie de votre récit avec une timeline interactive.

### Accès

Page Projet → Onglet **"Timeline Interactive"**

### Créer un Événement

1. Cliquer sur "**+ Nouvel Événement**"
2. Renseigner :
   - **Titre**
   - **Date** (relative ou absolue)
   - **Description**
   - **Type** (Événement / Scène / Point de plot)
3. Cliquer sur "**Créer**"

### Réorganiser les Événements

- **Drag & drop** : Glisser-déposer les événements sur la timeline
- **Zoom** : Molette de la souris pour zoomer/dézoomer
- **Filtres** : Filtrer par type d'événement

### Suggestions IA

**Combler les trous chronologiques** :
1. Cliquer sur "**Suggérer Événements**"
2. L'IA analyse la timeline et suggère des événements manquants
3. Accepter ou rejeter les suggestions

---

## Graphe de Dépendances

Visualisez les relations entre entités, arcs et événements.

### Accès

Page Projet → Onglet **"Graphe"**

### Visualisation

- **Nœuds** : Entités, arcs, événements
- **Liens** : Relations (influence, cause, etc.)
- **Layout** : Force-directed (nœuds se repoussent/attirent)

### Interactions

- **Clic** : Sélectionner un nœud
- **Hover** : Afficher les détails
- **Drag** : Déplacer un nœud
- **Zoom** : Molette de la souris

### Filtres

- **Par type** : Afficher uniquement personnages, lieux, etc.
- **Par arc** : Afficher uniquement les nœuds liés à un arc

### Analyse IA

1. Cliquer sur "**Analyser le Graphe**"
2. L'IA détecte :
   - **Nœuds isolés** (entités non connectées)
   - **Boucles** (dépendances circulaires)
   - **Points centraux** (entités clés)
3. Rapport avec suggestions

### Export

- Cliquer sur "**Export PNG**" pour sauvegarder l'image du graphe

---

## Assistant IA

L'assistant IA vous aide à améliorer votre texte.

### Accès

Page Projet → Onglet **"Assistant IA"**

### Fonctionnalités

#### 1. **Continuation**

**Usage** : Prolonger le texte selon votre style

**Comment** :
1. Sélectionner le texte de contexte
2. Cliquer sur "**Continuer**"
3. Choisir la longueur (court / moyen / long)
4. L'IA génère la suite
5. Accepter, régénérer ou modifier

#### 2. **Réécriture**

**Usage** : Améliorer le style et la clarté

**Comment** :
1. Sélectionner le texte à réécrire
2. Cliquer sur "**Réécrire**"
3. Choisir le style (formel / informel / poétique)
4. L'IA propose une version améliorée
5. Comparer et accepter/rejeter

#### 3. **Suggestions**

**Usage** : Obtenir des idées d'amélioration

**Comment** :
1. Sélectionner un passage
2. Cliquer sur "**Suggérer**"
3. L'IA propose :
   - Améliorations de style
   - Alternatives de formulation
   - Enrichissements narratifs

#### 4. **Analyse**

**Usage** : Analyse littéraire du texte

**Comment** :
1. Sélectionner le texte à analyser
2. Cliquer sur "**Analyser**"
3. L'IA fournit :
   - **Ton** : Sombre, léger, dramatique, etc.
   - **Rythme** : Rapide, lent, varié
   - **Thèmes** : Thèmes principaux détectés
   - **Suggestions** : Améliorations possibles

---

## Analytics

Tableau de bord analytique pour suivre votre progression.

### Accès

Page Projet → Onglet **"Analytics"**

### Métriques Disponibles

#### 1. **Complétion Pyramidale**

- Graphique en barres montrant le % de complétion par niveau
- Niveaux incomplets en rouge
- Suggestions pour équilibrer la structure

#### 2. **Statistiques de Mots**

- Nombre total de mots
- Mots par niveau pyramidal
- Mots par nœud
- Graphique de distribution

#### 3. **Productivité**

- Graphique de mots écrits par jour
- Tendances hebdomadaires/mensuelles
- Objectifs de mots (si définis)

#### 4. **Alertes Structurelles**

L'IA détecte automatiquement :
- **Déséquilibres** : Niveaux trop développés/sous-développés
- **Incohérences** : Contradictions entre nœuds
- **Trous narratifs** : Éléments manquants

---

## Export

Exportez votre projet dans différents formats.

### Accès

Page Projet → Onglet **"Export"**

### Formats Disponibles

1. **PDF** : Mise en page professionnelle
2. **ePub** : Format ebook (Kindle, Kobo, etc.)
3. **Word (DOCX)** : Édition externe
4. **RTF** : Compatibilité universelle
5. **Markdown** : Format texte structuré
6. **CSV** : Import Scrivener

### Exporter un Projet

1. Choisir le **format** souhaité
2. (Optionnel) Cocher "**Polish with LLM**" pour amélioration IA avant export
3. Cliquer sur "**Exporter**"
4. Le fichier est téléchargé automatiquement

### Option "Polish with LLM"

Avant l'export, l'IA :
- Corrige les fautes d'orthographe/grammaire
- Améliore la cohérence stylistique
- Harmonise le ton
- Suggère des améliorations finales

---

## Astuces et Bonnes Pratiques

### Workflow Recommandé

1. **Commencer par la pyramide** : Structurer le récit du haut vers le bas
2. **Utiliser Expand** : Générer rapidement une structure détaillée
3. **Créer les entités** : Définir personnages, lieux, objets
4. **Établir la timeline** : Organiser la chronologie
5. **Écrire dans l'éditeur** : Rédiger les scènes
6. **Utiliser l'assistant IA** : Améliorer le texte
7. **Vérifier le graphe** : Détecter les incohérences
8. **Analyser** : Suivre la progression
9. **Exporter** : Finaliser et exporter

### Raccourcis Clavier

**Éditeur** :
- `Ctrl+B` : Gras
- `Ctrl+I` : Italique
- `Ctrl+U` : Souligné
- `Ctrl+S` : Sauvegarder

**Navigation** :
- `Ctrl+K` : Recherche globale (si implémenté)

### Sauvegarde et Sécurité

- **Sauvegarde automatique** : Toutes les modifications sont sauvegardées en temps réel
- **Versioning** : Historique complet des modifications (pyramide)
- **Backup régulier** : Exporter régulièrement vos projets en PDF/DOCX

---

## Dépannage

### Je ne peux pas me connecter

- Vérifier email et mot de passe
- Vérifier la connexion internet
- Essayer de réinitialiser le mot de passe (si implémenté)

### Mes modifications ne sont pas sauvegardées

- Vérifier la connexion internet
- Vérifier que le backend est accessible
- Rafraîchir la page et réessayer

### L'assistant IA ne répond pas

- Vérifier que le backend a accès à l'API OpenAI
- Vérifier les quotas API
- Réessayer après quelques secondes

### Le graphe ne s'affiche pas

- Rafraîchir la page
- Vérifier que des entités et relations existent
- Vérifier la console pour les erreurs

---

## Support

Pour toute question ou problème :
- Consulter la documentation technique (README.md)
- Ouvrir une issue sur GitHub
- Contacter l'équipe de support

---

**Bon courage dans votre aventure littéraire avec LiterAI ! ✍️📚**
