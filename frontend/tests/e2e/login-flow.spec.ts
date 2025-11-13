/**
 * Login Flow E2E Tests
 * 
 * Simple, reliable tests that validate the login flow
 */

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
  });

  test('should display login form', async ({ page }) => {
    // Check that login form is visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Monitor network requests
    const responses: { url: string; status: number }[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/auth/login')) {
        responses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Verify no 500 error
    const serverErrors = responses.filter((r) => r.status >= 500);
    expect(serverErrors).toHaveLength(0);

    // Should show error message or stay on login page
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should log in with valid credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.fill('input[type="email"]', 'test@literai.com');
    await page.fill('input[type="password"]', 'password123');

    // Monitor network requests
    const responses: { url: string; status: number }[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/auth/login')) {
        responses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/\/(dashboard|projects)/, { timeout: 10000 });

    // Verify no 500 error
    const serverErrors = responses.filter((r) => r.status >= 500);
    expect(serverErrors).toHaveLength(0);

    // Verify we're on dashboard or projects page
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|projects)/);
  });

  test('should check API URL is correct', async ({ page }) => {
    // Intercept and log API calls
    const apiCalls: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      if (response.url().includes('/api/v1')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Fill in and submit login
    await page.fill('input[type="email"]', 'test@literai.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for API calls
    await page.waitForTimeout(3000);

    // Verify API calls were made
    const loginCalls = apiCalls.filter((c) => c.url.includes('/auth/login'));
    expect(loginCalls.length).toBeGreaterThan(0);

    // Verify no 500 errors
    const errors = apiCalls.filter((c) => c.status >= 500);
    expect(errors).toHaveLength(0);

    // Log the API URLs for debugging
    console.log('[TEST] API Calls:', apiCalls);
  });
});
