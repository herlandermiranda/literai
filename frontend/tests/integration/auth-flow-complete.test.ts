/**
 * Complete Authentication Flow Integration Tests
 * Tests the entire auth flow from login to protected content access
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:8000/api/v1'; // Always use local backend for tests
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

describe('Complete Authentication Flow', () => {
  let accessToken: string | null = null;

  beforeAll(() => {
    console.log('\n🧪 Starting Authentication Flow Tests');
    console.log(`API URL: ${API_URL}`);
  });

  describe('1. Login Flow', () => {
    it('TEST 1.1: Should login with valid credentials', async () => {
      console.log('\n  🧪 TEST 1.1: Login with valid credentials');

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
        credentials: 'include',
      });

      console.log(`  Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`  Error:`, errorData);
      }

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      accessToken = data.access_token;
      console.log(`  ✓ Login successful`);
    });
  });

  describe('2. Protected Endpoints', () => {
    it('TEST 2.1: Should get current user with valid token', async () => {
      console.log('\n  🧪 TEST 2.1: Get current user');

      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      console.log(`  Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`  Error:`, errorData);
      }

      expect(response.ok).toBe(true);
      const user = await response.json();
      expect(user).toHaveProperty('email');
      console.log(`  ✓ User retrieved: ${user.email}`);
    });

    it('TEST 2.2: Should fail without token', async () => {
      console.log('\n  🧪 TEST 2.2: Get user without token');

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      console.log(`  Response status: ${response.status}`);
      expect([401, 403]).toContain(response.status);
      console.log(`  ✓ Correctly rejected`);
    });
  });

  describe('3. Error Handling', () => {
    it('TEST 3.1: Should handle invalid credentials', async () => {
      console.log('\n  🧪 TEST 3.1: Invalid credentials');

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrong',
        }),
        credentials: 'include',
      });

      console.log(`  Response status: ${response.status}`);
      expect(response.status).toBe(401);
      console.log(`  ✓ Correctly rejected`);
    });
  });
});
