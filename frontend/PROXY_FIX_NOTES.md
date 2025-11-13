# Solution au Problème de Redirection HTTP/HTTPS

## Problème Identifié

Lorsque FastAPI est derrière un proxy HTTPS (comme le tunnel Manus), les redirections automatiques (par exemple de `/projects` vers `/projects/`) utilisent HTTP au lieu de HTTPS, causant des erreurs Mixed Content.

## Cause Racine

FastAPI ne sait pas qu'il est derrière un proxy HTTPS. Il voit uniquement la connexion HTTP locale du proxy vers l'application, donc il génère des URLs de redirection en HTTP.

## Solution Officielle (Documentation FastAPI)

Utiliser l'option CLI `--forwarded-allow-ips` lors du démarrage d'Uvicorn :

```bash
fastapi run --proxy-headers --forwarded-allow-ips="*"
# OU avec uvicorn directement
uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"
```

Cette option fait qu'Uvicorn :
1. Lit les en-têtes `X-Forwarded-*` envoyés par le proxy
2. Utilise ces en-têtes pour déterminer le protocole (HTTPS) et le host original
3. Génère des redirections avec le bon protocole (HTTPS)

## Alternative : ProxyHeadersMiddleware

Si on ne peut pas utiliser les options CLI, on peut ajouter le middleware manuellement :

```python
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")
```

**MAIS** : Ce middleware doit être combiné avec `redirect_slashes=True` (valeur par défaut).

## Configuration Recommandée

### Backend (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
    # redirect_slashes=True par défaut, ne pas le désactiver
)

# Proxy headers middleware (doit être ajouté en premier)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# CORS middleware
app.add_middleware(CORSMiddleware, ...)
```

### Frontend (client/src/lib/api.ts)

Utiliser **toujours le slash final** pour correspondre aux routes FastAPI :

```typescript
export const projectsAPI = {
  list: () => apiRequest<Project[]>("/projects/"),
  get: (id: string) => apiRequest<Project>(`/projects/${id}/`),
  // ...
}
```

## Pourquoi Cette Solution Fonctionne

1. FastAPI définit les routes avec slash final : `@router.get("/")`
2. Le prefix du router ajoute `/projects`
3. L'URL finale est `/api/v1/projects/`
4. Si le client appelle `/api/v1/projects` (sans slash), FastAPI redirige vers `/api/v1/projects/`
5. Avec `ProxyHeadersMiddleware`, la redirection utilise HTTPS au lieu de HTTP
6. Le client suit la redirection et obtient la réponse correcte

## Actions à Effectuer

1. ✅ Ajouter `ProxyHeadersMiddleware` au backend (déjà fait)
2. ✅ Remettre `redirect_slashes=True` (enlever l'option `redirect_slashes=False`)
3. ✅ S'assurer que le frontend utilise les slashes finaux (déjà fait)
4. ✅ Redémarrer le backend
5. ✅ Tester l'application
