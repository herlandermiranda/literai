/**
 * Vite Middleware for API Configuration Endpoint
 * 
 * This middleware adds a /api/config/backend-url endpoint that returns
 * the backend URL for frontend discovery.
 */

import { ViteDevServer } from 'vite';

export function configEndpointMiddleware(server: ViteDevServer) {
  return () => {
    server.middlewares.use('/api/config/backend-url', (req, res) => {
      const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ backendUrl }));
    });
  };
}
