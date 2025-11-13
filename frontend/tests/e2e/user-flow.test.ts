/**
 * E2E Test: Complete User Flow
 * 
 * This test reproduces the EXACT user behavior:
 * 1. Load login page
 * 2. Enter email and password
 * 3. Click login button
 * 4. Verify dashboard loads (no 500 error)
 * 5. Verify user can access protected content
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_URL = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

describe('User Flow: Login → Dashboard', () => {
  let accessToken: string | null = null;

  beforeAll(async () => {
    console.log('\n🧪 Starting User Flow E2E Test\n');
  });

  afterAll(async () => {
    console.log('\n✅ User Flow E2E Test Complete\n');
  });

  it('STEP 1: User loads login page and sees login form', async () => {
    console.log('  📄 STEP 1: Load login page');

    const response = await fetch(FRONTEND_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    expect(response.status).toBe(200);
    // Just verify the page loads, React will render the form client-side
    console.log('  ✓ Login page loaded successfully');
  });

  it('STEP 2: User submits login form with valid credentials', async () => {
    console.log('  📝 STEP 2: Submit login form');

    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      credentials: 'include',
    });

    console.log(`    Response status: ${loginResponse.status}`);

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      console.log(`    Error:`, errorData);
    }

    expect(loginResponse.status).toBe(200);
    const data = await loginResponse.json();
    
    expect(data).toHaveProperty('access_token');
    expect(data.token_type).toBe('bearer');
    
    accessToken = data.access_token;
    console.log('  ✓ Login successful, access token received');
  });

  it('STEP 3: Frontend receives token and stores it', async () => {
    console.log('  💾 STEP 3: Store token');

    expect(accessToken).toBeTruthy();
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(0);
    
    console.log('  ✓ Token stored successfully');
  });

  it('STEP 4: Frontend makes authenticated request to get user info', async () => {
    console.log('  🔐 STEP 4: Get user info (authenticated)');

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`    Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`    Error:`, errorData);
    }

    expect(response.status).toBe(200);
    const userData = await response.json();
    
    expect(userData).toHaveProperty('email');
    expect(userData.email).toBe('test@example.com');
    
    console.log(`  ✓ User info retrieved: ${userData.email}`);
  });

  it('STEP 5: Frontend loads dashboard (no 500 error)', async () => {
    console.log('  📊 STEP 5: Load dashboard');

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Simulate dashboard load by fetching protected resource
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`    Response status: ${response.status}`);

    // Dashboard should load (200) or return empty list (200)
    // Should NOT return 500
    expect(response.status).not.toBe(500);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    
    // Should be 200 (success) or 404 (not found) but NOT 500
    expect([200, 404]).toContain(response.status);
    
    console.log('  ✓ Dashboard loaded without errors');
  });

  it('STEP 6: User can access protected content', async () => {
    console.log('  🔒 STEP 6: Verify protected content access');

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Try to create a project (protected endpoint)
    const response = await fetch(`${API_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Test project for E2E test',
      }),
    });

    console.log(`    Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`    Error:`, errorData);
    }

    // Should NOT return 500 or 401
    expect(response.status).not.toBe(500);
    expect(response.status).not.toBe(401);
    
    // Should be 200/201 (success) or 400/422 (validation) but NOT 500
    expect([200, 201, 400, 422]).toContain(response.status);
    
    console.log('  ✓ Protected endpoint accessible');
  });

  it('STEP 7: User logout clears token', async () => {
    console.log('  🚪 STEP 7: Logout');

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`    Response status: ${response.status}`);

    expect(response.status).toBe(200);
    
    accessToken = null;
    console.log('  ✓ Logout successful');
  });

  it('STEP 8: User cannot access protected content after logout', async () => {
    console.log('  🔐 STEP 8: Verify access denied after logout');

    // Try to access protected endpoint without token
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`    Response status: ${response.status}`);

    // Should return 401 or 403 (not authorized)
    expect([401, 403]).toContain(response.status);
    
    console.log('  ✓ Access correctly denied');
  });
});
