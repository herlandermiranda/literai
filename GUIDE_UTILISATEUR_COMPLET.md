# Guide Utilisateur Complet - LiterAI

**Version** : 1.0.0  
**Dernière mise à jour** : 11 Novembre 2025  
**Auteur** : Manus AI  

---

## Table des Matières

1. [Démarrage Rapide (Débutant)](#démarrage-rapide)
2. [Fonctionnalités Essentielles (Débutant)](#fonctionnalités-essentielles)
3. [Guide Complet (Intermédiaire)](#guide-complet)
4. [Fonctionnalités Avancées (Avancé)](#fonctionnalités-avancées)
5. [Référence Complète](#référence-complète)

---

# DÉMARRAGE RAPIDE

## Pour les Impatients (5 minutes)

### 1. Créer un Compte

Cliquez sur **Inscription** et remplissez le formulaire avec votre email et un mot de passe sécurisé. Vous recevrez une confirmation et pourrez vous connecter immédiatement.

### 2. Créer Votre Premier Projet

Une fois connecté, cliquez sur **+ Nouveau Projet** et donnez-lui un nom (ex: "Mon Roman"). LiterAI crée automatiquement une structure vide prête à l'emploi.

### 3. Ajouter un Document

Dans votre projet, cliquez sur **+ Ajouter un Document**. Donnez-lui un titre (ex: "Chapitre 1") et commencez à écrire. L'éditeur supporte le texte riche et les balises spéciales.

### 4. Utiliser les Tags Sémantiques

Pendant que vous écrivez, utilisez les tags pour marquer les éléments importants :

```
[[character:Alice]] rencontre [[place:Paris]] et découvre [[theme:l'amour]]
```

Les tags s'affichent en couleur et vous aident à organiser votre histoire.

### 5. Voir Votre Progression

Allez dans **Analytics** pour voir des graphiques de votre productivité, le nombre de mots, et les statistiques de vos personnages.

---

# FONCTIONNALITÉS ESSENTIELLES

## Authentification

**Connexion** : Entrez votre email et mot de passe. LiterAI vous garde connecté pendant 24 heures.

**Inscription** : Créez un compte en quelques secondes. Pas de vérification email requise pour commencer.

**Profil** : Cliquez sur votre nom en haut à droite pour voir votre profil et vos paramètres.

## Gestion de Projets

Un **projet** est votre espace de travail principal. Il contient tous vos documents, personnages, et notes.

| Action | Procédure |
|--------|-----------|
| **Créer** | Cliquez **+ Nouveau Projet** sur le dashboard |
| **Ouvrir** | Cliquez sur le nom du projet dans la liste |
| **Renommer** | Cliquez sur ⚙️ (paramètres) dans le projet |
| **Archiver** | Cliquez sur ⚙️ → Archiver (le projet reste accessible) |
| **Supprimer** | Cliquez sur ⚙️ → Supprimer (irréversible) |

## Gestion de Documents

Un **document** est un fichier texte dans votre projet (chapitre, scène, note, etc.).

### Créer un Document

Cliquez **+ Ajouter un Document** et choisissez un titre. Vous pouvez créer autant de documents que vous voulez.

### Écrire dans un Document

L'éditeur supporte :

- **Texte brut** : Tapez normalement
- **Markdown** : Utilisez `**gras**`, `*italique*`, `# Titre`, etc.
- **Tags sémantiques** : Utilisez `[[type:nom]]` pour marquer les éléments
- **Listes** : Tapez `- ` pour une liste à puces

### Sauvegarder

LiterAI sauvegarde **automatiquement** chaque modification. Pas besoin de cliquer sur "Enregistrer".

### Historique des Versions

Cliquez sur **Historique** pour voir toutes les versions de votre document. Vous pouvez :

- **Voir les différences** entre deux versions
- **Restaurer** une version antérieure
- **Comparer** le contenu côte à côte

---

# GUIDE COMPLET

## Les Tags Sémantiques : Explication Complète

Les **tags sémantiques** sont des balises spéciales qui vous permettent de marquer et organiser les éléments importants de votre histoire. LiterAI reconnaît 6 types de tags.

### Qu'est-ce qu'un Tag Sémantique ?

Un tag est une annotation qui vous permet de :

- **Identifier** les personnages, lieux, événements, etc. dans votre texte
- **Créer des liens** entre différentes parties de votre histoire
- **Générer automatiquement** des listes (tous les personnages, tous les lieux, etc.)
- **Analyser** votre histoire (qui apparaît le plus souvent ? quel lieu est central ?)

### Les 6 Types de Tags

#### 1. CHARACTER (Personnage) - 🟦 Bleu

Marquez les personnages de votre histoire.

**Syntaxe :**
```
[[character:Alice]]
<character>Alice</character>
```

**Exemples :**
```
[[character:Alice]] est une jeune femme courageuse.
Elle rencontre [[character:Bob]] au marché.
```

**Quand l'utiliser :**
- Première mention d'un personnage
- Dialogue important
- Actions clés du personnage
- Descriptions physiques

#### 2. PLACE (Lieu) - 🟩 Vert

Marquez les lieux de votre histoire.

**Syntaxe :**
```
[[place:Paris]]
<place>Paris</place>
```

**Exemples :**
```
L'histoire se déroule à [[place:Paris]] au 19ème siècle.
Ils voyagent de [[place:Londres]] à [[place:Rome]].
```

**Quand l'utiliser :**
- Noms de villes, pays, bâtiments
- Lieux importants pour l'intrigue
- Changements de décor
- Descriptions de paysages

#### 3. EVENT (Événement) - 🟥 Rouge

Marquez les événements importants de votre histoire.

**Syntaxe :**
```
[[event:La Révolution Française]]
<event>La Révolution Française</event>
```

**Exemples :**
```
Pendant [[event:la Révolution Française]], tout change.
L'[[event:accident de voiture]] marque le tournant de l'histoire.
```

**Quand l'utiliser :**
- Événements historiques ou fictifs majeurs
- Tournants de l'intrigue
- Accidents ou incidents importants
- Moments clés de l'histoire

#### 4. THEME (Thème) - 🟨 Jaune

Marquez les thèmes et idées principales de votre histoire.

**Syntaxe :**
```
[[theme:l'amour]]
<theme>l'amour</theme>
```

**Exemples :**
```
Le [[theme:l'amour]] est au cœur de cette histoire.
Elle explore les thèmes de [[theme:la liberté]] et [[theme:la justice]].
```

**Quand l'utiliser :**
- Thèmes majeurs de votre histoire
- Concepts philosophiques
- Idées centrales
- Motifs récurrents

#### 5. NOTE (Note) - 🟪 Violet

Marquez les notes et remarques personnelles.

**Syntaxe :**
```
[[note:À développer plus tard]]
<note>À développer plus tard</note>
```

**Exemples :**
```
[[note:Vérifier la date historique]] avant publication.
[[note:Revoir ce dialogue]] - trop long.
```

**Quand l'utiliser :**
- Rappels pour vous-même
- Points à revoir
- Idées à développer
- Questions à résoudre

#### 6. LINK (Lien) - 🟧 Orange

Marquez les connexions et relations entre éléments.

**Syntaxe :**
```
[[link:Alice aime Bob]]
<link>Alice aime Bob</link>
```

**Exemples :**
```
[[link:Alice et Bob sont frère et sœur]]
[[link:Le secret de Paris change tout]]
```

**Quand l'utiliser :**
- Relations entre personnages
- Connexions entre lieux
- Dépendances d'événements
- Causalité dans l'intrigue

### Comment Utiliser les Tags

#### Syntaxe Markdown

```
[[type:nom]]
```

Remplacez `type` par : character, place, event, theme, note, link  
Remplacez `nom` par le contenu spécifique.

**Exemples complets :**

```
[[character:Alice]] arrive à [[place:Paris]] et découvre [[event:un secret]].
Elle réalise que [[theme:l'amour]] est plus important que [[theme:l'argent]].
[[note:Vérifier la géographie]] de cette scène.
[[link:Alice et Bob sont rivaux]]
```

#### Syntaxe XML (Alternative)

```
<type>nom</type>
```

**Exemples :**

```
<character>Alice</character> arrive à <place>Paris</place>.
Elle découvre <event>un secret</event> sur <theme>l'amour</theme>.
```

#### Mélanger les Deux Syntaxes

Vous pouvez utiliser les deux dans le même document :

```
[[character:Alice]] rencontre <character>Bob</character> à <place>Paris</place>.
Elle découvre [[event:la vérité]] sur [[theme:l'amour]].
```

### Auto-complétion des Tags

Pendant que vous tapez, LiterAI vous propose des suggestions :

1. Tapez `[[` ou `<` pour déclencher l'auto-complétion
2. Tapez le type (character, place, etc.)
3. Tapez `:` ou `>`
4. Commencez à taper le nom
5. LiterAI vous propose les noms existants
6. Appuyez sur **Entrée** ou **Tab** pour accepter

**Exemple :**
```
Vous tapez : [[ch
LiterAI propose : character
Vous tapez : [[character:Al
LiterAI propose : Alice (si elle existe déjà)
```

### Affichage des Tags

Les tags s'affichent en couleur dans votre document :

- **Bleu** = Personnage
- **Vert** = Lieu
- **Rouge** = Événement
- **Jaune** = Thème
- **Violet** = Note
- **Orange** = Lien

Vous pouvez changer le mode d'affichage avec le bouton **Affichage** en haut de l'éditeur :

- **Mode Brut** : Affiche le texte avec les tags visibles
- **Mode Coloré** : Affiche les tags en couleur
- **Mode Code** : Affiche le code source avec coloration syntaxique

### Gestion des Entités

Quand vous créez un tag, LiterAI crée automatiquement une **entité** correspondante. Par exemple :

- `[[character:Alice]]` crée l'entité "Alice" de type Personnage
- `[[place:Paris]]` crée l'entité "Paris" de type Lieu

Vous pouvez voir toutes vos entités dans le panneau **Entités** à droite de l'écran.

#### Ajouter des Détails à une Entité

Cliquez sur une entité dans le panneau **Entités** pour :

- **Ajouter une description** : Décrivez le personnage, le lieu, etc.
- **Ajouter des propriétés** : Âge, couleur des yeux, population, etc.
- **Lier d'autres entités** : Créez des relations (Alice aime Bob, Paris est en France, etc.)
- **Voir les occurrences** : Voyez tous les endroits où cette entité est mentionnée

---

## Le Système Pyramidal

Le **système pyramidal** est une technique d'écriture qui organise votre histoire en trois niveaux hiérarchiques.

### Qu'est-ce que la Pyramide ?

La pyramide est une structure qui vous aide à organiser votre histoire du général au spécifique :

```
                    NIVEAU HAUT
                (Vue d'ensemble)
                        ↓
                NIVEAU INTERMÉDIAIRE
                (Sections principales)
                        ↓
                  NIVEAU BAS
              (Détails spécifiques)
```

### Les 5 Niveaux

Le système pyramidal de LiterAI utilise **5 niveaux hiérarchiques** pour organiser votre histoire du général au spécifique.

#### Niveau 0 : Vue d'Ensemble (Overview)

Le **niveau 0** est la vue d'ensemble complète de votre projet. C'est le concept général, l'idée maîtresse qui englobe tout.

**Exemples :**
- "Une jeune femme découvre un secret qui change sa vie"
- "L'histoire d'une amitié qui devient amour"
- "Un voyage initiatique à travers l'Europe"

**Quand l'utiliser :**
- Résumé de votre histoire en une phrase
- Concept général du projet
- Idée maîtresse

#### Niveau 1 : Actes Majeurs (High Level)

Le **niveau 1** divise votre histoire en actes ou parties majeurs. Chaque acte représente une phase importante de l'histoire.

**Exemples :**
- "Exposition : Alice est une jeune femme ordinaire à Paris"
- "Montée d'action : Alice rencontre Bob et découvre un secret"
- "Climax : Alice doit choisir entre la vérité et l'amour"
- "Dénouement : Alice quitte Paris"
- "Conclusion : Alice trouve une nouvelle vie"

**Quand l'utiliser :**
- Actes de votre histoire (exposition, montée, climax, etc.)
- Chapitres majeurs
- Sections principales

#### Niveau 2 : Sections (Intermediate)

Le **niveau 2** subdivise chaque acte en sections plus petites. Chaque section peut contenir plusieurs scènes.

**Exemples :**
- "Alice arrive à la gare"
- "Alice rencontre Bob au café"
- "Bob lui confie le secret"
- "Alice réalise l'importance du secret"

**Quand l'utiliser :**
- Sections d'un acte
- Groupes de scènes connexes
- Transitions entre scènes

#### Niveau 3 : Scènes (Low)

Le **niveau 3** contient les scènes individuelles. Chaque scène est une unité de narration avec un lieu, un moment, et des personnages.

**Exemples :**
- "Alice descend du train à la gare de Paris"
- "Alice et Bob se rencontrent au café"
- "Bob lui révèle le secret"

**Quand l'utiliser :**
- Scènes individuelles
- Dialogues importants
- Moments clés de l'action

#### Niveau 4 : Détails (Ultra-Détaillé)

Le **niveau 4** contient les détails ultra-spécifiques : descriptions précises, dialogues détaillés, pensées des personnages.

**Exemples :**
- "Alice descend du train, ses mains tremblent"
- "'Je dois te dire quelque chose', dit Bob en baissant la voix"
- "Alice pense : 'Tout change maintenant'"

**Quand l'utiliser :**
- Descriptions détaillées
- Dialogues complets
- Pensées internes des personnages
- Détails sensoriels

### Utiliser la Pyramide

#### Créer un Nœud Pyramidal

Allez dans l'onglet **Pyramide** et cliquez **+ Ajouter un Nœud**. Choisissez le niveau et tapez le contenu.

#### Organiser Votre Pyramide

Vous pouvez :

- **Réorganiser** les nœuds par drag-and-drop
- **Ajouter des enfants** à un nœud (créer une hiérarchie)
- **Modifier** le contenu d'un nœud
- **Supprimer** un nœud (les enfants restent)

#### Génération LLM

LiterAI peut générer automatiquement du contenu pour votre pyramide :

- **Génération descendante** : Vous décrivez le niveau haut, LiterAI génère les niveaux intermédiaires et bas
- **Génération ascendante** : Vous décrivez le niveau bas, LiterAI génère les niveaux supérieurs
- **Vérification de cohérence** : LiterAI vérifie que tous les niveaux sont cohérents

#### Exemple Complet

```
NIVEAU 0 (Overview):
"Une jeune femme découvre un secret qui change sa vie"

NIVEAU 1 (Actes):
├─ "Exposition : Alice est une jeune femme ordinaire à Paris"
├─ "Montée : Alice rencontre Bob et découvre un secret"
├─ "Climax : Alice doit choisir"
├─ "Dénouement : Alice quitte Paris"
└─ "Conclusion : Alice trouve une nouvelle vie"

NIVEAU 2 (Sections):
├─ "Alice arrive à la gare"
├─ "Alice rencontre Bob au café"
├─ "Bob lui confie le secret"
├─ "Alice réalise l'importance"
└─ "Alice décide de partir"

NIVEAU 3 (Scènes):
├─ "Alice descend du train à Paris"
├─ "Première rencontre avec Bob au café"
├─ "Bob lui révèle le secret"
├─ "Alice réalise l'importance du secret"
└─ "Alice achète un billet pour ailleurs"

NIVEAU 4 (Détails):
├─ "Alice descend du train, ses mains tremblent. La gare est bondée."
├─ "'Je dois te dire quelque chose', dit Bob en baissant la voix"
├─ "Alice pense : 'Tout change maintenant'"
├─ "Elle se rend compte que rien ne sera jamais pareil"
└─ "Elle achète un billet pour Rome, destination inconnue"
```

---

## Versioning et Historique

LiterAI sauvegarde automatiquement chaque modification et crée un historique complet.

### Comment Fonctionne le Versioning

Chaque fois que vous modifiez un document ou un nœud pyramidal, LiterAI crée automatiquement une **version**. Une version est un snapshot du contenu à un moment donné.

### Voir l'Historique

Cliquez sur **Historique** pour voir toutes les versions :

- **Date et heure** : Quand la version a été créée
- **Auteur** : Qui a fait la modification
- **Message** : Description de la modification (auto-généré ou personnalisé)
- **Contenu** : Le texte de cette version

### Comparer Deux Versions

Sélectionnez deux versions et cliquez **Comparer** pour voir les différences :

- **Vert** : Texte ajouté
- **Rouge** : Texte supprimé
- **Jaune** : Texte modifié

### Restaurer une Version Antérieure

Cliquez sur une version et sélectionnez **Restaurer**. Le contenu revient à cette version et une nouvelle version est créée pour tracer la restauration.

### Commits Manuels

Vous pouvez créer un **commit manuel** avec un message personnalisé :

1. Cliquez **Créer un Commit**
2. Tapez un message (ex: "Fin du chapitre 1")
3. Cliquez **Valider**

---

## Timeline Interactive

La **timeline** est une visualisation chronologique de votre histoire.

### Créer un Événement Timeline

Cliquez **+ Ajouter un Événement** et remplissez :

- **Titre** : Nom de l'événement
- **Date** : Quand cela se passe
- **Description** : Détails de l'événement
- **Importance** : De 1 (mineur) à 10 (crucial)

### Visualiser la Timeline

La timeline affiche tous vos événements sur une ligne chronologique. Vous pouvez :

- **Zoomer** pour voir plus de détails
- **Panner** pour naviguer dans le temps
- **Filtrer** par importance
- **Cliquer** sur un événement pour voir les détails

### Synchronisation avec les Documents

Les événements de votre timeline sont automatiquement liés à vos documents. Vous pouvez :

- Voir quel événement correspond à quel chapitre
- Vérifier la cohérence chronologique
- Identifier les trous temporels

---

## Visualisation en Graphe

Le **graphe** montre les relations entre vos entités (personnages, lieux, événements, etc.).

### Voir le Graphe

Cliquez sur l'onglet **Graphe** pour voir une visualisation interactive de votre histoire.

### Comprendre le Graphe

- **Nœuds** : Les entités (cercles)
- **Arêtes** : Les relations (lignes)
- **Couleurs** : Différents types d'entités
- **Taille** : Importance de l'entité (plus grand = plus mentionné)

### Analyser le Graphe

LiterAI fournit des analyses automatiques :

- **Centralité** : Quels personnages sont au cœur de l'histoire ?
- **Clusters** : Quels groupes de personnages sont liés ?
- **Chemins** : Quel est le chemin le plus court entre deux personnages ?

### Interagir avec le Graphe

- **Cliquer** sur un nœud pour voir ses détails
- **Drag** pour réorganiser les nœuds
- **Zoom** pour voir plus de détails
- **Filtrer** par type d'entité

---

## Exports Multi-formats

LiterAI peut exporter votre projet dans plusieurs formats.

### Formats Disponibles

| Format | Utilisation | Avantages |
|--------|------------|-----------|
| **Markdown** | Écriture, GitHub | Texte brut, facile à éditer |
| **PDF** | Lecture, partage | Mise en page professionnelle |
| **ePub** | Liseuses | Compatible Kindle, Kobo, etc. |
| **Word** | Édition, mise en forme | Facile à partager avec éditeurs |
| **RTF** | Compatibilité | Fonctionne partout |
| **CSV** | Analyse de données | Entités, personnages, timeline |

### Exporter Votre Projet

1. Cliquez **Exporter**
2. Choisissez le format
3. Configurez les options (inclure les tags ? les images ?)
4. Cliquez **Télécharger**

### Options d'Export

- **Inclure les tags** : Garde les tags sémantiques dans l'export
- **Inclure les images** : Exporte les images intégrées
- **Inclure l'historique** : Exporte toutes les versions
- **Inclure les entités** : Crée une annexe avec la liste des entités

---

## Dashboard Analytique

Le **dashboard** vous montre des statistiques sur votre projet.

### Statistiques Principales

- **Nombre de mots** : Total et par document
- **Nombre de documents** : Combien vous avez écrit
- **Nombre d'entités** : Personnages, lieux, événements, etc.
- **Productivité** : Mots écrits par jour/semaine/mois

### Graphiques

- **Progression** : Nombre de mots au fil du temps
- **Distribution** : Répartition des mots par document
- **Entités** : Personnages les plus mentionnés
- **Activité** : Quand vous écrivez le plus

### Utiliser les Statistiques

Les statistiques vous aident à :

- **Suivre votre progression** : Êtes-vous sur la bonne voie ?
- **Identifier les déséquilibres** : Un personnage est-il trop présent ?
- **Planifier** : Combien de temps pour finir ?
- **Analyser** : Quelle est votre productivité ?

---

## Gestion des Entités et Arcs Narratifs

### Entités

Une **entité** est un personnage, un lieu, un événement, etc. dans votre histoire.

#### Créer une Entité

Allez dans **Entités** et cliquez **+ Ajouter une Entité**. Remplissez :

- **Nom** : Alice
- **Type** : Personnage
- **Description** : Qui est-ce ?
- **Propriétés** : Âge, apparence, etc.

#### Lier des Entités

Vous pouvez créer des relations entre entités :

- Alice aime Bob
- Bob habite à Paris
- Paris est en France

Cliquez **+ Ajouter une Relation** et choisissez les deux entités et le type de relation.

### Arcs Narratifs

Un **arc narratif** est la progression d'un personnage ou d'une histoire à travers 5 actes.

#### Les 5 Actes

1. **Exposition** : Introduction du personnage et du monde
2. **Montée d'action** : Événements qui compliquent la situation
3. **Climax** : Point culminant, moment de vérité
4. **Dénouement** : Résolution des conflits
5. **Conclusion** : Nouvel équilibre, fin

#### Créer un Arc Narratif

Allez dans **Arcs** et cliquez **+ Ajouter un Arc**. Remplissez chaque acte avec une description.

**Exemple :**

```
ARC DE ALICE:

1. Exposition: Alice est une jeune femme ordinaire à Paris
2. Montée: Elle rencontre Bob et découvre un secret
3. Climax: Elle doit choisir entre la vérité et l'amour
4. Dénouement: Elle choisit l'amour et quitte Paris
5. Conclusion: Alice trouve une nouvelle vie ailleurs
```

#### Lier un Arc à un Personnage

Cliquez sur l'entité (Alice) et sélectionnez **Ajouter un Arc**. Choisissez l'arc que vous avez créé.

---

# FONCTIONNALITÉS AVANCÉES

## Génération LLM Avancée

LiterAI utilise l'intelligence artificielle pour vous aider à écrire.

### Types de Génération

#### Génération de Contenu

LiterAI peut générer :

- **Descriptions** : "Décris le personnage Alice"
- **Dialogues** : "Écris un dialogue entre Alice et Bob"
- **Scènes** : "Écris une scène d'action"
- **Idées** : "Donne-moi 5 idées pour compliquer l'intrigue"

#### Génération Pyramidale

- **Descendante** : Vous décrivez le niveau haut, LiterAI génère les détails
- **Ascendante** : Vous décrivez les détails, LiterAI génère le résumé
- **Bidirectionnelle** : Génération dans les deux sens

#### Amélioration de Texte

LiterAI peut :

- **Améliorer le style** : Rendre le texte plus fluide
- **Corriger la grammaire** : Détecter les erreurs
- **Rendre plus concis** : Réduire le texte
- **Développer** : Ajouter plus de détails

### Utiliser la Génération LLM

1. Sélectionnez le texte ou le nœud à générer
2. Cliquez **Générer avec IA**
3. Choisissez le type de génération
4. Configurez les paramètres (longueur, style, etc.)
5. Cliquez **Générer**
6. Acceptez ou rejetez le résultat généré

### Paramètres de Génération

- **Température** : 0 (déterministe) à 1 (créatif)
- **Longueur** : Nombre de mots à générer
- **Style** : Formel, informel, poétique, etc.
- **Ton** : Sérieux, humoristique, dramatique, etc.

---

## Analyse Avancée

### Analyse de Cohérence

LiterAI peut analyser votre histoire pour détecter :

- **Incohérences temporelles** : Les événements sont-ils dans le bon ordre ?
- **Incohérences de personnages** : Les personnages se comportent-ils de façon cohérente ?
- **Trous de l'intrigue** : Y a-t-il des gaps logiques ?
- **Redondances** : Avez-vous répété la même information ?

### Analyse de Densité

LiterAI analyse la densité de votre histoire :

- **Densité d'action** : Combien d'événements par chapitre ?
- **Densité de dialogue** : Combien de dialogue vs description ?
- **Densité de personnages** : Combien de personnages par scène ?

### Recommandations

Basé sur l'analyse, LiterAI vous propose des recommandations :

- "Le chapitre 3 est trop long, considérez le diviser"
- "Le personnage Bob n'apparaît pas assez, développez son rôle"
- "Il y a un trou temporel entre le chapitre 2 et 3"

---

## Collaboration et Partage

### Partager un Projet

Vous pouvez partager votre projet avec d'autres utilisateurs :

1. Cliquez **Partager**
2. Entrez l'email du collaborateur
3. Choisissez les permissions (lecture, écriture, admin)
4. Cliquez **Envoyer une invitation**

### Permissions

- **Lecture** : Peut lire mais pas modifier
- **Écriture** : Peut lire et modifier
- **Admin** : Peut tout faire y compris inviter d'autres

### Voir les Collaborateurs

Cliquez **Collaborateurs** pour voir qui a accès à votre projet et gérer les permissions.

---

## Intégrations Avancées

### Intégration GitHub

Vous pouvez exporter automatiquement votre projet vers GitHub :

1. Connectez votre compte GitHub
2. Créez un nouveau repository
3. Configurez la synchronisation automatique
4. Chaque modification est commitée automatiquement

### Intégration Grammaire

LiterAI peut vérifier votre grammaire en temps réel :

- Erreurs de grammaire
- Erreurs d'orthographe
- Suggestions de style
- Vérification de plagiat

---

## Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` | Sauvegarder (manuel, sinon auto) |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Refaire |
| `Ctrl+B` | Gras |
| `Ctrl+I` | Italique |
| `Ctrl+K` | Lien |
| `Ctrl+/` | Commentaire |
| `Ctrl+H` | Historique |
| `Ctrl+E` | Exporter |
| `Ctrl+G` | Générer avec IA |

---

## Troubleshooting

### Les Tags ne S'Affichent Pas

**Problème** : Vous tapez `[[character:Alice]]` mais ça n'apparaît pas en couleur.

**Solution** : Vérifiez que vous utilisez les bonnes syntaxes. Les types valides sont : character, place, event, theme, note, link.

### L'Auto-complétion ne Fonctionne Pas

**Problème** : Vous tapez `[[` mais aucune suggestion n'apparaît.

**Solution** : Appuyez sur `Ctrl+Espace` pour déclencher manuellement l'auto-complétion.

### La Génération LLM est Lente

**Problème** : La génération prend plus de 30 secondes.

**Solution** : Vérifiez votre connexion internet. Les générations longues peuvent prendre du temps.

### Je Ne Peux Pas Restaurer une Version

**Problème** : Le bouton "Restaurer" est grisé.

**Solution** : Vous ne pouvez restaurer que les versions antérieures, pas la version actuelle.

### Mon Projet a Disparu

**Problème** : Je ne vois plus mon projet dans la liste.

**Solution** : Vérifiez que vous êtes connecté au bon compte. Le projet peut être archivé (allez dans "Projets Archivés").

---

# RÉFÉRENCE COMPLÈTE

## Syntaxe Complète des Tags

### Markdown

```
[[character:Nom du personnage]]
[[place:Nom du lieu]]
[[event:Nom de l'événement]]
[[theme:Nom du thème]]
[[note:Votre note]]
[[link:Description du lien]]
```

### XML

```
<character>Nom du personnage</character>
<place>Nom du lieu</place>
<event>Nom de l'événement</event>
<theme>Nom du thème</theme>
<note>Votre note</note>
<link>Description du lien</link>
```

## Codes Couleur des Tags

| Type | Couleur | Code Hex |
|------|---------|----------|
| CHARACTER | Bleu | #3B82F6 |
| PLACE | Vert | #10B981 |
| EVENT | Rouge | #EF4444 |
| THEME | Jaune | #FBBF24 |
| NOTE | Violet | #A78BFA |
| LINK | Orange | #F97316 |

## Niveaux Pyramidaux

| Niveau | Nom | Description |
|--------|-----|-------------|
| 0 | OVERVIEW | Vue d'ensemble complète du projet |
| 1 | HIGH | Actes majeurs et phases principales |
| 2 | INTERMEDIATE | Sections et groupes de scènes |
| 3 | LOW | Scènes individuelles |
| 4 | ULTRA_DETAILED | Détails, dialogues, descriptions précises |

## Types d'Entités

| Type | Description | Exemple |
|------|-------------|---------|
| CHARACTER | Personnage | Alice, Bob |
| PLACE | Lieu | Paris, Londres |
| EVENT | Événement | La Révolution, L'accident |
| THEME | Thème | L'amour, La justice |
| NOTE | Note | À revoir, À développer |
| LINK | Lien | Alice aime Bob |

## API Endpoints (Pour Développeurs)

### Authentification

```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

### Projets

```
GET /api/v1/projects/
POST /api/v1/projects/
GET /api/v1/projects/{id}
PUT /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
```

### Documents

```
GET /api/v1/documents/projects/{project_id}/documents
POST /api/v1/documents/projects/{project_id}/documents
GET /api/v1/documents/{id}
PUT /api/v1/documents/{id}
DELETE /api/v1/documents/{id}
```

### Tags Sémantiques

```
GET /api/v1/semantic-tags/parse
POST /api/v1/semantic-tags/resolve
GET /api/v1/semantic-tags/autocomplete
POST /api/v1/semantic-tags/validate
GET /api/v1/semantic-tags/tags
```

### Versioning

```
GET /api/v1/versions/projects/{project_id}/versions
GET /api/v1/versions/documents/{document_id}/versions
GET /api/v1/versions/pyramid/{pyramid_node_id}/versions
POST /api/v1/versions/versions
POST /api/v1/versions/versions/diff
POST /api/v1/versions/versions/restore
```

### Pyramid

```
GET /api/v1/pyramid/projects/{project_id}/nodes
POST /api/v1/pyramid/nodes/
GET /api/v1/pyramid/nodes/{id}
PUT /api/v1/pyramid/nodes/{id}
DELETE /api/v1/pyramid/nodes/{id}
```

### Timeline

```
GET /api/v1/timeline/projects/{project_id}/events
POST /api/v1/timeline/projects/{project_id}/events
GET /api/v1/timeline/events/{id}
PUT /api/v1/timeline/events/{id}
DELETE /api/v1/timeline/events/{id}
```

### Entités

```
GET /api/v1/entities/projects/{project_id}/entities
POST /api/v1/entities/projects/{project_id}/entities
GET /api/v1/entities/{id}
PUT /api/v1/entities/{id}
DELETE /api/v1/entities/{id}
```

### Arcs Narratifs

```
GET /api/v1/arcs/projects/{project_id}/arcs
POST /api/v1/arcs/projects/{project_id}/arcs
GET /api/v1/arcs/{id}
PUT /api/v1/arcs/{id}
DELETE /api/v1/arcs/{id}
```

### Analytics

```
GET /api/v1/analytics/projects/{project_id}/stats
GET /api/v1/analytics/projects/{project_id}/word-count
GET /api/v1/analytics/projects/{project_id}/entities
```

### Export

```
POST /api/v1/export/projects/{project_id}/markdown
POST /api/v1/export/projects/{project_id}/pdf
POST /api/v1/export/projects/{project_id}/epub
POST /api/v1/export/projects/{project_id}/word
```

---

## Conseils et Bonnes Pratiques

### Pour les Écrivains Débutants

1. **Commencez simple** : Créez un document et écrivez sans vous préoccuper des tags
2. **Ajoutez les tags progressivement** : Une fois que vous avez du contenu, ajoutez les tags
3. **Utilisez la pyramide** : Organisez votre histoire en 3 niveaux
4. **Consultez l'historique** : Regardez vos versions pour voir votre progression

### Pour les Écrivains Expérimentés

1. **Utilisez les tags dès le départ** : Organisez votre histoire au fur et à mesure
2. **Exploitez la génération LLM** : Utilisez-la pour brainstormer et développer
3. **Analysez votre histoire** : Utilisez les graphiques et analyses pour améliorer
4. **Collaborez** : Invitez d'autres écrivains à commenter votre travail

### Pour les Éditeurs

1. **Utilisez les permissions de lecture** : Lisez sans modifier
2. **Laissez des commentaires** : Utilisez les notes pour vos retours
3. **Analysez la structure** : Utilisez la pyramide pour vérifier la cohérence
4. **Exportez en PDF** : Partagez une version finale avec le client

---

## Glossaire

**Arc Narratif** : La progression d'un personnage ou d'une histoire à travers 5 actes.

**Auto-complétion** : Suggestion automatique de mots ou de noms pendant la saisie.

**Commit** : Une sauvegarde nommée de votre travail avec un message descriptif.

**Dashboard** : Page principale montrant les statistiques et la vue d'ensemble.

**Entité** : Un personnage, un lieu, un événement, etc. dans votre histoire.

**Export** : Télécharger votre projet dans un format différent (PDF, Word, etc.).

**Historique** : Liste de toutes les versions de votre document.

**Lien** : Relation entre deux entités (Alice aime Bob).

**Nœud Pyramidal** : Un élément dans la structure pyramidale.

**Propriété** : Un attribut d'une entité (âge, couleur des yeux, population, etc.).

**Relation** : Connexion entre deux entités.

**Restaurer** : Revenir à une version antérieure.

**Sémantique** : Relatif au sens et à la signification.

**Tag** : Balise spéciale pour marquer un élément important.

**Timeline** : Visualisation chronologique des événements.

**Version** : Snapshot du contenu à un moment donné.

---

## Ressources Supplémentaires

### Documentation Officielle

- [Site Web LiterAI](https://literai.example.com)
- [Blog LiterAI](https://blog.literai.example.com)
- [FAQ](https://literai.example.com/faq)

### Communauté

- [Forum LiterAI](https://forum.literai.example.com)
- [Discord](https://discord.gg/literai)
- [Twitter](https://twitter.com/literai)

### Tutoriels Vidéo

- [Démarrage Rapide](https://youtube.com/literai-quickstart)
- [Tags Sémantiques](https://youtube.com/literai-tags)
- [Système Pyramidal](https://youtube.com/literai-pyramid)
- [Génération LLM](https://youtube.com/literai-llm)

### Exemples de Projets

- Roman de fantasy
- Nouvelle de science-fiction
- Mémoires autobiographiques
- Scénario de film

---

## Support et Aide

### Contacter le Support

- **Email** : support@literai.example.com
- **Chat** : Disponible dans l'application
- **Téléphone** : +33 1 23 45 67 89

### Signaler un Bug

Si vous trouvez un bug, veuillez :

1. Aller dans **Paramètres → Signaler un Bug**
2. Décrire le problème
3. Inclure des captures d'écran si possible
4. Cliquer **Envoyer**

### Demander une Fonctionnalité

Si vous avez une idée pour une nouvelle fonctionnalité :

1. Aller dans **Paramètres → Demander une Fonctionnalité**
2. Décrire votre idée
3. Expliquer pourquoi c'est utile
4. Cliquer **Envoyer**

---

## Changelog

### Version 1.0.0 (11 Novembre 2025)

- ✅ Lancement officiel
- ✅ Tous les tags sémantiques implémentés
- ✅ Système pyramidal complet
- ✅ Versioning Git-like
- ✅ Timeline interactive
- ✅ Visualisation en graphe
- ✅ Exports multi-formats
- ✅ Dashboard analytique
- ✅ Génération LLM
- ✅ Gestion des entités et arcs

---

**Dernière mise à jour** : 11 Novembre 2025  
**Auteur** : Manus AI  
**Version du Guide** : 1.0.0  

Pour toute question ou suggestion, veuillez contacter support@literai.example.com
