import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = process.env.VITE_API_URL || 'https://8000-izyhq08iuxgojtp87cymd-8f6e0f7f.manusvm.computer/api/v1';

describe('Project Creation - Authentication Bug', () => {
  let token: string;
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    // Login first to get token
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    token = loginData.access_token;
    expect(token).toBeTruthy();
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
  });

  it('TEST 1: Create project with valid token in Authorization header', async () => {
    console.log('\n🧪 TEST 1: Create project with Authorization header');
    console.log('  Token:', token.substring(0, 20) + '...');

    const projectData = {
      title: 'Test Project 1',
      description: 'Test description',
      language: 'en',
    };

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    console.log('  Response status:', response.status);
    const data = await response.json();
    console.log('  Response:', JSON.stringify(data).substring(0, 100) + '...');

    expect(response.status).toBe(201);
    expect(data.id).toBeTruthy();
    expect(data.title).toBe('Test Project 1');
    console.log('  ✅ Project created successfully');
  });

  it('TEST 2: Create project without token should fail with 401', async () => {
    console.log('\n🧪 TEST 2: Create project without token (should fail)');

    const projectData = {
      title: 'Test Project 2',
      description: 'Test description',
      language: 'en',
    };

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    console.log('  Response status:', response.status);
    const data = await response.json();
    console.log('  Response:', JSON.stringify(data).substring(0, 100) + '...');

    expect(response.status).toBe(401);
    expect(data.detail).toContain('Not authenticated');
    console.log('  ✅ Correctly rejected without token');
  });

  it('TEST 3: Create project with invalid token should fail with 401', async () => {
    console.log('\n🧪 TEST 3: Create project with invalid token');

    const projectData = {
      title: 'Test Project 3',
      description: 'Test description',
      language: 'en',
    };

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_12345',
      },
      body: JSON.stringify(projectData),
    });

    console.log('  Response status:', response.status);
    const data = await response.json();
    console.log('  Response:', JSON.stringify(data).substring(0, 100) + '...');

    expect(response.status).toBe(401);
    console.log('  ✅ Correctly rejected invalid token');
  });

  it('TEST 4: Create project with malformed Authorization header', async () => {
    console.log('\n🧪 TEST 4: Create project with malformed Authorization header');

    const projectData = {
      title: 'Test Project 4',
      description: 'Test description',
      language: 'en',
    };

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`, // Missing "Bearer " prefix
      },
      body: JSON.stringify(projectData),
    });

    console.log('  Response status:', response.status);
    const data = await response.json();
    console.log('  Response:', JSON.stringify(data).substring(0, 100) + '...');

    expect(response.status).toBe(403);
    console.log('  ✅ Correctly rejected malformed header');
  });

  it('TEST 5: Get projects list with valid token', async () => {
    console.log('\n🧪 TEST 5: Get projects list with valid token');

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('  Response status:', response.status);
    const data = await response.json();
    console.log('  Projects count:', Array.isArray(data) ? data.length : 'N/A');

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    console.log('  ✅ Projects list retrieved successfully');
  });

  it('TEST 6: Get projects without token should fail', async () => {
    console.log('\n🧪 TEST 6: Get projects without token (should fail)');

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
    });

    console.log('  Response status:', response.status);

    expect(response.status).toBe(403);
    console.log('  ✅ Correctly rejected without token');
  });
});
