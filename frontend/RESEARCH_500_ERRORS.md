# Recherche Approfondie: Erreurs 500 avec FastAPI/React

## Résumé Exécutif

L'erreur 500 est une **erreur serveur interne** qui indique que le backend a rencontré une exception non gérée. Ce n'est JAMAIS un problème CORS ou de configuration frontend.

---

## Causes Connues d'Erreurs 500 avec FastAPI

### 1. **Exceptions Non Gérées dans le Code Python**
- **Cause**: Une exception Python est levée mais non capturée
- **Exemple**: Division par zéro, accès à un attribut inexistant, erreur de type
- **Solution**: Ajouter des try/except ou des exception handlers globaux

### 2. **Erreurs de Validation Pydantic en Réponse**
- **Cause**: Le modèle de réponse ne correspond pas aux données retournées
- **Exemple**: Retourner `None` pour un champ obligatoire, type incorrect
- **Solution**: Vérifier que les données retournées correspondent au `response_model`

### 3. **Problèmes de Base de Données**
- **Cause**: Connexion DB échouée, requête SQL invalide, contrainte violée
- **Exemple**: Clé étrangère manquante, transaction échouée
- **Solution**: Ajouter des logs détaillés, vérifier les migrations DB

### 4. **Erreurs d'Authentification/Autorisation**
- **Cause**: Accès à une ressource sans permission, token expiré
- **Exemple**: JWT invalide, user_id manquant
- **Solution**: Ajouter des exception handlers pour les erreurs d'auth

### 5. **Problèmes de Configuration**
- **Cause**: Variables d'environnement manquantes, configuration incorrecte
- **Exemple**: DATABASE_URL non définie, SECRET_KEY manquante
- **Solution**: Valider la configuration au démarrage

### 6. **Erreurs de Redirection HTTP**
- **Cause**: Redirection 307 qui perd les headers (notamment Authorization)
- **Exemple**: Endpoints avec slash final (`/endpoint/` → `/endpoint`)
- **Solution**: Utiliser des endpoints cohérents sans slash final

### 7. **Problèmes de Middleware**
- **Cause**: Middleware qui lève une exception non gérée
- **Exemple**: CORS middleware, authentication middleware
- **Solution**: Ajouter des exception handlers pour les middlewares

### 8. **Erreurs de Sérialisation JSON**
- **Cause**: Objet non sérialisable en JSON
- **Exemple**: datetime, UUID, objet personnalisé sans encoder
- **Solution**: Utiliser des encoders JSON personnalisés

### 9. **Timeouts**
- **Cause**: Requête qui prend trop longtemps
- **Exemple**: Requête DB lente, appel API externe qui hang
- **Solution**: Ajouter des timeouts, optimiser les requêtes

### 10. **Erreurs de Mémoire**
- **Cause**: Fuite mémoire, allocation excessive
- **Exemple**: Boucle infinie, large dataset en mémoire
- **Solution**: Profiler l'application, optimiser les requêtes

---

## Meilleures Pratiques pour Éviter les Erreurs 500

### 1. **Logging Complet**
```python
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### 2. **Exception Handlers Spécifiques**
- Créer des handlers pour chaque type d'exception attendue
- Utiliser des status codes appropriés (400, 401, 403, 404, 422, 500)
- Fournir des messages d'erreur clairs

### 3. **Validation Stricte**
- Valider les inputs avec Pydantic
- Valider les outputs avec `response_model`
- Utiliser des types stricts (pas `Any`)

### 4. **Configuration Sécurisée**
- Charger la configuration au démarrage
- Valider que toutes les variables d'environnement requises sont présentes
- Utiliser des valeurs par défaut sûres

### 5. **Tests Complets**
- Tester tous les endpoints avec des données valides et invalides
- Tester les cas d'erreur (DB down, auth failed, etc.)
- Tester les timeouts et les limites de ressources

### 6. **Monitoring et Alertes**
- Logger tous les erreurs 500
- Configurer des alertes pour les erreurs 500
- Utiliser des outils comme Sentry pour le tracking

### 7. **Documentation des Erreurs**
- Documenter les erreurs possibles pour chaque endpoint
- Fournir des codes d'erreur standardisés
- Inclure des instructions pour résoudre les erreurs

---

## Configuration FastAPI Recommandée pour la Production

### 1. **Exception Handlers Globaux**
```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)
app = FastAPI()

# Handler pour HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "path": str(request.url.path)
        }
    )

# Handler pour toutes les autres exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "path": str(request.url.path)
        }
    )
```

### 2. **CORS Configuration Sécurisée**
```python
from fastapi.middleware.cors import CORSMiddleware

# Ne JAMAIS utiliser ["*"] en production
origins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Spécifier explicitement
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 3. **Logging Configuration**
```python
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("app.log")
    ]
)
```

### 4. **Validation de Configuration au Démarrage**
```python
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    api_key: str
    
    class Config:
        env_file = ".env"

try:
    settings = Settings()
except Exception as e:
    logger.error(f"Configuration error: {e}")
    sys.exit(1)
```

---

## Configuration React/Frontend Recommandée

### 1. **Gestion des URLs d'API**
```typescript
// const.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_V1_PREFIX = '/api/v1';

// Vérifier que l'URL est valide au démarrage
if (!API_BASE_URL) {
    console.error('API_BASE_URL is not configured');
    throw new Error('API_BASE_URL is required');
}
```

### 2. **Gestion des Erreurs API**
```typescript
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${API_V1_PREFIX}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: response.statusText }));
            
            // Logguer l'erreur
            console.error(`API Error ${response.status}: ${endpoint}`, error);
            
            throw new APIError(error.detail, response.status, error);
        }

        return await response.json();
    } catch (error) {
        console.error(`Request failed: ${endpoint}`, error);
        throw error;
    }
}
```

### 3. **Tests d'Erreurs 500**
```typescript
describe('API Error Handling', () => {
    it('should not return 500 on login', async () => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        });
        
        expect(response.status).not.toBe(500);
        expect([200, 401, 422]).toContain(response.status);
    });
});
```

---

## Checklist de Déploiement

- [ ] Tous les exception handlers sont en place
- [ ] Logging est configuré et testé
- [ ] CORS est configuré avec des origines spécifiques (pas de wildcard)
- [ ] Tous les endpoints utilisent des URLs cohérentes (sans slash final)
- [ ] Variables d'environnement sont validées au démarrage
- [ ] Base de données est accessible et les migrations sont appliquées
- [ ] Tests incluent les cas d'erreur (500, 401, 403, 404, 422)
- [ ] Monitoring et alertes sont configurés
- [ ] Documentation des erreurs est à jour
- [ ] Secrets ne sont pas en dur dans le code
- [ ] Timeouts sont configurés
- [ ] Logs sont centralisés et accessibles

---

## Outils de Debugging

### 1. **Uvicorn avec Debug Mode**
```bash
uvicorn app.main:app --reload --log-level debug
```

### 2. **Sentry pour le Tracking**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

### 3. **Logs Structurés**
```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_data)
```

---

## Conclusion

Les erreurs 500 sont **toujours** causées par une exception non gérée côté backend. Pour les éviter:

1. **Ajouter des exception handlers globaux** pour capturer toutes les erreurs
2. **Logger toutes les erreurs** avec des détails complets
3. **Valider les inputs et outputs** strictement
4. **Tester tous les cas d'erreur** automatiquement
5. **Monitorer les erreurs** en production
6. **Documenter les erreurs** possibles pour chaque endpoint

Avec ces pratiques, les erreurs 500 deviennent rares et faciles à diagnostiquer.
