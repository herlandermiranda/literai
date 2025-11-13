# LiterAI Mobile - Design System Complet

**Phase 2 - Architecture et Design System Mobile**  
**Date:** Novembre 2025  
**Statut:** En cours

---

## 📐 Design System Mobile

### Typographie

**Hiérarchie typographique complète :**

| Niveau | Taille | Poids | Line-height | Utilisation |
|--------|--------|-------|-------------|------------|
| H1 | 28pt | Bold | 1.2 | Titres d'écran principaux |
| H2 | 24pt | Semibold | 1.3 | Titres de sections |
| H3 | 20pt | Semibold | 1.3 | Sous-titres |
| H4 | 18pt | Semibold | 1.4 | Titres de cartes |
| Body | 16pt | Regular | 1.5 | Contenu principal |
| Body Small | 14pt | Regular | 1.5 | Contenu secondaire |
| Caption | 12pt | Regular | 1.4 | Labels, hints |
| Overline | 12pt | Semibold | 1.4 | Tags, badges |

**Police :** Inter (sans-serif) pour lisibilité optimale sur mobile

### Espacement (8pt Grid System)

| Token | Valeur | Utilisation |
|-------|--------|------------|
| xs | 4px | Espacement minimal |
| sm | 8px | Espacement entre éléments |
| md | 16px | Padding standard |
| lg | 24px | Espacement entre sections |
| xl | 32px | Espacement majeur |
| xxl | 48px | Espacement de page |

**Règles :**
- Padding standard : 16px (md)
- Margin standard : 16px (md)
- Espacement entre éléments : 8px (sm)
- Espacement entre sections : 24px (lg)

### Couleurs

**Palette primaire :**

| Rôle | Valeur | Utilisation |
|-----|--------|------------|
| Primary | #7C3AED (Violet) | Actions principales, accents |
| Primary Dark | #6D28D9 | Hover, active states |
| Primary Light | #A78BFA | Disabled, secondary |
| Secondary | #6B7280 (Gris) | Texte secondaire, borders |
| Success | #10B981 (Vert) | Confirmations, succès |
| Warning | #F59E0B (Orange) | Avertissements |
| Error | #EF4444 (Rouge) | Erreurs, destructive actions |
| Background | #FFFFFF (Light) / #111827 (Dark) | Fond principal |
| Surface | #F9FAFB (Light) / #1F2937 (Dark) | Cartes, surfaces |
| Text | #111827 (Light) / #F9FAFB (Dark) | Texte principal |
| Text Secondary | #6B7280 (Light) / #9CA3AF (Dark) | Texte secondaire |
| Border | #E5E7EB (Light) / #374151 (Dark) | Borders, dividers |

**Contraste minimum :** 4.5:1 pour tous les textes

### Touch Targets

| Élément | Taille | Espacement | Règle |
|---------|--------|-----------|-------|
| Button | 48×48px | 8px | Minimum iOS/Android |
| Icon Button | 44×44px | 8px | Acceptable pour icônes |
| Tab | 48px height | 0px | Barre de navigation |
| List Item | 56px height | 0px | Hauteur minimale |
| Input Field | 48px height | 8px | Saisie confortable |

**Règle d'or :** Jamais moins de 44×44px, jamais moins de 8px d'espacement

### Radius et Shadows

| Propriété | Valeur | Utilisation |
|-----------|--------|------------|
| Border Radius Small | 4px | Petits éléments |
| Border Radius Medium | 8px | Cartes, inputs |
| Border Radius Large | 12px | Modals, overlays |
| Border Radius Full | 9999px | Buttons, badges |
| Shadow Small | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| Shadow Medium | 0 4px 6px rgba(0,0,0,0.1) | Standard elevation |
| Shadow Large | 0 10px 15px rgba(0,0,0,0.15) | High elevation |

### Animations

| Animation | Durée | Easing | Utilisation |
|-----------|-------|--------|------------|
| Fade | 200ms | ease-in-out | Apparition/disparition |
| Slide | 300ms | ease-out | Navigation |
| Scale | 200ms | ease-out | Interactions |
| Bounce | 400ms | cubic-bezier | Feedback |

**Principe :** Animations fluides mais rapides (< 400ms)

---

## 📱 Architecture des Écrans

### Écran 1 : Dashboard Projects

**Objectif :** Voir tous les projets et en créer un nouveau

**Layout :**
```
┌─────────────────────────────┐
│ LiterAI        ⚙️            │  Top Bar (64px)
├─────────────────────────────┤
│ Mes Projets                 │  Header (48px)
├─────────────────────────────┤
│ ┌───────────────────────────┐│
│ │ [Project 1]               ││  Project Card
│ │ 12 documents              ││  (120px height)
│ │ Modifié il y a 2j         ││
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ [Project 2]               ││
│ │ 5 documents               ││
│ │ Modifié aujourd'hui       ││
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ [Project 3]               ││
│ │ 8 documents               ││
│ │ Modifié il y a 1s         ││
│ └───────────────────────────┘│
│                               │
│                          [+]  │  FAB (56×56px)
├─────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯              │  Bottom Navigation
└─────────────────────────────┘
```

**Composants :**
- **Top Bar** : Logo + Menu (Settings)
- **Project Card** : Titre, count, date, swipe actions
- **FAB** : Créer nouveau projet
- **Bottom Navigation** : 5 tabs

**Interactions :**
- Tap sur card → Ouvrir Project Dashboard
- FAB → Modal créer projet
- Swipe left → Archiver/Supprimer
- Long press → Sélection multiple

**Swipe Actions :**
```
[Project Card] ← Swipe left
                 [Edit] [Archive] [Delete]
```

---

### Écran 2 : Project Dashboard

**Objectif :** Vue d'ensemble du projet avec accès rapide

**Layout :**
```
┌─────────────────────────────┐
│ ← Mon Roman        ⋯        │  Top Bar (64px)
├─────────────────────────────┤
│ 📊 Statistiques             │  Stats Section (100px)
│ 12 docs | 8 entités | 24 tags
├─────────────────────────────┤
│ 📄 Documents   ▼             │  Tabs (48px)
├─────────────────────────────┤
│ ┌───────────────────────────┐│
│ │ Chapitre 1                ││  Document Item
│ │ 2,500 mots | 3j ago       ││  (72px height)
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ Chapitre 2                ││
│ │ 1,800 mots | Aujourd'hui  ││
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ Prologue                  ││
│ │ 500 mots | 1w ago         ││
│ └───────────────────────────┘│
│                               │
│                          [+]  │  FAB
├─────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯              │  Bottom Navigation
└─────────────────────────────┘
```

**Composants :**
- **Top Bar** : Titre projet + Menu
- **Stats Bar** : Chiffres clés du projet
- **Tabs** : Documents, Entities, Timeline, Analytics
- **Document List** : Infinite scroll
- **FAB** : Créer nouveau document

**Interactions :**
- Tap sur document → Ouvrir Editor
- Tabs pour changer de section
- FAB → Modal créer document
- Swipe left → Actions rapides

---

### Écran 3 : Document Editor

**Objectif :** Éditer le contenu du document

**Layout :**
```
┌─────────────────────────────┐
│ ← Chapitre 1   💾 ⋯        │  Top Bar (64px)
├─────────────────────────────┤
│ [B] [I] [U] [H1] [•] [...]  │  Toolbar (48px)
├─────────────────────────────┤
│                               │
│ # Chapitre 1                  │  Éditeur (flexible)
│                               │
│ Lorem ipsum dolor sit amet... │
│ consectetur adipiscing elit.  │
│                               │
│ Sed do eiusmod tempor...      │
│                               │
│ Ut enim ad minim veniam...    │
│                               │
│ [Clavier virtuel]             │  Clavier (50% écran)
├─────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯              │  Bottom Navigation
└─────────────────────────────┘
```

**Composants :**
- **Top Bar** : Titre + Save + Menu
- **Toolbar** : Formatage rapide
- **Editor** : TipTap optimisé mobile
- **Keyboard** : Partagé avec contenu
- **Bottom Navigation** : Accès aux autres sections

**Interactions :**
- Édition fluide du texte
- Double-tap → Sélectionner mot
- Triple-tap → Sélectionner paragraphe
- Long-press → Menu contextuel
- Toolbar buttons → Formatage rapide

---

### Écran 4 : Entities Management

**Objectif :** Gérer les entités du projet

**Layout :**
```
┌─────────────────────────────┐
│ ← Entités      🔍 ⋯        │  Top Bar (64px)
├─────────────────────────────┤
│ 👤 📍 📅 🎭 📝 🔗          │  Type Tabs (48px)
├─────────────────────────────┤
│ [Search...]                 │  Search (48px)
├─────────────────────────────┤
│ ┌───────────────────────────┐│
│ │ 👤 Alice                  ││  Entity Card
│ │ Protagoniste              ││  (72px height)
│ │ Apparaît dans 5 docs      ││
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ 👤 Bob                    ││
│ │ Antagoniste               ││
│ │ Apparaît dans 3 docs      ││
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ 👤 Charlie                ││
│ │ Personnage secondaire      ││
│ │ Apparaît dans 2 docs      ││
│ └───────────────────────────┘│
│                               │
│                          [+]  │  FAB
├─────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯              │  Bottom Navigation
└─────────────────────────────┘
```

**Composants :**
- **Top Bar** : Titre + Search + Menu
- **Type Tabs** : Filtrer par type
- **Search** : Recherche en temps réel
- **Entity Cards** : Avec swipe actions
- **FAB** : Créer nouvelle entité

**Interactions :**
- Tap sur entité → Voir détails
- Swipe left → Éditer/Supprimer
- Search → Filtre en temps réel
- Type tabs → Filtrer par type
- FAB → Modal créer entité

---

### Écran 5 : Timeline View

**Objectif :** Visualiser la chronologie des événements

**Layout :**
```
┌─────────────────────────────┐
│ ← Timeline     🔍 ⋯        │  Top Bar (64px)
├─────────────────────────────┤
│ [Filter: All] [Sort: Date]  │  Filters (48px)
├─────────────────────────────┤
│ ← 2024 | 2025 | 2026 →      │  Year Selector (48px)
├─────────────────────────────┤
│ Jan                         │  Month Header
│ ┌───────────────────────────┐│
│ │ 1 Jan - Alice arrives     ││  Event Item
│ │ Chapitre 1                ││  (72px height)
│ └───────────────────────────┘│
│                               │
│ ┌───────────────────────────┐│
│ │ 5 Jan - First meeting     ││
│ │ Chapitre 2                ││
│ └───────────────────────────┘│
│                               │
│ Feb                         │  Month Header
│ ┌───────────────────────────┐│
│ │ 14 Feb - Revelation       ││
│ │ Chapitre 3                ││
│ └───────────────────────────┘│
│                               │
├─────────────────────────────┤
│ 🏠 📄 👥 📅 ⋯              │  Bottom Navigation
└─────────────────────────────┘
```

**Composants :**
- **Top Bar** : Titre + Search + Menu
- **Filters** : Filtrer par type
- **Year Selector** : Navigation temporelle
- **Timeline** : Scroll vertical
- **Event Items** : Avec détails

**Interactions :**
- Tap sur événement → Voir détails
- Year selector → Naviguer dans le temps
- Filters → Filtrer par type
- Scroll → Voir plus d'événements

---

## 🎨 Composants Réutilisables

### Button

**Variantes :**
```
Primary (Violet)    : Utilisé pour actions principales
Secondary (Gris)    : Actions secondaires
Outline             : Actions tertiaires
Destructive (Rouge) : Actions dangereuses
```

**Tailles :**
```
Small   : 40×40px (icons)
Medium  : 48×48px (standard)
Large   : 56×56px (FAB)
```

**États :**
```
Default   : Couleur normale
Hover     : Couleur plus foncée
Active    : Couleur encore plus foncée
Disabled  : Grisé + no interaction
Loading   : Spinner + disabled
```

### Input Field

**Propriétés :**
```
Height      : 48px
Padding     : 12px horizontal, 8px vertical
Border      : 1px solid border color
Border Radius: 8px
Font Size   : 16px
```

**États :**
```
Default     : Border gris clair
Focused     : Border violet + shadow
Filled      : Fond gris clair
Error       : Border rouge
Disabled    : Fond grisé
```

### Card

**Propriétés :**
```
Padding         : 16px
Border Radius   : 8px
Background      : Surface color
Shadow          : Small shadow
Border          : 1px solid border
```

**Variantes :**
```
Elevated  : Avec shadow
Outlined  : Avec border
Filled    : Avec background
```

### List Item

**Propriétés :**
```
Height          : 56px minimum
Padding         : 12px horizontal, 8px vertical
Border Bottom   : 1px solid border
```

**Composants :**
```
Leading Icon    : 24×24px
Title           : 16pt semibold
Subtitle        : 14pt regular
Trailing Icon   : 24×24px
```

### Bottom Navigation

**Propriétés :**
```
Height          : 64px (including safe area)
Background      : Surface color
Border Top      : 1px solid border
```

**Items :**
```
Icon            : 24×24px
Label           : 12pt regular
Spacing         : Equal distribution
Active Indicator: Violet underline
```

### Modal

**Propriétés :**
```
Border Radius   : 12px top
Padding         : 16px
Background      : Surface color
Max Height      : 80% viewport
```

**Composants :**
```
Handle Bar      : 4×40px center top
Title           : 20pt semibold
Content         : Flexible
Actions         : Bottom buttons
```

---

## 🔄 Transitions et Animations

### Navigation Transitions

**Screen to Screen :**
- Slide up (modal)
- Slide left (push)
- Fade (replace)

**Duration :** 300ms  
**Easing :** ease-out

### Interaction Animations

**Button Press :**
- Scale 0.95 → 1.0
- Duration : 200ms
- Easing : ease-out

**List Item Swipe :**
- Slide left/right
- Duration : 300ms
- Easing : ease-out

**FAB Appearance :**
- Scale 0 → 1.0 + Fade
- Duration : 300ms
- Easing : ease-out

### Loading States

**Spinner :**
- Rotation continue
- Duration : 1s per rotation
- Easing : linear

**Skeleton :**
- Pulse opacity
- Duration : 1.5s
- Easing : ease-in-out

---

## 📐 Responsive Breakpoints

| Breakpoint | Taille | Devices |
|-----------|--------|---------|
| XS | 320-374px | iPhone SE, iPhone 12 mini |
| SM | 375-424px | iPhone 12, 13, 14 |
| MD | 425-767px | iPhone 14 Pro Max, small tablets |
| LG | 768-1024px | iPad, tablets |
| XL | 1025px+ | iPad Pro, large tablets |

**Stratégie :**
- XS/SM : Single column, full-width
- MD : Single column, max-width 600px
- LG+ : Adaptive layout, multi-column

---

## ♿ Accessibilité Mobile

### Touch Targets
- Minimum 44×44px
- Espacement minimum 8px
- Pas de hover (utiliser active state)

### Contraste
- Texte : 4.5:1 minimum
- Éléments graphiques : 3:1 minimum
- Focus indicators : Toujours visibles

### Screen Readers
- Labels explicites pour tous les éléments
- Ordre logique de lecture
- Descriptions pour images
- ARIA labels quand nécessaire

### Keyboard Navigation
- Tab order logique
- Escape pour fermer modals
- Enter pour confirmer
- Flèches pour naviguer listes

---

## 📊 Performance Targets

| Métrique | Cible | Priorité |
|----------|-------|----------|
| First Contentful Paint | < 1.5s | Critique |
| Largest Contentful Paint | < 2.5s | Critique |
| Cumulative Layout Shift | < 0.1 | Haute |
| Time to Interactive | < 3.5s | Haute |
| Total Bundle Size | < 500KB | Moyenne |

---

## 🧪 Checklist de Qualité

### Design
- [ ] Tous les écrans conçus
- [ ] Composants réutilisables définis
- [ ] Animations spécifiées
- [ ] Accessibility checklist complétée
- [ ] Responsive design validé

### Implémentation
- [ ] Composants React créés
- [ ] Styles Tailwind appliqués
- [ ] Responsive classes utilisées
- [ ] Animations implémentées
- [ ] Accessibility attributes ajoutés

### Tests
- [ ] Tests unitaires composants
- [ ] Tests E2E workflows
- [ ] Tests accessibilité
- [ ] Tests performance
- [ ] Tests sur vrais appareils

---

## 📚 Ressources

- Material Design 3 : https://m3.material.io/
- Apple HIG : https://developer.apple.com/design/human-interface-guidelines/
- WCAG 2.1 : https://www.w3.org/WAI/WCAG21/quickref/

---

**Document créé:** Novembre 11, 2025  
**Statut:** Design System complet  
**Prochaine étape:** Phase 3 - Implémentation
