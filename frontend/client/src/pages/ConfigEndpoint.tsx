/**
 * Configuration Endpoint Handler
 * 
 * This is a simple handler that returns the backend URL for frontend discovery.
 * It's served by the frontend dev server and used by the frontend to discover
 * the backend URL at runtime.
 */

export function getBackendConfigHandler() {
  return {
    backendUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  };
}
