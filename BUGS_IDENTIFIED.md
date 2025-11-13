# Bugs Identifiés lors des Tests

## BUG-PROJECT-001: Création de projet retourne 401 Unauthorized
- **Symptôme**: Le bouton "Créer le projet" ne déclenche pas la création, POST /api/v1/projects retourne 401
- **Logs backend**: 
  ```
  INFO:     10.96.184.1:36380 - "POST /api/v1/projects HTTP/1.1" 307 Temporary Redirect
  INFO:     10.96.184.1:36382 - "POST /api/v1/projects/ HTTP/1.1" 401 Unauthorized
  ```
- **Cause probable**: Token JWT non envoyé correctement dans les headers lors de la redirection 307
- **Impact**: Impossible de créer un nouveau projet
- **Priorité**: CRITIQUE
- **Test à créer**: Test de création de projet avec authentification JWT
- **Statut**: [ ] À corriger

## BUG-URL-001: Redirections 307 sur les endpoints POST (RÉSOLU)
- **Symptôme**: Les endpoints POST sans slash final sont redirigés vers la version avec slash
- **Cause**: FastAPI redirige automatiquement `/endpoint` vers `/endpoint/`
- **Solution appliquée**: Suppression de tous les slashes finaux dans api.ts
- **Statut**: [x] Corrigé

## BUG-AUTH-001: Endpoint /auth/me manquant (RÉSOLU)
- **Symptôme**: GET /api/v1/auth/me retourne 404
- **Cause**: L'endpoint n'existait pas dans le backend
- **Solution appliquée**: Ajout de l'endpoint /me dans auth.py
- **Statut**: [x] Corrigé

## BUG-DOC-001: Création de document nécessite un titre (RÉSOLU)
- **Symptôme**: Le bouton "Créer" ne déclenchait pas la création de document
- **Cause**: Le champ titre était vide (placeholder mais pas de valeur par défaut)
- **Solution**: Remplir le champ titre avant de cliquer sur Créer
- **Statut**: [x] Résolu (comportement normal)

## Bugs Anticipés (non encore testés)
- **BUG-PYRAMID-001**: Création de nœuds pyramidaux échoue (mentionné par l'utilisateur)
- **BUG-ENTITY-001**: Création/édition d'entités (à tester)
- **BUG-ARC-001**: Création/édition d'arcs narratifs (à tester)
- **BUG-TIMELINE-001**: Création/édition d'événements timeline (à tester)
- **BUG-EXPORT-001**: Export Markdown/CSV (à tester)
- **BUG-ANALYTICS-001**: Affichage des analytics (à tester)
- **BUG-VERSION-001**: Système de versioning (à tester)
- **BUG-TAG-001**: Balisage sémantique (à tester)

## Parcours Utilisateur Testé
✅ **Étape 1**: Inscription d'un nouvel utilisateur → RÉUSSI  
✅ **Étape 2**: Connexion automatique après inscription → RÉUSSI  
❌ **Étape 3**: Création d'un nouveau projet → ÉCHOUE (401 Unauthorized)  
⏸️ **Étape 4**: Création d'un document → EN ATTENTE  
⏸️ **Étape 5**: Création d'entités → EN ATTENTE  
⏸️ **Étape 6**: Création d'arcs narratifs → EN ATTENTE  
⏸️ **Étape 7**: Création d'événements timeline → EN ATTENTE  
⏸️ **Étape 8**: Création de nœuds pyramidaux → EN ATTENTE  
⏸️ **Étape 9**: Versioning de document → EN ATTENTE  
⏸️ **Étape 10**: Consultation des analytics → EN ATTENTE  
⏸️ **Étape 11**: Export Markdown/CSV → EN ATTENTE  

## Prochaines Actions
1. **Corriger BUG-PROJECT-001** : Déboguer pourquoi le token JWT n'est pas envoyé lors de la redirection 307
2. **Tester toutes les fonctionnalités** : Continuer le parcours utilisateur étape par étape
3. **Créer des tests pour chaque bug** : Ajouter des tests unitaires et d'intégration pour chaque bug corrigé
