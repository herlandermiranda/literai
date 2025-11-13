# Stratégie de Test Complète - LiterAI

## 1. Contexte et Problème

### Faille Identifiée
Une erreur basique (appel API sans token au démarrage) a échappé à 84 tests passants. Raison : **absence de tests E2E et d'intégration frontend-backend**.

### Couverture Actuelle
- ✅ Tests Unitaires Backend : 71%
- ✅ Tests d'Intégration Backend : 100% (65 tests)
- ❌ Tests E2E Frontend : 0%
- ❌ Tests d'Intégration Frontend-Backend : 0%
- ❌ Tests de Démarrage Froid : 0%

---

## 2. Plan de Tests Stratégique

### Niveau 1 : Tests Unitaires (Existants)
**Objectif** : Tester les fonctions isolées
- ✅ Services backend (71% couverture)
- ✅ Utilitaires frontend
- ✅ Parsing de tags sémantiques (19 tests)

**Maintenir** : Augmenter couverture à 80%+

---

### Niveau 2 : Tests d'Intégration Backend (Existants)
**Objectif** : Tester les endpoints API en isolation
- ✅ 65 tests d'intégration backend
- ✅ Versioning (4 tests E2E)

**Maintenir** : Tous les endpoints doivent avoir des tests

---

### Niveau 3 : Tests d'Intégration Frontend-Backend (NOUVEAU)
**Objectif** : Tester la communication réelle entre frontend et backend

#### 3.1 Tests d'Authentification
```
- [ ] Démarrage sans token (cas froid)
- [ ] Démarrage avec token valide
- [ ] Démarrage avec token expiré
- [ ] Connexion réussie
- [ ] Connexion échouée (mauvais identifiants)
- [ ] Inscription réussie
- [ ] Inscription échouée (email existant)
- [ ] Déconnexion
- [ ] Gestion des erreurs 401
- [ ] Gestion des erreurs 500
```

#### 3.2 Tests de Flux Utilisateur
```
- [ ] Créer un projet
- [ ] Créer un document
- [ ] Modifier un document
- [ ] Auto-save du document
- [ ] Créer une entité
- [ ] Ajouter un tag à un document
- [ ] Créer une version
- [ ] Comparer deux versions
- [ ] Restaurer une version
```

#### 3.3 Tests de Système de Tags
```
- [ ] Auto-complétion des tags
- [ ] Insertion de tag [[type:nom]]
- [ ] Insertion de tag <type>nom</type>
- [ ] Création automatique d'entité
- [ ] Suppression d'entité
- [ ] Affichage des entités
```

#### 3.4 Tests de Gestion d'Erreur
```
- [ ] Erreur réseau (timeout)
- [ ] Erreur 400 (validation)
- [ ] Erreur 401 (authentification)
- [ ] Erreur 403 (autorisation)
- [ ] Erreur 404 (ressource non trouvée)
- [ ] Erreur 500 (serveur)
- [ ] Affichage du message d'erreur
- [ ] Retry automatique
```

---

### Niveau 4 : Tests E2E Frontend (NOUVEAU)
**Objectif** : Tester le flux complet de l'application

#### 4.1 Scénario : Nouvel Utilisateur
```
1. Charger la page d'authentification
2. Vérifier que le formulaire s'affiche
3. S'inscrire avec email/mot de passe
4. Vérifier la redirection vers le dashboard
5. Vérifier que le profil utilisateur s'affiche
```

#### 4.2 Scénario : Utilisateur Existant
```
1. Charger la page d'authentification
2. Se connecter avec email/mot de passe
3. Vérifier la redirection vers le dashboard
4. Vérifier que les projets s'affichent
5. Ouvrir un projet
6. Vérifier que les documents s'affichent
```

#### 4.3 Scénario : Édition de Document
```
1. Ouvrir un document
2. Vérifier que l'éditeur s'affiche
3. Taper du texte
4. Vérifier l'auto-save
5. Ajouter un tag [[character:Alice]]
6. Vérifier que le tag s'affiche
7. Vérifier que l'entité est créée
```

#### 4.4 Scénario : Gestion de Versions
```
1. Ouvrir un document
2. Modifier le contenu
3. Vérifier que la version est créée
4. Voir l'historique
5. Comparer deux versions
6. Restaurer une version précédente
```

---

### Niveau 5 : Tests de Performance (NOUVEAU)
**Objectif** : Vérifier que l'application est performante

```
- [ ] Temps de chargement initial < 3s
- [ ] Temps de réponse API < 500ms
- [ ] Auto-save ne bloque pas l'interface
- [ ] Auto-complétion < 200ms
- [ ] Pas de fuites mémoire
- [ ] Pas de re-rendus inutiles
```

---

### Niveau 6 : Tests de Sécurité (NOUVEAU)
**Objectif** : Vérifier la sécurité de l'application

```
- [ ] XSS : Pas d'injection de script
- [ ] CSRF : Tokens CSRF présents
- [ ] Authentification : Tokens JWT valides
- [ ] Autorisation : Pas d'accès non autorisé
- [ ] SQL Injection : Requêtes paramétrées
- [ ] Rate Limiting : Pas de brute force
```

---

## 3. Implémentation

### Phase 1 : Tests d'Intégration Frontend-Backend
**Outil** : Playwright (tests E2E) + Jest (tests d'intégration)

**Fichiers à créer** :
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── projects.spec.ts
│   ├── documents.spec.ts
│   ├── tags.spec.ts
│   └── versions.spec.ts
├── integration/
│   ├── api-auth.test.ts
│   ├── api-projects.test.ts
│   ├── api-documents.test.ts
│   ├── api-tags.test.ts
│   └── error-handling.test.ts
└── fixtures/
    ├── test-user.ts
    ├── test-project.ts
    └── test-data.ts
```

### Phase 2 : Tests E2E Frontend
**Outil** : Playwright

### Phase 3 : Tests de Performance
**Outil** : Lighthouse + Custom Metrics

### Phase 4 : Tests de Sécurité
**Outil** : OWASP ZAP + Custom Checks

---

## 4. Checklist de Déploiement

Avant chaque déploiement, vérifier :

```
- [ ] Tous les tests unitaires passent (80%+ couverture)
- [ ] Tous les tests d'intégration backend passent
- [ ] Tous les tests d'intégration frontend-backend passent
- [ ] Tous les tests E2E passent
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur ESLint
- [ ] Aucune erreur de console
- [ ] Performance acceptable (< 3s initial load)
- [ ] Pas de fuites mémoire
- [ ] Sécurité vérifiée
```

---

## 5. Automatisation CI/CD

### GitHub Actions Workflow

```yaml
name: Tests Automatiques

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Tests Backend
      - name: Tests Unitaires Backend
        run: cd backend && pytest tests/unit -v
      
      - name: Tests d'Intégration Backend
        run: cd backend && pytest tests/integration -v
      
      - name: Couverture de Code Backend
        run: cd backend && pytest --cov=app tests/
      
      # Tests Frontend
      - name: Tests Unitaires Frontend
        run: cd frontend && npm test -- --coverage
      
      - name: Build Frontend
        run: cd frontend && npm run build
      
      # Tests E2E
      - name: Tests E2E
        run: cd frontend && npm run test:e2e
      
      # Linting
      - name: ESLint Frontend
        run: cd frontend && npm run lint
      
      - name: TypeScript Frontend
        run: cd frontend && npx tsc --noEmit
      
      # Sécurité
      - name: Vérification de Sécurité
        run: npm audit --audit-level=moderate
```

---

## 6. Métriques de Qualité

### Objectifs

| Métrique | Objectif | Actuel |
|----------|----------|--------|
| Couverture Code Backend | 80%+ | 71% |
| Couverture Code Frontend | 70%+ | 0% |
| Tests E2E | 100% des flux | 0% |
| Tests d'Intégration | 100% des endpoints | 65/65 ✅ |
| Temps de Build | < 5min | ? |
| Temps de Test | < 10min | ? |
| Performance (LCP) | < 2.5s | ? |
| Performance (FID) | < 100ms | ? |
| Erreurs Console | 0 | 0 ✅ |

---

## 7. Calendrier d'Implémentation

### Semaine 1
- [ ] Configurer Playwright pour tests E2E
- [ ] Créer tests d'authentification (5 tests)
- [ ] Créer tests de gestion d'erreur (5 tests)

### Semaine 2
- [ ] Créer tests de flux utilisateur (10 tests)
- [ ] Créer tests de système de tags (5 tests)
- [ ] Configurer CI/CD GitHub Actions

### Semaine 3
- [ ] Créer tests E2E complets (20 tests)
- [ ] Ajouter tests de performance
- [ ] Ajouter tests de sécurité

### Semaine 4
- [ ] Atteindre 80%+ couverture backend
- [ ] Atteindre 70%+ couverture frontend
- [ ] Tous les tests passants
- [ ] CI/CD automatisé

---

## 8. Leçons Apprises

### Ce qui a échoué
1. ❌ Tests unitaires isolés ne détectent pas les erreurs d'intégration
2. ❌ Pas de tests du flux de démarrage de l'application
3. ❌ Pas de tests de gestion d'erreur réseau
4. ❌ Pas de tests E2E pour valider l'UX

### Ce qui doit changer
1. ✅ Ajouter tests E2E pour chaque flux utilisateur
2. ✅ Ajouter tests d'intégration frontend-backend
3. ✅ Ajouter tests de gestion d'erreur
4. ✅ Ajouter tests de démarrage froid
5. ✅ Automatiser les tests dans CI/CD

---

## 9. Références

- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)
- [Testing Library](https://testing-library.com)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
