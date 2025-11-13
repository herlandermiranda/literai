import { test, expect } from '@playwright/test';

test('should diagnose network issue', async ({ page, baseURL }) => {
  console.log('\n=== DIAGNOSTIC TEST ===');
  console.log(`Frontend URL: ${baseURL}`);
  
  // Collect all network events
  const networkEvents: string[] = [];
  
  page.on('request', request => {
    networkEvents.push(`REQUEST: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    networkEvents.push(`RESPONSE: ${response.status()} ${response.url()}`);
  });
  
  page.on('console', msg => {
    networkEvents.push(`CONSOLE: ${msg.type()} - ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    networkEvents.push(`ERROR: ${error.message}`);
  });
  
  // Try to navigate
  try {
    console.log(`Navigating to ${baseURL}...`);
    await page.goto(baseURL || 'http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('✅ Navigation successful');
  } catch (error) {
    console.error(`❌ Navigation failed: ${error}`);
  }
  
  // Print all network events
  console.log('\n=== Network Events ===');
  networkEvents.forEach(event => console.log(event));
  
  // Try to find login form
  try {
    const loginForm = page.locator('input[type="email"]');
    const isVisible = await loginForm.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`\nLogin form visible: ${isVisible}`);
  } catch (error) {
    console.error(`Error checking login form: ${error}`);
  }
  
  // Try to make an API call
  console.log('\n=== Testing API Call ===');
  console.log(`Base URL: ${baseURL}`);
  const apiResult = await page.evaluate(async (baseUrl) => {
    try {
      console.log('Attempting fetch to /api/v1/health...');
      const response = await fetch('/api/v1/health', {
        method: 'GET',
        redirect: 'follow',
      });
      console.log(`Fetch successful: ${response.status}`);
      return { status: response.status, ok: response.ok };
    } catch (error) {
      console.error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, baseURL);
  
  console.log(`API Result:`, apiResult);
  
  // Verify that the test can access the frontend
  if ('error' in apiResult) {
    console.error(`\n❌ CRITICAL: Cannot access API - ${apiResult.error}`);
    console.error(`This explains the "Failed to Fetch" error!`);
  } else {
    console.log(`\n✅ API is accessible`);
  }
});
