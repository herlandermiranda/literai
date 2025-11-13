import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Authentication Flow', () => {
  const API_BASE = 'http://localhost:8000/api/v1';
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    expect(loginRes.ok).toBe(true);
    const loginData = await loginRes.json();
    token = loginData.access_token;
    expect(token).toBeTruthy();
  });

  it('should login successfully', () => {
    expect(token).toBeTruthy();
  });

  it('should get current user', async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(res.ok).toBe(true);
    const user = await res.json();
    userId = user.id;
    expect(userId).toBeTruthy();
  });

  it('should create a project', async () => {
    const res = await fetch(`${API_BASE}/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Project',
        language: 'fr'
      })
    });
    expect(res.ok).toBe(true);
    const project = await res.json();
    expect(project.id).toBeTruthy();
  });

  it('should create a document', async () => {
    // First create a project
    const projectRes = await fetch(`${API_BASE}/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Project',
        language: 'fr'
      })
    });
    const project = await projectRes.json();
    
    // Then create a document
    const docRes = await fetch(`${API_BASE}/documents/?project_id=${project.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Document',
        content: 'Hello World'
      })
    });
    expect(docRes.ok).toBe(true);
    const doc = await docRes.json();
    expect(doc.id).toBeTruthy();
  });
});
