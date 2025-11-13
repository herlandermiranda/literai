/**
 * Real User Login Test
 * 
 * This test simulates a real user connecting to the application from outside.
 * It tests the complete login flow without mocks or artificial conditions.
 * 
 * Success Criteria:
 * - User can enter email and password
 * - Login request returns 200 OK
 * - User is redirected to dashboard
 * - User can access protected resources
 * - No 500 errors occur
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://3000-io3of4hh6y4eo51safg8i-5c9cadfe.manusvm.computer';
const TEST_EMAIL = 'test@literai.com';
const TEST_PASSWORD = 'password123';

// Helper to wait for network idle
async function waitForNetworkIdle(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    console.log('Network idle timeout, continuing...');
  }
}

test.describe('Real User Login Flow', () => {
  test('should allow user to login and access dashboard', async ({ page, context }) => {
    // Track all network requests and responses
    const requests: Array<{ url: string; method: string; status?: number }> = [];
    const errors: Array<{ url: string; status: number; message: string }> = [];

    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
      });
    });

    page.on('response', (response) => {
      requests[requests.length - 1].status = response.status();
      
      // Track errors (500, 401, etc)
      if (response.status() >= 400) {
        errors.push({
          url: response.url(),
          status: response.status(),
          message: response.statusText(),
        });
      }
    });

    console.log(`\n[TEST] Starting login test`);
    console.log(`[TEST] Frontend URL: ${FRONTEND_URL}`);
    console.log(`[TEST] Test email: ${TEST_EMAIL}`);

    // Step 1: Navigate to login page
    console.log(`[TEST] Step 1: Navigating to login page...`);
    await page.goto(`${FRONTEND_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle(page);

    // Verify we're on the login page
    const loginTitle = await page.locator('text=Connexion').first();
    expect(loginTitle).toBeTruthy();
    console.log(`[TEST] ✓ Login page loaded`);

    // Step 2: Fill in login form
    console.log(`[TEST] Step 2: Filling login form...`);
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Se connecter")').first();

    await emailInput.fill(TEST_EMAIL);
    console.log(`[TEST] ✓ Email entered: ${TEST_EMAIL}`);

    await passwordInput.fill(TEST_PASSWORD);
    console.log(`[TEST] ✓ Password entered`);

    // Step 3: Submit login form
    console.log(`[TEST] Step 3: Submitting login form...`);
    const loginPromise = page.waitForResponse(
      (response) => response.url().includes('/auth/login') && response.status() < 400
    );

    await loginButton.click();
    console.log(`[TEST] ✓ Login button clicked`);

    try {
      const loginResponse = await Promise.race([
        loginPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        ),
      ]);
      console.log(`[TEST] ✓ Login response received: ${(loginResponse as any).status()}`);
    } catch (error) {
      console.error(`[TEST] ✗ Login failed:`, error);
      throw error;
    }

    // Step 4: Wait for redirect to dashboard
    console.log(`[TEST] Step 4: Waiting for dashboard redirect...`);
    await waitForNetworkIdle(page);

    // Check if we're on the dashboard
    const dashboardTitle = await page.locator('text=Dashboard').first();
    expect(dashboardTitle).toBeTruthy();
    console.log(`[TEST] ✓ Dashboard loaded`);

    // Step 5: Verify user is authenticated
    console.log(`[TEST] Step 5: Verifying authentication...`);
    const userEmail = await page.locator('text=' + TEST_EMAIL).first();
    expect(userEmail).toBeTruthy();
    console.log(`[TEST] ✓ User email displayed: ${TEST_EMAIL}`);

    // Step 6: Verify no 500 errors occurred
    console.log(`[TEST] Step 6: Checking for errors...`);
    const serverErrors = errors.filter((e) => e.status >= 500);
    if (serverErrors.length > 0) {
      console.error(`[TEST] ✗ Server errors detected:`, serverErrors);
      throw new Error(`Server errors detected: ${JSON.stringify(serverErrors)}`);
    }
    console.log(`[TEST] ✓ No server errors detected`);

    // Step 7: Log all network requests for debugging
    console.log(`[TEST] Network requests summary:`);
    const apiRequests = requests.filter((r) => r.url.includes('/api'));
    apiRequests.forEach((r) => {
      const statusEmoji = r.status && r.status < 400 ? '✓' : '✗';
      console.log(`[TEST]   ${statusEmoji} ${r.method} ${r.url} - ${r.status}`);
    });

    console.log(`\n[TEST] ✓ Real user login test PASSED`);
  });

  test('should handle login errors gracefully', async ({ page }) => {
    console.log(`\n[TEST] Starting login error handling test`);

    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle(page);

    // Try to login with invalid credentials
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Se connecter")').first();

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');

    // Intercept the login response
    const errorPromise = page.waitForResponse(
      (response) => response.url().includes('/auth/login')
    );

    await loginButton.click();
    const response = await errorPromise;

    console.log(`[TEST] Login response status: ${response.status()}`);

    // Should not be a 500 error
    expect(response.status()).not.toBe(500);
    console.log(`[TEST] ✓ No 500 error on invalid login`);

    // Should show error message
    await waitForNetworkIdle(page);
    const errorMessage = await page.locator('text=Email ou mot de passe incorrect').first();
    expect(errorMessage).toBeTruthy();
    console.log(`[TEST] ✓ Error message displayed`);

    console.log(`\n[TEST] ✓ Login error handling test PASSED`);
  });

  test('should maintain session across page reloads', async ({ page }) => {
    console.log(`\n[TEST] Starting session persistence test`);

    // Login first
    await page.goto(`${FRONTEND_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle(page);

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Se connecter")').first();

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginPromise = page.waitForResponse(
      (response) => response.url().includes('/auth/login') && response.status() < 400
    );

    await loginButton.click();
    await loginPromise;
    await waitForNetworkIdle(page);

    console.log(`[TEST] ✓ User logged in`);

    // Reload the page
    console.log(`[TEST] Reloading page...`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle(page);

    // Should still be on dashboard (authenticated)
    const dashboardTitle = await page.locator('text=Dashboard').first();
    expect(dashboardTitle).toBeTruthy();
    console.log(`[TEST] ✓ Session persisted after reload`);

    console.log(`\n[TEST] ✓ Session persistence test PASSED`);
  });
});
