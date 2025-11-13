import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = process.env.VITE_API_URL || 'https://8000-izyhq08iuxgojtp87cymd-8f6e0f7f.manusvm.computer';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://3000-io3of4hh6y4eo51safg8i-5c9cadfe.manusvm.computer';

describe('CORS Configuration', () => {
  let token: string;

  beforeAll(async () => {
    // Get a valid token for testing
    const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      token = data.access_token;
    }
  });

  it('should handle CORS preflight requests correctly', async () => {
    // Test CORS preflight for login endpoint
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(FRONTEND_URL);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('should handle CORS preflight for refresh endpoint', async () => {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(FRONTEND_URL);
  });

  it('should handle CORS preflight for protected endpoints', async () => {
    const response = await fetch(`${API_URL}/api/v1/projects`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(FRONTEND_URL);
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
  });

  it('should include CORS headers in actual requests', async () => {
    if (!token) {
      console.warn('Skipping test: no valid token');
      return;
    }

    const response = await fetch(`${API_URL}/api/v1/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': FRONTEND_URL,
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(FRONTEND_URL);
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('should handle credentials in CORS requests', async () => {
    if (!token) {
      console.warn('Skipping test: no valid token');
      return;
    }

    const response = await fetch(`${API_URL}/api/v1/projects`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': FRONTEND_URL,
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('should reject requests from unauthorized origins', async () => {
    const unauthorizedOrigin = 'https://evil.com';
    
    const response = await fetch(`${API_URL}/api/v1/projects`, {
      method: 'OPTIONS',
      headers: {
        'Origin': unauthorizedOrigin,
        'Access-Control-Request-Method': 'GET',
      },
    });

    // FastAPI CORS middleware returns 400 for unauthorized origins
    expect([400, 403]).toContain(response.status);
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    // Should NOT include the unauthorized origin
    expect(corsHeader).not.toBe(unauthorizedOrigin);
  });

  it('should support all required HTTP methods', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    
    for (const method of methods) {
      const response = await fetch(`${API_URL}/api/v1/projects`, {
        method: 'OPTIONS',
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': method,
        },
      });

      expect(response.status).toBe(200);
      const allowedMethods = response.headers.get('Access-Control-Allow-Methods');
      expect(allowedMethods).toContain(method);
    }
  });

  it('should not return 500 errors on CORS requests', async () => {
    const endpoints = [
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
      '/api/v1/projects',
      '/api/v1/documents',
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'POST',
        },
      });

      expect(response.status).not.toBe(500);
      expect([200, 204]).toContain(response.status);
    }
  });
});
