/**
 * Unit Tests for API Configuration
 * 
 * Tests the URL detection logic for different environments
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('API Configuration', () => {
  let originalLocation: Location;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore original location
    delete (window as any).location;
    (window as any).location = originalLocation;
  });

  describe('Manus Dev URLs', () => {
    it('should detect backend URL for Manus dev frontend', () => {
      // Mock location for Manus dev URL
      delete (window as any).location;
      (window as any).location = {
        href: 'https://3000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer/auth',
        hostname: '3000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer',
        protocol: 'https:',
      };

      // Import after mocking location
      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url = getApiBaseUrlSync();

      expect(url).toBe('https://8000-izyhq08iuxgojtp87cymd-88b84266.manusvm.computer');
    });

    it('should replace 3000 with 8000 in Manus dev URL', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'https://3000-abc123-def456.manusvm.computer/',
        hostname: '3000-abc123-def456.manusvm.computer',
        protocol: 'https:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url = getApiBaseUrlSync();

      expect(url).toContain('8000-abc123-def456');
      expect(url).not.toContain('3000');
    });
  });

  describe('Published URLs', () => {
    it('should detect backend URL for published manus.space URL', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'https://literaiapp-kyf7wxnb.manus.space/auth',
        hostname: 'literaiapp-kyf7wxnb.manus.space',
        protocol: 'https:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url = getApiBaseUrlSync();

      expect(url).toBe('https://literaiapp-kyf7wxnb.manus.space:8000');
    });

    it('should add port 8000 to manus.space URLs', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'https://myapp-xyz789.manus.space/',
        hostname: 'myapp-xyz789.manus.space',
        protocol: 'https:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url = getApiBaseUrlSync();

      expect(url).toContain(':8000');
      expect(url).toContain('myapp-xyz789.manus.space');
    });
  });

  describe('Localhost', () => {
    it('should detect backend URL for localhost', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'http://localhost:3000/auth',
        hostname: 'localhost',
        protocol: 'http:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url = getApiBaseUrlSync();

      expect(url).toBe('http://localhost:8000');
    });

    it('should handle 127.0.0.1', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'http://127.0.0.1:3000/auth',
        hostname: '127.0.0.1',
        protocol: 'http:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url = getApiBaseUrlSync();

      expect(url).toBe('http://127.0.0.1:8000');
    });
  });

  describe('Caching', () => {
    it('should cache the detected URL in localStorage', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'https://3000-test.manusvm.computer/',
        hostname: '3000-test.manusvm.computer',
        protocol: 'https:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      getApiBaseUrlSync();

      const cached = localStorage.getItem('literai_backend_url');
      expect(cached).toBe('https://8000-test.manusvm.computer');
    });

    it('should return cached URL on subsequent calls', () => {
      delete (window as any).location;
      (window as any).location = {
        href: 'https://3000-test.manusvm.computer/',
        hostname: '3000-test.manusvm.computer',
        protocol: 'https:',
      };

      const { getApiBaseUrlSync } = require('@/lib/apiConfig');
      const url1 = getApiBaseUrlSync();
      const url2 = getApiBaseUrlSync();

      expect(url1).toBe(url2);
    });
  });
});
