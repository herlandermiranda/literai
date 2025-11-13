# Configuration des URLs API - Guide Complet

## 🎯 URLs à Utiliser

### Pour Accès Depuis l'Extérieur (Production)

```
VITE_API_BASE_URL = https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer
VITE_API_URL      = https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer
```

### Pour Développement Local

```
VITE_API_BASE_URL = http://localhost:8000
VITE_API_URL      = http://localhost:8000
```

## 📋 Variables d'Environnement

### VITE_API_BASE_URL (Primaire)
- **Description :** URL de base du backend API
- **Priorité :** Première variable vérifiée
- **Fallback :** VITE_API_URL
- **Valeur Production :** `https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer`

### VITE_API_URL (Fallback)
- **Description :** URL alternative du backend API
- **Priorité :** Utilisée si VITE_API_BASE_URL n'est pas définie
- **Fallback :** URL relative `/api` (même origine)
- **Valeur Production :** `https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer`

## 🔍 Où Cette URL est Utilisée

### 1. API Client Principal
**Fichier :** `client/src/lib/api_client.ts`
```typescript
constructor(baseURL: string = `${API_BASE_URL}${API_V1_PREFIX}`) {
  this.baseURL = baseURL;
}
```
- Utilisé par : Tous les appels API (login, register, endpoints protégés, etc.)

### 2. Configuration Dynamique
**Fichier :** `client/src/lib/apiConfig.ts`
```typescript
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const envApiUrl = import.meta.env.VITE_API_URL;
```
- Détermine automatiquement l'URL à utiliser
- Ordre de priorité : VITE_API_BASE_URL → VITE_API_URL → URL relative → localhost

### 3. Composants Frontend
**Fichiers :**
- `client/src/components/AnalyticsDashboard.tsx` - Statistiques
- `client/src/components/ExportPanel.tsx` - Export de documents
- `client/src/components/VersionHistoryPanel.tsx` - Historique de versions

**Utilisation :**
```typescript
fetch(`${API_BASE_URL}${API_V1_PREFIX}/analytics/projects/${projectId}/...`)
```

## ✅ Validation

### Tests de Configuration
```bash
# Exécuter les tests
npx vitest run tests/e2e/real-user-scenario.test.ts

# Résultats attendus
✓ Login fonctionne (200)
✓ Endpoints protégés accessibles (200)
✓ Credentials invalides → 401 (pas 500)
✓ Pas de token → 403 (pas 500)
```

### Vérification Manuelle
1. Ouvrir la page de login : `https://3000-...`
2. Entrer email/password valides
3. Cliquer sur "Se connecter"
4. Vérifier qu'il n'y a pas d'erreur 500
5. Vérifier que vous êtes redirigé vers le dashboard

## 🔐 Sécurité

### Points Importants
1. ✅ HTTPS obligatoire en production
2. ✅ Pas d'URLs en dur dans le code (utiliser les variables d'environnement)
3. ✅ Les tokens JWT sont stockés en mémoire (pas dans localStorage)
4. ✅ Les refresh tokens sont dans des HTTP-only cookies

### Vérification de Sécurité
```bash
# Chercher les URLs en dur
grep -r "https://8000-\|http://localhost:8000" client/src --include="*.ts" --include="*.tsx"

# Résultat attendu : Aucune URL en dur (sauf dans apiConfig.ts pour le fallback)
```

## 📝 Notes de Déploiement

### Avant de Déployer
1. ✅ Vérifier que `VITE_API_BASE_URL` est configuré
2. ✅ Vérifier que `VITE_API_URL` est configuré (même valeur)
3. ✅ Exécuter les tests : `npx vitest run`
4. ✅ Tester manuellement le login/registration
5. ✅ Vérifier les logs du navigateur (console) pour les erreurs

### Après Déploiement
1. ✅ Tester le login depuis le navigateur
2. ✅ Tester la registration
3. ✅ Tester la création de projet
4. ✅ Vérifier les logs du backend pour les erreurs

## 🆘 Dépannage

### Erreur 500 sur Login/Registration
**Cause probable :** URL API mal configurée
**Solution :**
1. Vérifier que `VITE_API_BASE_URL` est défini
2. Vérifier que l'URL est correcte (HTTPS, pas de typo)
3. Vérifier que le backend est accessible depuis cette URL
4. Vérifier les logs du navigateur (console)

### Erreur CORS
**Cause probable :** Frontend et backend sur des origines différentes
**Solution :**
1. Vérifier que le backend accepte les requêtes CORS
2. Vérifier que l'URL du backend est correcte
3. Vérifier les headers CORS dans la réponse du backend

### Erreur de Connexion
**Cause probable :** Backend non accessible
**Solution :**
1. Vérifier que le backend est en cours d'exécution
2. Vérifier que l'URL du backend est correcte
3. Vérifier la connectivité réseau
4. Vérifier les logs du backend

## 📚 Références

- [Configuration Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [JWT Authentication](https://jwt.io/)
