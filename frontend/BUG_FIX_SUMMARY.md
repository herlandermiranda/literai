# LiterAI - Résumé des Corrections (Nov 12, 2025)

## Bug Principal Corrigé : BUG-026

### Titre
Erreur 500 lors de la connexion/inscription

### Symptômes
- L'utilisateur voit une erreur 500 lors de la connexion
- L'utilisateur voit une erreur 500 lors de l'inscription
- Les tests API montrent que le backend fonctionne correctement
- Le frontend compile sans erreurs TypeScript

### Cause Racine
Les endpoints POST/PUT/DELETE du frontend n'utilisaient pas le slash final, ce qui causait des redirections 307 automatiques de FastAPI. Ces redirections 307 ne transmettent pas le header `Authorization`, causant une erreur 401 qui était mal gérée.

### Solution Appliquée
Tous les endpoints POST/PUT/DELETE du fichier `client/src/lib/api.ts` ont été corrigés pour utiliser le slash final.

### Tests de Régression
- ✅ 84/84 tests backend passants (100%)
- ✅ 4/4 tests frontend passants (100%)
- ✅ Tous les tests API manuels passants

### Fichiers Modifiés
1. `client/src/lib/api.ts` - Correction de 12 endpoints
2. `todo.md` - Documentation du bug
3. `tests/integration/auth-flow.test.tsx` - Nouveau fichier de test

### Statut
✅ **RÉSOLU ET TESTÉ**
