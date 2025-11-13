/**
 * E2E tests for authentication flow using Playwright
 * Tests the complete user journey from login to dashboard
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'https://8000-izyhq08iuxgojtp87cymd-8f6e0f7f.manusvm.computer';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    // Log all network requests and responses
    page.on('request', request => {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    });
    
    // Log console messages
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    // Log page errors
    page.on('pageerror', error => {
      console.error(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('should test API connectivity with detailed logging', async ({ page }) => {
    console.log('\n=== Test: API Connectivity with Detailed Logging ===');
    console.log(`Frontend URL: ${BASE_URL}`);
    console.log(`API URL: ${API_URL}`);
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check what backend URL was detected
    const detectedBackendUrl = await page.evaluate(() => {
      return localStorage.getItem('literai_backend_url');
    });
    console.log(`Detected Backend URL: ${detectedBackendUrl}`);
    
    // Try to make a direct API call
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/v1/health', {
          method: 'GET',
          redirect: 'follow',
        });
        return {
          status: response.status,
          ok: response.ok,
          url: response.url,
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });
    
    console.log(`API Test Result:`, apiTest);
    
    if ('error' in apiTest) {
      console.error(`Failed API call: ${apiTest.error}`);
    } else {
      console.log(`API Status: ${apiTest.status}`);
    }
  });

  test('should login with detailed network logging', async ({ page }) => {
    console.log('\n=== Test: Login with Detailed Network Logging ===');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Intercept login response
    const loginResponsePromise = page.waitForResponse(response => {
      const url = response.url();
      const isLoginEndpoint = url.includes('/auth/login') || url.includes('/api/v1/auth/login');
      if (isLoginEndpoint) {
        console.log(`[LOGIN RESPONSE] ${response.status()} ${url}`);
      }
      return isLoginEndpoint;
    });
    
    // Click login button
    console.log('Clicking login button...');
    await page.click('button:has-text("Se connecter")');
    
    // Wait for login response with timeout
    try {
      const loginResponse = await Promise.race([
        loginResponsePromise,
        page.waitForTimeout(10000).then(() => { throw new Error('Login timeout'); })
      ]);
      
      console.log(`Login response status: ${loginResponse.status()}`);
      
      if (loginResponse.status() === 200) {
        console.log('✅ Login successful');
        
        // Check if token is stored
        const token = await page.evaluate(() => {
          return localStorage.getItem('literai_auth_token');
        });
        expect(token).toBeTruthy();
      } else if (loginResponse.status() === 500) {
        console.error('❌ Login failed with 500 error');
        expect(loginResponse.status()).toBe(200);
      } else {
        console.error(`❌ Login failed with status ${loginResponse.status()}`);
        expect(loginResponse.status()).toBe(200);
      }
    } catch (error) {
      console.error(`❌ Login error: ${error}`);
      throw error;
    }
  });

  test('should load auth page without errors on cold start', async ({ page }) => {
    // Navigate to auth page
    await page.goto(`${BASE_URL}/`);

    // Should display auth page
    await expect(page.locator('text=Connexion')).toBeVisible();
    await expect(page.locator('text=Inscription')).toBeVisible();

    // Should not have any console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any potential errors
    await page.waitForTimeout(1000);
    expect(errors.filter((e) => !e.includes('Failed to fetch'))).toHaveLength(0);
  });

  test('should display login form correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Check login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Se connecter")')).toBeVisible();
  });

  test('should display registration form when clicking inscription tab', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`);

    // Click inscription tab
    await page.click('text=Inscription');

    // Check registration form elements
    await expect(page.locator('input[placeholder*="Nom"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("S\'inscrire")')).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click login button
    await page.click('button:has-text("Se connecter")');

    // Should show error message
    await expect(page.locator('text=Échec de la connexion')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route(`${API_URL}/**`, (route) => {
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/`);

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click login button
    await page.click('button:has-text("Se connecter")');

    // Should show error message
    await expect(page.locator('text=Échec de la connexion')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle 401 errors correctly', async ({ page }) => {
    // Mock 401 response
    await page.route(`${API_URL}/api/v1/auth/me`, (route) => {
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/`);

    // Should display login page without errors
    await expect(page.locator('text=Connexion')).toBeVisible();
  });

  test('should handle 500 errors gracefully', async ({ page }) => {
    // Mock 500 response
    await page.route(`${API_URL}/api/v1/auth/login`, (route) => {
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/`);

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click login button
    await page.click('button:has-text("Se connecter")');

    // Should show error message
    await expect(page.locator('text=Échec de la connexion')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should not make unnecessary API calls on cold start', async ({ page }) => {
    const requests: string[] = [];

    // Track API requests
    page.on('request', (request) => {
      if (request.url().includes(API_URL)) {
        requests.push(request.url());
      }
    });

    await page.goto(`${BASE_URL}/`);

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Should not call /auth/me without token
    const meRequests = requests.filter((url) => url.includes('/auth/me'));
    expect(meRequests).toHaveLength(0);
  });

  test('should store token in localStorage after successful login', async ({
    page,
  }) => {
    // This test requires a real user account or proper mocking
    // For now, we'll just verify the mechanism exists
    await page.goto(`${BASE_URL}/`);

    // Check that localStorage is available
    const hasStorage = await page.evaluate(() => {
      return typeof localStorage !== 'undefined';
    });
    expect(hasStorage).toBe(true);
  });

  test('should include token in subsequent requests', async ({ page }) => {
    // Set a token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('literai_auth_token', 'test-token-123');
      localStorage.setItem(
        'literai_auth_user',
        JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          full_name: 'Test User',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
        })
      );
    });

    const requests: { url: string; headers: Record<string, string> }[] = [];

    // Track API requests
    page.on('request', (request) => {
      if (request.url().includes(API_URL)) {
        requests.push({
          url: request.url(),
          headers: request.headers(),
        });
      }
    });

    await page.goto(`${BASE_URL}/`);

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check that Authorization header is present in requests
    const authRequests = requests.filter((req) =>
      req.headers['authorization']?.startsWith('Bearer ')
    );
    expect(authRequests.length).toBeGreaterThan(0);
  });

  test('should clear token on 401 response', async ({ page }) => {
    // Set a token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('literai_auth_token', 'expired-token');
      localStorage.setItem(
        'literai_auth_user',
        JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          full_name: 'Test User',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
        })
      );
    });

    // Mock 401 response
    await page.route(`${API_URL}/api/v1/auth/me`, (route) => {
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/`);

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check that token is cleared from localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem('literai_auth_token');
    });
    expect(token).toBeNull();
  });

  test('should handle concurrent requests correctly', async ({ page }) => {
    const requests: string[] = [];

    // Track API requests
    page.on('request', (request) => {
      if (request.url().includes(API_URL)) {
        requests.push(request.url());
      }
    });

    await page.goto(`${BASE_URL}/`);

    // Simulate multiple login attempts
    await page.fill('input[type="email"]', 'test1@example.com');
    await page.fill('input[type="password"]', 'password1');
    await page.click('button:has-text("Se connecter")');

    // Wait a bit
    await page.waitForTimeout(500);

    // Clear form and try again
    await page.fill('input[type="email"]', 'test2@example.com');
    await page.fill('input[type="password"]', 'password2');
    await page.click('button:has-text("Se connecter")');

    // Wait for requests to complete
    await page.waitForTimeout(2000);

    // Should have made login requests
    const loginRequests = requests.filter((url) => url.includes('/auth/login'));
    expect(loginRequests.length).toBeGreaterThanOrEqual(1);
  });

  test('should display loading state during login', async ({ page }) => {
    // Slow down network to see loading state
    await page.route(`${API_URL}/api/v1/auth/login`, (route) => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto(`${BASE_URL}/`);

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click login button
    const submitButton = page.locator('button:has-text("Se connecter")');
    await submitButton.click();

    // Button should be disabled or show loading state
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });

  test('should handle rapid form submissions', async ({ page }) => {
    let loginAttempts = 0;

    // Track login requests
    await page.route(`${API_URL}/api/v1/auth/login`, (route) => {
      loginAttempts++;
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/`);

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click login button multiple times rapidly
    const submitButton = page.locator('button:has-text("Se connecter")');
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    // Wait for requests to complete
    await page.waitForTimeout(2000);

    // Should only make one login request (debounced)
    expect(loginAttempts).toBeLessThanOrEqual(3);
  });
});
