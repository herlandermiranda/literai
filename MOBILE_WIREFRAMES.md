# LiterAI Mobile - Wireframes Détaillés

**Phase 2 - Wireframes et Spécifications**  
**Date:** Novembre 2025  
**Statut:** En cours

---

## 📱 Wireframe 1 : Dashboard Projects

### Vue d'ensemble
Écran d'accueil affichant tous les projets de l'utilisateur avec possibilité de créer un nouveau projet.

### Hiérarchie des éléments

```
┌─────────────────────────────────────────┐
│ [Logo] LiterAI        [⚙️ Settings]    │ ← Top Bar (64px)
├─────────────────────────────────────────┤
│ Mes Projets                             │ ← Header (48px)
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📕 Mon Roman                        │ │ ← Project Card (120px)
│ │ 12 documents • 8 entités            │ │
│ │ Modifié il y a 2 jours              │ │
│ │                                     │ │
│ │ [Swipe left pour actions]           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📗 Histoire de Vie                  │ │
│ │ 5 documents • 3 entités             │ │
│ │ Modifié aujourd'hui                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📙 Nouvelles                        │ │
│ │ 8 documents • 12 entités            │ │
│ │ Modifié il y a 1 semaine            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│                                    [+]  │ ← FAB (56×56px)
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │ ← Bottom Navigation
└─────────────────────────────────────────┘
```

### Spécifications détaillées

**Top Bar (64px) :**
- Padding: 8px horizontal, 12px vertical
- Logo: 32×32px
- Title: "LiterAI" (16pt semibold)
- Settings icon: 24×24px, tap → Settings modal

**Header (48px) :**
- Padding: 16px
- Title: "Mes Projets" (20pt semibold)
- Optional: Sort/Filter button

**Project Card (120px) :**
- Padding: 16px
- Border radius: 8px
- Shadow: Medium
- Layout:
  - Icon (32×32px) + Title (16pt semibold)
  - Subtitle (14pt regular, secondary color)
  - Metadata (12pt regular, secondary color)
- Swipe actions (left):
  - Edit (blue)
  - Archive (orange)
  - Delete (red)

**FAB (56×56px) :**
- Position: Bottom right, 16px margin
- Icon: "+" (24×24px)
- Color: Violet
- Shadow: Large
- Tap → Create Project modal

**Bottom Navigation (64px) :**
- 5 tabs equally distributed
- Active indicator: Violet underline
- Icons: 24×24px
- Labels: 12pt regular
- Safe area padding: 8px bottom

### Interactions

| Interaction | Action | Destination |
|------------|--------|------------|
| Tap card | Open project | Project Dashboard |
| Swipe left | Reveal actions | Swipe menu |
| Tap Edit | Edit project | Edit modal |
| Tap Archive | Archive project | Confirmation + Archive |
| Tap Delete | Delete project | Confirmation + Delete |
| Tap FAB | Create project | Create modal |
| Tap Settings | Open settings | Settings modal |
| Tap tab | Navigate | Respective screen |

### Empty State

Quand aucun projet n'existe :

```
┌─────────────────────────────────────────┐
│ [Logo] LiterAI        [⚙️ Settings]    │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                    📚                   │ ← Icon (64×64px)
│                                         │
│         Aucun projet pour le moment     │ ← Title (20pt)
│                                         │
│    Créez votre premier projet pour      │ ← Description (14pt)
│    commencer à écrire votre histoire.   │
│                                         │
│           [Créer un projet]             │ ← CTA Button
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │
└─────────────────────────────────────────┘
```

---

## 📱 Wireframe 2 : Project Dashboard

### Vue d'ensemble
Affiche les statistiques du projet et accès rapide aux documents, entités, et timeline.

### Hiérarchie des éléments

```
┌─────────────────────────────────────────┐
│ ← Mon Roman              [⋯ Menu]      │ ← Top Bar (64px)
├─────────────────────────────────────────┤
│ 📊 Statistiques                         │ ← Stats Section (100px)
│ 12 documents | 8 entités | 24 tags     │
├─────────────────────────────────────────┤
│ 📄 Documents  👥 Entités  📅 Timeline  │ ← Tabs (48px)
│ 📊 Analytics                            │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📖 Chapitre 1                       │ │ ← Document Item (72px)
│ │ 2,500 mots | Modifié il y a 3j     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📖 Chapitre 2                       │ │
│ │ 1,800 mots | Modifié aujourd'hui   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📖 Prologue                         │ │
│ │ 500 mots | Modifié il y a 1s       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│                                    [+]  │ ← FAB
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │ ← Bottom Navigation
└─────────────────────────────────────────┘
```

### Spécifications détaillées

**Top Bar (64px) :**
- Back button: 24×24px, tap → Dashboard Projects
- Title: Project name (16pt semibold)
- Menu button: 24×24px, tap → Project menu

**Stats Section (100px) :**
- Padding: 16px
- 3 columns (equal width):
  - Documents count (large number + label)
  - Entities count
  - Tags count
- Background: Subtle gradient or surface color

**Tabs (48px) :**
- 4 tabs: Documents, Entities, Timeline, Analytics
- Active indicator: Violet underline
- Swipeable (optional)

**Document Item (72px) :**
- Padding: 12px
- Icon: 32×32px
- Title: 16pt semibold
- Metadata: 12pt regular, secondary color
- Swipe actions:
  - Edit (blue)
  - Archive (orange)
  - Delete (red)

**FAB (56×56px) :**
- Position: Bottom right
- Icon: "+" (24×24px)
- Tap → Create Document modal

### Interactions

| Interaction | Action | Destination |
|------------|--------|------------|
| Tap back | Go back | Dashboard Projects |
| Tap menu | Open menu | Project menu modal |
| Tap tab | Switch section | Respective tab content |
| Tap document | Open document | Document Editor |
| Swipe left | Reveal actions | Swipe menu |
| Tap FAB | Create document | Create modal |

---

## 📱 Wireframe 3 : Document Editor

### Vue d'ensemble
Écran principal pour éditer le contenu d'un document avec support complet du formatage et des tags.

### Hiérarchie des éléments

```
┌─────────────────────────────────────────┐
│ ← Chapitre 1     [💾 Save] [⋯ Menu]   │ ← Top Bar (64px)
├─────────────────────────────────────────┤
│ [B] [I] [U] [H1] [H2] [•] [1.] [...] │ ← Toolbar (48px)
├─────────────────────────────────────────┤
│                                         │
│ # Chapitre 1                            │ ← Editor Content
│                                         │
│ Lorem ipsum dolor sit amet,             │
│ consectetur adipiscing elit.            │
│                                         │
│ Sed do eiusmod tempor incididunt ut     │
│ labore et dolore magna aliqua.          │
│                                         │
│ Ut enim ad minim veniam, quis nostrud   │
│ exercitation ullamco laboris nisi ut    │
│ aliquip ex ea commodo consequat.        │
│                                         │
│ [Clavier virtuel - 50% hauteur]         │ ← Mobile Keyboard
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │ ← Bottom Navigation
└─────────────────────────────────────────┘
```

### Spécifications détaillées

**Top Bar (64px) :**
- Back button: 24×24px
- Title: Document name (16pt semibold)
- Save button: "💾" (24×24px)
- Menu button: "⋯" (24×24px)

**Toolbar (48px) :**
- Horizontal scroll (si nécessaire)
- Buttons: 40×40px
- Icons: 20×20px
- Buttons:
  - Bold [B]
  - Italic [I]
  - Underline [U]
  - Heading 1 [H1]
  - Heading 2 [H2]
  - Bullet list [•]
  - Numbered list [1.]
  - More [...] → Additional options

**Editor Content (flexible) :**
- Padding: 16px
- Font: 16pt
- Line height: 1.5
- Placeholder: "Commencez à écrire..."
- Auto-save: Toutes les 30 secondes

**Mobile Keyboard :**
- Occupe ~50% de la hauteur
- Partagé avec contenu
- Suggestions visibles au-dessus

### Interactions

| Interaction | Action | Résultat |
|------------|--------|----------|
| Tap back | Go back | Project Dashboard |
| Tap save | Save document | Save + Feedback |
| Tap menu | Open menu | Document menu modal |
| Tap toolbar button | Apply formatting | Format applied |
| Double-tap word | Select word | Word selected |
| Triple-tap | Select paragraph | Paragraph selected |
| Long-press | Context menu | Menu appears |
| Type text | Edit content | Auto-save triggered |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+B | Bold |
| Cmd/Ctrl+I | Italic |
| Cmd/Ctrl+U | Underline |
| Cmd/Ctrl+S | Save |
| Cmd/Ctrl+Z | Undo |
| Cmd/Ctrl+Y | Redo |

---

## 📱 Wireframe 4 : Entities Management

### Vue d'ensemble
Gestion complète des entités du projet (personnages, lieux, événements, thèmes, notes, liens).

### Hiérarchie des éléments

```
┌─────────────────────────────────────────┐
│ ← Entités           [🔍 Search] [⋯]   │ ← Top Bar (64px)
├─────────────────────────────────────────┤
│ 👤 📍 📅 🎭 📝 🔗                    │ ← Type Tabs (48px)
├─────────────────────────────────────────┤
│ [Rechercher une entité...]              │ ← Search (48px)
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Alice                            │ │ ← Entity Card (72px)
│ │ Protagoniste                        │ │
│ │ Apparaît dans 5 documents          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Bob                              │ │
│ │ Antagoniste                         │ │
│ │ Apparaît dans 3 documents          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Charlie                          │ │
│ │ Personnage secondaire               │ │
│ │ Apparaît dans 2 documents          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│                                    [+]  │ ← FAB
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │ ← Bottom Navigation
└─────────────────────────────────────────┘
```

### Spécifications détaillées

**Top Bar (64px) :**
- Back button: 24×24px
- Title: "Entités" (16pt semibold)
- Search icon: 24×24px
- Menu button: 24×24px

**Type Tabs (48px) :**
- 6 tabs: Characters, Places, Events, Themes, Notes, Links
- Icons: 24×24px
- Labels: 12pt regular
- Swipeable

**Search (48px) :**
- Padding: 12px
- Placeholder: "Rechercher une entité..."
- Clear button: Visible si du texte
- Real-time filtering

**Entity Card (72px) :**
- Padding: 12px
- Icon: 32×32px (type-specific)
- Title: 16pt semibold
- Subtitle: 14pt regular
- Metadata: 12pt regular, secondary color
- Swipe actions:
  - Edit (blue)
  - Delete (red)

**FAB (56×56px) :**
- Tap → Create Entity modal

### Interactions

| Interaction | Action | Destination |
|------------|--------|------------|
| Tap back | Go back | Project Dashboard |
| Tap type tab | Filter entities | Respective type |
| Type in search | Filter entities | Real-time results |
| Tap entity | View details | Entity Details modal |
| Swipe left | Reveal actions | Swipe menu |
| Tap FAB | Create entity | Create Entity modal |

---

## 📱 Wireframe 5 : Timeline View

### Vue d'ensemble
Visualisation chronologique des événements du projet.

### Hiérarchie des éléments

```
┌─────────────────────────────────────────┐
│ ← Timeline          [🔍 Search] [⋯]   │ ← Top Bar (64px)
├─────────────────────────────────────────┤
│ [Filter: All ▼] [Sort: Date ▼]        │ ← Filters (48px)
├─────────────────────────────────────────┤
│ ← 2024 | 2025 | 2026 →                 │ ← Year Selector (48px)
├─────────────────────────────────────────┤
│                                         │
│ January                                 │ ← Month Header
│ ┌─────────────────────────────────────┐ │
│ │ 1 Jan - Alice arrives               │ │ ← Event Item (72px)
│ │ Chapitre 1                          │ │
│ │ 2 entités impliquées                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 5 Jan - First meeting               │ │
│ │ Chapitre 2                          │ │
│ │ 3 entités impliquées                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ February                                │ ← Month Header
│ ┌─────────────────────────────────────┐ │
│ │ 14 Feb - Revelation                 │ │
│ │ Chapitre 3                          │ │
│ │ 1 entité impliquée                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │ ← Bottom Navigation
└─────────────────────────────────────────┘
```

### Spécifications détaillées

**Top Bar (64px) :**
- Back button: 24×24px
- Title: "Timeline" (16pt semibold)
- Search icon: 24×24px
- Menu button: 24×24px

**Filters (48px) :**
- Padding: 12px
- Filter dropdown: "All" (default)
- Sort dropdown: "Date" (default)
- Options: By type, by character, by location, etc.

**Year Selector (48px) :**
- Padding: 12px
- Left arrow: 24×24px
- Year: 20pt semibold
- Right arrow: 24×24px
- Tap arrows → Navigate years

**Month Header (32px) :**
- Padding: 12px
- Month name: 16pt semibold
- Background: Subtle background color

**Event Item (72px) :**
- Padding: 12px
- Date: 14pt semibold
- Title: 16pt semibold
- Document: 12pt regular, secondary
- Entities: 12pt regular, secondary
- Tap → Event Details modal

### Interactions

| Interaction | Action | Destination |
|------------|--------|------------|
| Tap back | Go back | Project Dashboard |
| Tap filter | Change filter | Filtered timeline |
| Tap sort | Change sort | Sorted timeline |
| Tap left arrow | Previous year | Year-1 |
| Tap right arrow | Next year | Year+1 |
| Tap event | View details | Event Details modal |
| Scroll | Navigate timeline | Scroll position |

---

## 🎯 Bottom Navigation Specifications

**Persistent Bottom Navigation (64px) :**

```
┌─────────────────────────────────────────┐
│ 🏠      📄      👥      📅      ⋯      │
│ Home   Docs   Entities Timeline  More   │
└─────────────────────────────────────────┘
```

| Tab | Icon | Label | Destination | Badge |
|-----|------|-------|-------------|-------|
| 1 | 🏠 | Home | Dashboard Projects | - |
| 2 | 📄 | Docs | Project Dashboard | Doc count |
| 3 | 👥 | Entities | Entities Management | Entity count |
| 4 | 📅 | Timeline | Timeline View | Event count |
| 5 | ⋯ | More | More menu | - |

**More Menu (Drawer) :**
- Settings
- Help & Documentation
- Export Project
- Share Project
- Logout

---

## 📋 Modals et Overlays

### Create Project Modal

```
┌─────────────────────────────────────────┐
│ ─────────────────────────────────────── │ ← Handle bar
│ Créer un nouveau projet                 │ ← Title
├─────────────────────────────────────────┤
│                                         │
│ Titre du projet                         │ ← Label
│ [_____________________________]          │ ← Input (48px)
│                                         │
│ Description (optionnel)                 │ ← Label
│ [_____________________________]          │ ← Textarea
│ [_____________________________]          │
│                                         │
│ Genre                                   │ ← Label
│ [Roman ▼]                              │ ← Dropdown
│                                         │
│                                         │
│ [Annuler]         [Créer]              │ ← Buttons
│                                         │
└─────────────────────────────────────────┘
```

### Create Document Modal

```
┌─────────────────────────────────────────┐
│ ─────────────────────────────────────── │
│ Créer un nouveau document                │
├─────────────────────────────────────────┤
│                                         │
│ Titre du document                       │
│ [_____________________________]          │
│                                         │
│ Type                                    │
│ [Chapitre ▼]                           │
│                                         │
│ [Annuler]         [Créer]              │
│                                         │
└─────────────────────────────────────────┘
```

### Create Entity Modal

```
┌─────────────────────────────────────────┐
│ ─────────────────────────────────────── │
│ Créer une nouvelle entité                │
├─────────────────────────────────────────┤
│                                         │
│ Type d'entité                           │
│ [👤 Personnage ▼]                      │
│                                         │
│ Nom                                     │
│ [_____________________________]          │
│                                         │
│ Description                             │
│ [_____________________________]          │
│ [_____________________________]          │
│                                         │
│ [Annuler]         [Créer]              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 State Management

### Loading State

```
┌─────────────────────────────────────────┐
│ [Logo] LiterAI        [⚙️ Settings]    │
├─────────────────────────────────────────┤
│                                         │
│                   ⟳                    │ ← Spinner
│                                         │
│            Chargement en cours...        │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │
└─────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────┐
│ [Logo] LiterAI        [⚙️ Settings]    │
├─────────────────────────────────────────┤
│                                         │
│                   ⚠️                    │ ← Error icon
│                                         │
│      Une erreur s'est produite          │ ← Title
│                                         │
│   Impossible de charger les projets.    │ ← Description
│   Vérifiez votre connexion.             │
│                                         │
│              [Réessayer]                │ ← CTA
│                                         │
├─────────────────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯                         │
└─────────────────────────────────────────┘
```

---

**Document créé:** Novembre 11, 2025  
**Statut:** Wireframes complets  
**Prochaine étape:** Phase 3 - Implémentation
