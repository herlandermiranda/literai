# LiterAI - Architecture d'Authentification Production-Grade

**Version:** 2.0.0  
**Date:** Nov 12, 2025  
**Statut:** En Implémentation

## 1. Vue d'Ensemble

Ce document décrit l'architecture d'authentification JWT refactorisée pour **LiterAI**, basée sur les meilleures pratiques 2025 et garantissant une fiabilité à 100%.

### Problèmes Résolus

| Problème | Impact | Solution |
|----------|--------|----------|
| localStorage utilisé | Vulnérable XSS | HTTP-only cookies |
| Pas de refresh tokens | Tokens longs (15 min) | Access + Refresh tokens |
| Pas de retry logic | Erreur 401 = logout | Refresh automatique + retry |
| Gestion d'erreur confuse | Messages d'erreur flous | Erreurs structurées et claires |
| Pas de rate limiting | Attaques par force brute | Rate limiting sur login |
| Pas de monitoring | Impossible détecter attaques | Logging structuré JSON |

## 2. Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AuthContext + useAuth Hook                           │   │
│  │ - Gestion d'état d'authentification                  │   │
│  │ - Refresh automatique des tokens                     │   │
│  │ - Retry logic sur 401                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Authentication Endpoints                             │   │
│  │ - POST /auth/login    → access_token + refresh_token│   │
│  │ - POST /auth/refresh  → nouveau access_token        │   │
│  │ - POST /auth/logout   → invalider tokens            │   │
│  │ - GET  /auth/me       → infos utilisateur           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Security Middleware                                  │   │
│  │ - CORS strict                                        │   │
│  │ - Security headers (HSTS, CSP, etc.)                │   │
│  │ - Rate limiting                                      │   │
│  │ - Logging structuré                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database                                             │   │
│  │ - Users table                                        │   │
│  │ - RefreshTokens table (invalidation)                │   │
│  │ - AuditLogs table (monitoring)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Flux d'Authentification Détaillé

### 3.1 Login Flow

```
1. Utilisateur soumet email + password
   ↓
2. Backend valide credentials
   ↓
3. Backend génère:
   - access_token (JWT, 15 min, signé)
   - refresh_token (JWT, 7 jours, signé)
   ↓
4. Backend envoie:
   - access_token en réponse JSON (pour vérification)
   - refresh_token en HTTP-only cookie (sécurisé)
   - Autres cookies: secure, samesite=strict
   ↓
5. Frontend stocke access_token en mémoire (RAM)
   ↓
6. Frontend utilise access_token pour requêtes API
```

### 3.2 Refresh Token Flow

```
1. Access token approche expiration (< 2 min)
   ↓
2. Frontend appelle POST /auth/refresh
   ↓
3. Backend valide refresh_token depuis cookie
   ↓
4. Backend génère nouveau access_token
   ↓
5. Backend envoie nouveau access_token
   ↓
6. Frontend met à jour access_token en mémoire
```

### 3.3 Protected Request Flow

```
1. Frontend effectue requête API
   ↓
2. Frontend ajoute header: Authorization: Bearer {access_token}
   ↓
3. Backend valide access_token
   ↓
4. Si valide: traite la requête
   ↓
5. Si expiré (401): Frontend appelle refresh
   ↓
6. Si refresh réussit: retry automatique de la requête
   ↓
7. Si refresh échoue: logout et redirection login
```

## 4. Implémentation Backend

### 4.1 Modèles de Données

```python
# User model
class User(Base):
    id: UUID
    email: str (unique)
    password_hash: str
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

# RefreshToken model (pour invalidation)
class RefreshToken(Base):
    id: UUID
    user_id: UUID (FK)
    token_jti: str (unique)  # JWT ID claim
    expires_at: datetime
    revoked_at: datetime (nullable)
    created_at: datetime

# AuditLog model (pour monitoring)
class AuditLog(Base):
    id: UUID
    user_id: UUID (FK, nullable)
    action: str (login, logout, refresh, failed_login)
    status: str (success, failure)
    ip_address: str
    user_agent: str
    created_at: datetime
```

### 4.2 Endpoints d'Authentification

```python
@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
    rate_limiter: RateLimiter = Depends(get_rate_limiter)
):
    """
    Login endpoint with rate limiting and audit logging.
    
    Returns:
        - access_token (JSON, 15 min)
        - refresh_token (HTTP-only cookie, 7 jours)
    """
    # Rate limiting
    await rate_limiter.check_limit(ip_address)
    
    # Authenticate user
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        log_audit(db, None, "failed_login", "failure", request)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate tokens
    access_token = create_access_token(user_id=user.id, expires_delta=timedelta(minutes=15))
    refresh_token = create_refresh_token(user_id=user.id, expires_delta=timedelta(days=7))
    
    # Store refresh token in DB for revocation
    store_refresh_token(db, user.id, refresh_token)
    
    # Log successful login
    log_audit(db, user.id, "login", "success", request)
    
    # Return response with HTTP-only cookie
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7*24*60*60
    )
    return response

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token from cookie.
    """
    # Extract refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    # Validate refresh token
    payload = decode_token(refresh_token)
    user_id = payload.get("sub")
    
    # Check if token is revoked
    token_record = get_refresh_token(db, user_id, payload.get("jti"))
    if not token_record or token_record.revoked_at:
        raise HTTPException(status_code=401, detail="Token revoked")
    
    # Generate new access token
    new_access_token = create_access_token(user_id=user_id, expires_delta=timedelta(minutes=15))
    
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Logout by revoking refresh token.
    """
    # Revoke refresh token
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        payload = decode_token(refresh_token)
        revoke_refresh_token(db, current_user.id, payload.get("jti"))
    
    # Log logout
    log_audit(db, current_user.id, "logout", "success", request)
    
    # Clear cookie
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("refresh_token")
    return response

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information."""
    return current_user
```

### 4.3 Security Middleware

```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # HSTS: Force HTTPS
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # CSP: Only allow resources from same origin
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'"
        
        return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://literai.example.com"],  # Strict whitelist
    allow_credentials=True,  # Allow cookies
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=3600
)
```

## 5. Implémentation Frontend

### 5.1 AuthContext Refactorisé

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to refresh token (refresh_token is in HTTP-only cookie)
        const response = await apiClient.post('/auth/refresh');
        setAccessToken(response.access_token);
        
        // Fetch current user
        const currentUser = await apiClient.get('/auth/me');
        setUser(currentUser);
        
        // Schedule next refresh
        scheduleTokenRefresh();
      } catch (error) {
        // No valid session
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Schedule token refresh before expiration
  const scheduleTokenRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Refresh 2 minutes before expiration (15 min token - 2 min = 13 min)
    refreshTimeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, 13 * 60 * 1000);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      setAccessToken(response.access_token);
      scheduleTokenRefresh();
    } catch (error) {
      // Refresh failed, logout
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setAccessToken(response.access_token);
      
      // Fetch user info
      const currentUser = await apiClient.get('/auth/me');
      setUser(currentUser);
      
      scheduleTokenRefresh();
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      accessToken,
      login,
      register,
      logout,
      refreshToken: refreshAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 5.2 API Client avec Retry Logic

```typescript
class APIClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(private baseURL: string) {}

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async request<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    try {
      return await this.makeRequest<T>(method, path, data);
    } catch (error: any) {
      // If 401, try to refresh token
      if (error.status === 401 && !path.includes('/auth/')) {
        try {
          // Prevent multiple refresh requests
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }
          
          const newToken = await this.refreshPromise;
          this.refreshPromise = null;
          
          this.setAccessToken(newToken);
          
          // Retry original request
          return await this.makeRequest<T>(method, path, data);
        } catch (refreshError) {
          // Refresh failed, logout
          window.location.href = '/login';
          throw refreshError;
        }
      }
      throw error;
    }
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Include HTTP-only cookies
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return data.access_token;
  }
}
```

## 6. Suite de Tests

### 6.1 Tests Backend

```python
# tests/auth/test_login.py
def test_login_success(client, db, test_user):
    """Test successful login returns access token."""
    response = client.post('/auth/login', json={
        'email': test_user.email,
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json()
    assert response.cookies.get('refresh_token') is not None

def test_login_invalid_credentials(client):
    """Test login with invalid credentials returns 401."""
    response = client.post('/auth/login', json={
        'email': 'wrong@example.com',
        'password': 'wrong'
    })
    assert response.status_code == 401

def test_login_rate_limiting(client):
    """Test rate limiting on login endpoint."""
    for i in range(6):  # Limit is 5 per minute
        response = client.post('/auth/login', json={
            'email': 'test@example.com',
            'password': 'wrong'
        })
    assert response.status_code == 429  # Too Many Requests

def test_refresh_token_success(client, db, test_user):
    """Test refresh token endpoint."""
    # Login first
    login_response = client.post('/auth/login', json={
        'email': test_user.email,
        'password': 'password123'
    })
    
    # Refresh token
    refresh_response = client.post('/auth/refresh')
    assert refresh_response.status_code == 200
    assert 'access_token' in refresh_response.json()

def test_protected_endpoint_with_valid_token(client, db, test_user):
    """Test accessing protected endpoint with valid token."""
    # Login
    login_response = client.post('/auth/login', json={
        'email': test_user.email,
        'password': 'password123'
    })
    token = login_response.json()['access_token']
    
    # Access protected endpoint
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/auth/me', headers=headers)
    assert response.status_code == 200
    assert response.json()['email'] == test_user.email

def test_protected_endpoint_without_token(client):
    """Test accessing protected endpoint without token."""
    response = client.get('/auth/me')
    assert response.status_code == 401

def test_protected_endpoint_with_expired_token(client, db, test_user):
    """Test accessing protected endpoint with expired token."""
    # Create expired token
    expired_token = create_access_token(
        user_id=test_user.id,
        expires_delta=timedelta(seconds=-1)
    )
    
    headers = {'Authorization': f'Bearer {expired_token}'}
    response = client.get('/auth/me', headers=headers)
    assert response.status_code == 401
```

### 6.2 Tests Frontend

```typescript
// tests/auth/AuthContext.test.tsx
describe('AuthContext', () => {
  it('should login successfully and set access token', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.accessToken).toBeDefined();
  });

  it('should refresh token before expiration', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    const initialToken = result.current.accessToken;

    // Wait for refresh (13 minutes)
    await act(async () => {
      jest.advanceTimersByTime(13 * 60 * 1000);
    });

    expect(result.current.accessToken).not.toBe(initialToken);
  });

  it('should logout and clear tokens', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it('should retry request on 401 with token refresh', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    // First call returns 401, second call returns 200
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new_token' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' })
      });

    const apiClient = new APIClient('http://localhost:8000/api/v1');
    apiClient.setAccessToken('old_token');

    const result = await apiClient.get('/protected');
    expect(result.data).toBe('success');
  });
});
```

## 7. Checklist de Déploiement

- [ ] HTTPS configuré (certificat SSL/TLS)
- [ ] Variables d'environnement sécurisées
- [ ] Rate limiting activé
- [ ] CORS configuré strictement
- [ ] Security headers activés
- [ ] Logging structuré en place
- [ ] Monitoring et alertes configurés
- [ ] Backup de la base de données
- [ ] Tests de charge exécutés
- [ ] Audit de sécurité complété
- [ ] Documentation mise à jour
- [ ] Plan de réponse aux incidents

## 8. Références

- [1] TestDriven.io - Securing FastAPI with JWT Token-based Authentication
- [2] Medium - Choosing Between Local Storage and HttpOnly Cookies for Storing JWT Tokens
- [3] Stackademic - The Ultimate Guide to Building Secure Backends with FastAPI in 2025
- [4] OWASP - Authentication Cheat Sheet
- [5] RFC 7519 - JSON Web Token (JWT)

---

**Prochaine Étape:** Implémentation backend complète
