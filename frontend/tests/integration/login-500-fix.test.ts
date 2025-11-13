/**
 * Test to verify that login endpoint never returns 500 errors
 * This test ensures the fix for the recurring 500 error on login is working
 */

import { describe, it, expect } from 'vitest';

const API_URL = 'https://8000-izyhq08iuxgojtp87cymd-8f6e0f7f.manusvm.computer/api/v1';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

describe('Login 500 Error Fix', () => {
  it('should login successfully without 500 error', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
      credentials: 'include',
    });

    console.log(`Login response status: ${response.status}`);
    
    // Should not return 500
    expect(response.status).not.toBe(500);
    
    // Should return 200 (success) or 401 (invalid credentials)
    expect([200, 401]).toContain(response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data).toHaveProperty('token_type');
      console.log('✅ Login successful');
    }
  });

  it('should handle refresh endpoint without 500 error', async () => {
    // First login to get a token
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
      credentials: 'include',
    });

    expect(loginResponse.status).toBe(200);
    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // Now try to refresh
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    console.log(`Refresh response status: ${refreshResponse.status}`);
    
    // Should not return 500
    expect(refreshResponse.status).not.toBe(500);
    
    // Refresh should return 200 or 401 (in test environment)
    expect([200, 401]).toContain(refreshResponse.status);
    console.log('✅ Refresh endpoint working');
  });

  it('should handle all endpoints without trailing slash issues', async () => {
    // Login first
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
      credentials: 'include',
    });

    expect(loginResponse.status).toBe(200);
    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Test various endpoints to ensure no 500 errors
    const endpoints = [
      { method: 'GET', path: '/projects', shouldSucceed: true },
      { method: 'POST', path: '/projects', data: { title: 'Test', description: 'Test', language: 'en' }, shouldSucceed: true },
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${API_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers,
        body: endpoint.data ? JSON.stringify(endpoint.data) : undefined,
        credentials: 'include',
      });

      console.log(`${endpoint.method} ${endpoint.path}: ${response.status}`);
      
      // Should not return 500
      expect(response.status).not.toBe(500);
      
      if (endpoint.shouldSucceed) {
        expect([200, 201]).toContain(response.status);
      }
    }

    console.log('✅ All endpoints working without 500 errors');
  });
});
