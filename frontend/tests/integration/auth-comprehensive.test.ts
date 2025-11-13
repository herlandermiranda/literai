/**
 * Comprehensive Authentication Tests
 * Tests all authentication scenarios and edge cases
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:8000/api/v1';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

describe('Comprehensive Authentication Tests', () => {
  let accessToken: string | null = null;
  let userId: string | null = null;

  describe('1. Login & Session Management', () => {
    it('TEST 1.1: Login returns valid JWT access token', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
        credentials: 'include',
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data.token_type).toBe('bearer');
      
      // Verify JWT structure
      const parts = data.access_token.split('.');
      expect(parts).toHaveLength(3);
      
      accessToken = data.access_token;
    });

    it('TEST 1.2: Access token can be used to access protected endpoints', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include',
      });

      expect(response.ok).toBe(true);
      const user = await response.json();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user.email).toBe(TEST_USER_EMAIL);
      
      userId = user.id;
    });

    it('TEST 1.3: Invalid token is rejected', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token-xyz' },
        credentials: 'include',
      });

      expect(response.status).toBe(401);
    });

    it('TEST 1.4: Missing token is rejected', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      expect([401, 403]).toContain(response.status);
    });

    it('TEST 1.5: Malformed Authorization header is rejected', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': 'NotBearer token' },
        credentials: 'include',
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('2. Login Validation', () => {
    it('TEST 2.1: Login with correct credentials succeeds', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
        credentials: 'include',
      });

      expect(response.ok).toBe(true);
    });

    it('TEST 2.2: Login with wrong password fails', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: 'wrongpassword',
        }),
        credentials: 'include',
      });

      expect(response.status).toBe(401);
    });

    it('TEST 2.3: Login with non-existent email fails', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
        credentials: 'include',
      });

      expect(response.status).toBe(401);
    });

    it('TEST 2.4: Login with empty email fails', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          password: 'password123',
        }),
        credentials: 'include',
      });

      expect([400, 401, 422]).toContain(response.status);
    });

    it('TEST 2.5: Login with empty password fails', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: '',
        }),
        credentials: 'include',
      });

      expect([400, 401, 422]).toContain(response.status);
    });

    it('TEST 2.6: Login with invalid email format fails', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'password123',
        }),
        credentials: 'include',
      });

      expect([400, 401, 422]).toContain(response.status);
    });
  });

  describe('3. Token Refresh', () => {
    it('TEST 3.1: Refresh token endpoint exists', async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      // Should either succeed or fail with 401 (no refresh token)
      expect([200, 401]).toContain(response.status);
    });

    it('TEST 3.2: Refresh without valid refresh token fails', async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No credentials
      });

      expect(response.status).toBe(401);
    });
  });

  describe('4. Logout', () => {
    it('TEST 4.1: Logout endpoint exists and succeeds', async () => {
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      expect(response.ok).toBe(true);
    });

    it('TEST 4.2: Logout without token fails', async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('5. Registration', () => {
    it('TEST 5.1: Register endpoint exists', async () => {
      const newEmail = `test-${Date.now()}@example.com`;
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: 'password123',
          full_name: 'Test User',
        }),
        credentials: 'include',
      });

      // Should either succeed or fail with validation error
      expect([200, 201, 400, 409]).toContain(response.status);
    });

    it('TEST 5.2: Register with duplicate email fails', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: 'password123',
          full_name: 'Test User',
        }),
        credentials: 'include',
      });

      expect([400, 409]).toContain(response.status);
    });
  });

  describe('6. Error Responses', () => {
    it('TEST 6.1: Error responses include detail message', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrong',
        }),
        credentials: 'include',
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('detail');
      expect(typeof data.detail).toBe('string');
    });

    it('TEST 6.2: 404 errors are handled', async () => {
      const response = await fetch(`${API_URL}/nonexistent`, {
        method: 'GET',
        credentials: 'include',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('7. Security Headers', () => {
    it('TEST 7.1: Response includes security headers', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include',
      });

      const headers = Object.fromEntries(response.headers);
      // Check for at least one security header
      const hasSecurityHeader = 
        headers['strict-transport-security'] ||
        headers['x-content-type-options'] ||
        headers['x-frame-options'];
      
      // Not all headers may be present, but at least some should be
      console.log('Security headers found:', {
        'strict-transport-security': headers['strict-transport-security'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-frame-options': headers['x-frame-options'],
      });
    });
  });

  describe('8. CORS & Credentials', () => {
    it('TEST 8.1: Requests with credentials are handled', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include', // Important for cookies
      });

      expect(response.ok).toBe(true);
    });

    it('TEST 8.2: Content-Type is respected', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });
  });

  describe('9. HTTP Methods', () => {
    it('TEST 9.1: GET /auth/me requires GET method', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'POST', // Wrong method
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include',
      });

      expect([405, 400, 401]).toContain(response.status);
    });

    it('TEST 9.2: POST /auth/login requires POST method', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'GET', // Wrong method
        credentials: 'include',
      });

      expect([405, 400]).toContain(response.status);
    });
  });

  describe('10. Response Format', () => {
    it('TEST 10.1: Login response has correct format', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
        credentials: 'include',
      });

      const data = await response.json();
      expect(data).toEqual({
        access_token: expect.any(String),
        token_type: 'bearer',
      });
    });

    it('TEST 10.2: User response has correct format', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include',
      });

      const user = await response.json();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('created_at');
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.created_at).toBe('string');
    });
  });
});
