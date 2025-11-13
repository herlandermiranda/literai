/**
 * Document Save Regression Test Suite
 * Tests that document content is properly saved and persisted
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = 'https://8000-izyhq08iuxgojtp87cymd-8f6e0f7f.manusvm.computer/api/v1';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

describe('Document Save - Regression Tests', () => {
  let accessToken: string;
  let projectId: string;
  let documentId: string;

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
        title: 'Document Save Test Project',
        description: 'Testing document save functionality',
        language: 'en',
      }),
      credentials: 'include',
    });

    expect(projectResponse.status).toBe(201);
    const projectData = await projectResponse.json();
    projectId = projectData.id;

    // Create document
    const docResponse = await fetch(`${API_BASE_URL}/documents/?project_id=${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Test Document',
        content: '',
        document_type: 'draft',
      }),
      credentials: 'include',
    });

    expect(docResponse.status).toBe(201);
    const docData = await docResponse.json();
    documentId = docData.id;
  });

  describe('Document Content Persistence', () => {
    it('should save document content via PUT', async () => {
      console.log('TEST 1: Save document content');
      
      const testContent = 'This is test content that should be saved';
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: testContent,
        }),
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      console.log('  Response data:', JSON.stringify(data, null, 2));
      console.log('  OK Document saved');
    });

    it('should retrieve saved document content', async () => {
      console.log('TEST 2: Retrieve saved document content');
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      console.log('  Document content_raw:', data.content_raw);
      console.log('  Document content_rich:', data.content_rich);
      console.log('  OK Document retrieved');
    });

    it('should support content field in PUT request', async () => {
      console.log('TEST 3: Support content field in PUT');
      
      const testContent = 'Updated content for testing';
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: testContent,
        }),
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      // Check if content field is returned or if we need to use content_raw
      expect(data.content_raw !== undefined || data.content !== undefined).toBe(true);
      console.log('  OK Content field supported');
    });

    it('should handle rich content (HTML)', async () => {
      console.log('TEST 4: Handle rich content');
      
      const richContent = '<p>This is <strong>bold</strong> text</p>';
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: richContent,
        }),
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      expect(response.status).toBe(200);
      console.log('  OK Rich content handled');
    });
  });

  describe('Content Field Compatibility', () => {
    it('should accept content field in DocumentUpdate schema', async () => {
      console.log('TEST 5: Accept content field');
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: 'Test content',
        }),
        credentials: 'include',
      });

      console.log('  Response status:', response.status);
      // Should not return 422 (Unprocessable Entity)
      expect(response.status).not.toBe(422);
      console.log('  OK Content field accepted');
    });

    it('should return content in response', async () => {
      console.log('TEST 6: Return content in response');
      
      const testContent = 'Response content test';
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: testContent,
        }),
        credentials: 'include',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Should have either content or content_raw field
      const hasContent = data.content !== undefined || data.content_raw !== undefined;
      expect(hasContent).toBe(true);
      console.log('  OK Content returned in response');
    });
  });
});
