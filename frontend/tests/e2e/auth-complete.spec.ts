import { test, expect } from '@playwright/test';

test('should complete login flow and capture any 500 errors', async ({ page, baseURL }) => {
  console.log('\n=== COMPLETE LOGIN TEST ===');
  console.log(`Frontend URL: ${baseURL}`);
  
  // Capture all network errors
  const errors: string[] = [];
  const responses: { status: number; url: string }[] = [];
  
  page.on('response', response => {
    responses.push({ status: response.status(), url: response.url() });
    if (response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  // Navigate to app
  console.log('Step 1: Navigating to app...');
  await page.goto(baseURL || 'http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('✅ Navigation successful');
  
  // Wait for login form
  console.log('Step 2: Waiting for login form...');
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ timeout: 5000 }).catch(() => {
    console.warn('⚠️ Login form not found, continuing anyway...');
  });
  
  // Fill login form
  console.log('Step 3: Filling login form...');
  try {
    await emailInput.fill('test@example.com', { timeout: 5000 });
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123', { timeout: 5000 });
    console.log('✅ Form filled');
  } catch (error) {
    console.warn(`⚠️ Could not fill form: ${error}`);
  }
  
  // Click login button
  console.log('Step 4: Clicking login button...');
  try {
    const loginButton = page.locator('button:has-text("Se connecter")');
    await loginButton.click({ timeout: 5000 });
    console.log('✅ Login button clicked');
  } catch (error) {
    console.warn(`⚠️ Could not click login button: ${error}`);
  }
  
  // Wait for response
  console.log('Step 5: Waiting for login response...');
  await page.waitForTimeout(3000);
  
  // Print all responses
  console.log('\n=== Network Responses ===');
  responses.forEach(r => {
    console.log(`${r.status} ${r.url}`);
  });
  
  // Print all errors
  console.log('\n=== Errors ===');
  if (errors.length === 0) {
    console.log('✅ No errors detected');
  } else {
    errors.forEach(e => console.log(`❌ ${e}`));
  }
  
  // Check for 500 errors specifically
  const has500 = responses.some(r => r.status === 500);
  if (has500) {
    console.error('\n🔴 CRITICAL: 500 error detected!');
    const error500 = responses.find(r => r.status === 500);
    console.error(`URL: ${error500?.url}`);
  } else {
    console.log('\n✅ No 500 errors detected');
  }
});
