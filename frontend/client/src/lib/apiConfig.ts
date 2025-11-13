/**
 * API Configuration System - Backend Proxy Strategy
 * 
 * Strategy: Use relative URLs so the backend can serve both frontend and API
 * 
 * Architecture:
 * - Backend (FastAPI) mounts frontend static files on /
 * - Backend routes /api/v1 to the API endpoints
 * - Frontend uses relative URLs (/api/v1/...) for all API calls
 * 
 * This works because:
 * - Dev: Vite proxy routes /api/v1 to localhost:8000
 * - Prod: Backend serves frontend on / and handles /api/v1 directly
 * - No hardcoded URLs, everything is relative
 */

let cachedBackendUrl: string | null = null;

/**
 * Detect backend URL based on current location
 * Returns empty string to use relative URLs
 */
function detectBackendUrl(): string {
  // Always use relative URLs
  const backendUrl = '';
  console.log('[LiterAI] Using relative URLs for API calls (backend proxy strategy)');
  return backendUrl;
}

/**
 * Get the backend URL synchronously (for module initialization)
 */
export function getApiBaseUrlSync(): string {
  return '';
}

/**
 * Get the backend URL asynchronously
 */
export async function getApiBaseUrl(): Promise<string> {
  if (cachedBackendUrl !== null) {
    return cachedBackendUrl;
  }
  
  const url = detectBackendUrl();
  cachedBackendUrl = url;
  return url;
}

/**
 * Initialize API configuration
 */
export async function initializeApiConfig(): Promise<void> {
  const url = await getApiBaseUrl();
  console.log('[LiterAI] API configuration initialized. Backend URL:', url || '(relative URLs)');
}

/**
 * Update the backend URL (useful for testing or dynamic configuration)
 */
export function updateBackendUrl(url: string): void {
  cachedBackendUrl = url;
  console.log('[LiterAI] Backend URL updated:', url || '(relative URLs)');
}
