/**
 * Real User Scenario Test
 * 
 * Reproduces EXACTLY what the user described:
 * 1. User enters login credentials (email + password)
 * 2. User clicks login button
 * 3. Frontend should allow access to the application (no 500 error)
 * 
 * This test MUST fail if there's any 500 error or authentication issue.
 */

import { describe, it, expect } from 'vitest';

const API_URL = 'http://localhost:8000/api/v1';

describe('Real User Scenario: Login and Access Application', () => {
  it('User enters email and password, clicks login, and gets access to application', async () => {
    console.log('\n🧪 Real User Scenario Test');
    console.log('  User enters: email=test@example.com, password=password123');

    // STEP 1: User submits login form
    console.log('\n  📝 Submitting login form...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    console.log(`  Response status: ${loginResponse.status}`);

    // CRITICAL: Login must return 200, not 500
    if (loginResponse.status === 500) {
      const errorText = await loginResponse.text();
      console.error('  ❌ CRITICAL ERROR: Backend returned 500');
      console.error('  Error:', errorText);
      throw new Error('Backend returned 500 on login');
    }

    expect(loginResponse.status).toBe(200);
    const loginData = await loginResponse.json();

    // CRITICAL: Must receive access token
    if (!loginData.access_token) {
      console.error('  ❌ CRITICAL ERROR: No access token in response');
      console.error('  Response:', loginData);
      throw new Error('No access token received');
    }

    const accessToken = loginData.access_token;
    console.log(`  ✓ Login successful, received access token`);

    // STEP 2: Frontend stores token and tries to access dashboard
    console.log('\n  📊 Accessing dashboard with token...');
    const dashboardResponse = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`  Response status: ${dashboardResponse.status}`);

    // CRITICAL: Dashboard access must not return 500
    if (dashboardResponse.status === 500) {
      const errorText = await dashboardResponse.text();
      console.error('  ❌ CRITICAL ERROR: Backend returned 500 on dashboard access');
      console.error('  Error:', errorText);
      throw new Error('Backend returned 500 on dashboard access');
    }

    expect(dashboardResponse.status).toBe(200);
    const userData = await dashboardResponse.json();

    // CRITICAL: Must receive user data
    if (!userData.email) {
      console.error('  ❌ CRITICAL ERROR: No user data in response');
      console.error('  Response:', userData);
      throw new Error('No user data received');
    }

    console.log(`  ✓ Dashboard access successful, user: ${userData.email}`);

    // STEP 3: Try to access protected resources (projects)
    console.log('\n  📁 Accessing protected resources (projects)...');
    const projectsResponse = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`  Response status: ${projectsResponse.status}`);

    // CRITICAL: Protected resources must not return 500
    if (projectsResponse.status === 500) {
      const errorText = await projectsResponse.text();
      console.error('  ❌ CRITICAL ERROR: Backend returned 500 on protected resource');
      console.error('  Error:', errorText);
      throw new Error('Backend returned 500 on protected resource');
    }

    // Should be 200 (success) or 404 (not found) but NOT 500
    expect([200, 404]).toContain(projectsResponse.status);
    console.log(`  ✓ Protected resources accessible (status: ${projectsResponse.status})`);

    // FINAL VERDICT
    console.log('\n  ✅ SUCCESS: User can login and access application without 500 errors');
  });

  it('User with invalid credentials gets proper error (not 500)', async () => {
    console.log('\n🧪 Invalid Credentials Test');
    console.log('  User enters: email=wrong@example.com, password=wrongpassword');

    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    });

    console.log(`  Response status: ${loginResponse.status}`);

    // CRITICAL: Invalid credentials must return 401, not 500
    if (loginResponse.status === 500) {
      const errorText = await loginResponse.text();
      console.error('  ❌ CRITICAL ERROR: Backend returned 500 for invalid credentials');
      console.error('  Error:', errorText);
      throw new Error('Backend returned 500 for invalid credentials');
    }

    expect(loginResponse.status).toBe(401);
    const errorData = await loginResponse.json();
    expect(errorData.detail).toContain('Invalid');

    console.log(`  ✓ Properly rejected with 401 (not 500)`);
  });

  it('User without token cannot access protected resources', async () => {
    console.log('\n🧪 No Token Test');
    console.log('  User tries to access protected resource without token');

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`  Response status: ${response.status}`);

    // CRITICAL: No token must return 401/403, not 500
    if (response.status === 500) {
      const errorText = await response.text();
      console.error('  ❌ CRITICAL ERROR: Backend returned 500 for missing token');
      console.error('  Error:', errorText);
      throw new Error('Backend returned 500 for missing token');
    }

    expect([401, 403]).toContain(response.status);
    console.log(`  ✓ Properly rejected with ${response.status} (not 500)`);
  });
});
