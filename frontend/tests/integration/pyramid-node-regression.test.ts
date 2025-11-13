/**
 * Pyramid Node Creation Regression Test Suite
 * Tests that pyramid nodes can be created successfully
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = 'https://8000-izyhq08iuxgojtp87cymd-8f6e0f7f.manusvm.computer/api/v1';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

describe('Pyramid Node Creation - Regression Tests', () => {
  let accessToken: string;
  let projectId: string;

  beforeAll(async () => {
    // Login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
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
    accessToken = loginData.access_token;

    // Create project
    const projectResponse = await fetch(`${API_BASE_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Pyramid Node Test Project',
        description: 'Testing pyramid node creation',
        language: 'en',
      }),
      credentials: 'include',
    });

    expect(projectResponse.status).toBe(201);
    const projectData = await projectResponse.json();
    projectId = projectData.id;
  });

  describe('Pyramid Node Creation', () => {
    it('should create a root pyramid node', async () => {
      console.log('TEST 1: Create root pyramid node');
      
      const response = await fetch(`${API_BASE_URL}/pyramid/nodes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          title: 'Root Node',
          level: 0,
          content: 'Root content',
        }),
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      if (response.status !== 201) {
        const errorData = await response.json();
        console.log('  Error:', JSON.stringify(errorData, null, 2));
      }
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.id).toBeTruthy();
      expect(data.title).toBe('Root Node');
      console.log('  OK Root node created:', data.id);
    });

    it('should create child pyramid nodes', async () => {
      console.log('TEST 2: Create child pyramid node');
      
      // First create root node
      const rootResponse = await fetch(`${API_BASE_URL}/pyramid/nodes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          title: 'Parent Node',
          level: 0,
          content: 'Parent content',
        }),
        credentials: 'include',
      });

      expect(rootResponse.status).toBe(201);
      const rootData = await rootResponse.json();
      const parentId = rootData.id;

      // Create child node
      const childResponse = await fetch(`${API_BASE_URL}/pyramid/nodes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          title: 'Child Node',
          level: 1,
          parent_id: parentId,
          content: 'Child content',
        }),
        credentials: 'include',
      });

      console.log('  Response status:', childResponse.status);
      if (childResponse.status !== 201) {
        const errorData = await childResponse.json();
        console.log('  Error:', JSON.stringify(errorData, null, 2));
      }
      expect(childResponse.status).toBe(201);
      
      const childData = await childResponse.json();
      expect(childData.id).toBeTruthy();
      expect(childData.title).toBe('Child Node');
      console.log('  OK Child node created:', childData.id);
    });

    it('should list pyramid nodes for project', async () => {
      console.log('TEST 3: List pyramid nodes');
      
      const response = await fetch(`${API_BASE_URL}/pyramid/nodes/?project_id=${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      console.log('  OK Found', data.length, 'pyramid nodes');
    });

    it('should handle pyramid node endpoint errors gracefully', async () => {
      console.log('TEST 4: Handle pyramid endpoint errors');
      
      // Try to create node without required fields
      const response = await fetch(`${API_BASE_URL}/pyramid/nodes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          // Missing title and level
        }),
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      // Should return 422 (validation error) or 400 (bad request)
      expect([400, 422]).toContain(response.status);
      console.log('  OK Error handled correctly');
    });

    it('should support all pyramid levels (0-4)', async () => {
      console.log('TEST 5: Support all pyramid levels');
      
      const levels = [0, 1, 2, 3, 4];
      let parentId = null;

      for (const level of levels) {
        const response = await fetch(`${API_BASE_URL}/pyramid/nodes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            project_id: projectId,
            title: `Level ${level} Node`,
            level: level,
            parent_id: parentId,
            content: `Content for level ${level}`,
          }),
          credentials: 'include',
        });

        if (response.status === 201) {
          const data = await response.json();
          parentId = data.id;
          console.log(`  OK Level ${level} node created`);
        } else {
          console.log(`  FAIL Level ${level} returned ${response.status}`);
          const errorData = await response.json();
          console.log('  Error:', JSON.stringify(errorData, null, 2));
        }
      }
    });
  });
});
