import { describe, it, expect, beforeAll } from 'vitest';
import { getApiBaseUrlSync, getApiEndpointSync, testApiConnectivity } from '@/lib/apiConfig';

describe('API Configuration and Connectivity', () => {
  describe('getApiBaseUrl', () => {
    it('should return a valid URL string', () => {
      const url = getApiBaseUrlSync();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('should return either absolute or relative URL', () => {
      const url = getApiBaseUrlSync();
      const isAbsolute = url.startsWith('http');
      const isRelative = url.startsWith('/');
      expect(isAbsolute || isRelative).toBe(true);
    });

    it('should not contain hardcoded localhost in production', () => {
      const url = getApiBaseUrlSync();
      // In production, should use env vars or relative path
      if (import.meta.env.MODE === 'production') {
        expect(url).not.toContain('localhost:8000');
      }
    });
  });

  describe('getApiEndpoint', () => {
    it('should construct valid endpoint URLs', () => {
      const endpoint = getApiEndpointSync('/health');
      expect(endpoint).toContain('/api/v1');
      expect(endpoint).toContain('/health');
    });

    it('should handle paths with leading slashes', () => {
      const endpoint1 = getApiEndpointSync('/users');
      const endpoint2 = getApiEndpointSync('users');
      // Both should be valid
      expect(endpoint1).toContain('/users');
      expect(endpoint2).toContain('users');
    });

    it('should construct proper URLs for different paths', () => {
      const paths = ['/health', '/projects', '/documents', '/entities'];
      paths.forEach(path => {
        const endpoint = getApiEndpointSync(path);
        expect(endpoint).toContain('/api/v1');
        expect(endpoint).toContain(path);
      });
    });
  });

  describe('testApiConnectivity', () => {
    it('should return a boolean', async () => {
      const result = await testApiConnectivity();
      expect(typeof result).toBe('boolean');
    });

    it('should not throw errors', async () => {
      expect(async () => {
        await testApiConnectivity();
      }).not.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      // This test ensures the function doesn't crash on network errors
      const result = await testApiConnectivity();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('API URL consistency', () => {
    it('should use same base URL for all endpoints', () => {
      const baseUrl = getApiBaseUrlSync();
      const endpoint1 = getApiEndpointSync('/health');
      const endpoint2 = getApiEndpointSync('/projects');
      
      // Both should start with the same base
      expect(endpoint1.startsWith(baseUrl) || endpoint1.includes(baseUrl)).toBe(true);
      expect(endpoint2.startsWith(baseUrl) || endpoint2.includes(baseUrl)).toBe(true);
    });

    it('should not have duplicate /api/v1 prefixes', () => {
      const endpoint = getApiEndpointSync('/health');
      const apiCount = (endpoint.match(/\/api\/v1/g) || []).length;
      expect(apiCount).toBe(1);
    });
  });
});
