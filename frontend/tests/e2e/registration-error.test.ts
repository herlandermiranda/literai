/**
 * Registration Error Test
 * 
 * Reproduces the 500 error on registration endpoint
 * This test MUST fail with 500 error in current state
 */

import { describe, it, expect } from 'vitest';

const API_URL = 'http://localhost:8000/api/v1';

describe('Registration Endpoint - Error 500 Reproduction', () => {
  it('User tries to register with valid data and gets 500 error', async () => {
    console.log('\n🧪 Registration Test - Reproducing Error 500');
    console.log('  User enters: email=newuser@example.com, password=password123, fullName=Test User');

    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'Test User',
      }),
    });

    console.log(`  Response status: ${registerResponse.status}`);

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}));
      console.log(`  Error response:`, errorData);
    }

    // THIS TEST MUST FAIL WITH 500 ERROR
    // We expect 201 (created) or 200 (success)
    // If we get 500, we found the bug!
    expect(registerResponse.status).not.toBe(500);
    expect([200, 201, 400, 422]).toContain(registerResponse.status);
  });

  it('User tries to register with different field names', async () => {
    console.log('\n🧪 Registration Test - Different Field Names');

    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'another@example.com',
        password: 'password123',
        name: 'Another User',
      }),
    });

    console.log(`  Response status: ${registerResponse.status}`);

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}));
      console.log(`  Error response:`, errorData);
    }

    expect(registerResponse.status).not.toBe(500);
  });
});
