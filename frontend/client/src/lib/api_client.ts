/**
 * Production-grade API client with automatic token refresh and retry logic
 * 
 * Features:
 * - Automatic retry on 401 (token refresh)
 * - Proper handling of trailing slashes (307 redirects)
 * - Automatic redirect following for fetch API
 * - JWT token management (access + refresh)
 * - Error handling with detailed logging
 */

import { getApiBaseUrlSync } from './apiConfig';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class APIClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private baseURL: string;
  private isRefreshing = false;

  constructor(baseURL?: string) {
    // Use provided baseURL or detect from location
    this.baseURL = baseURL || `${getApiBaseUrlSync()}/api/v1`;
    
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = localStorage.getItem('literai_access_token');
      this.refreshToken = localStorage.getItem('literai_refresh_token');
    }

    console.log('[LiterAI] APIClient initialized with baseURL:', this.baseURL);
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseURL.replace('/api/v1', ''); // Remove /api/v1 suffix to get the base
  }

  /**
   * Update base URL (useful after detecting new backend URL)
   */
  updateBaseUrl(baseURL?: string): void {
    const newUrl = baseURL || `${getApiBaseUrlSync()}/api/v1`;
    if (newUrl !== this.baseURL) {
      console.log('[LiterAI] Updating API base URL from', this.baseURL, 'to', newUrl);
      this.baseURL = newUrl;
    }
  }

  /**
   * Set the access token
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (token && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('literai_access_token', token);
    } else if (!token && typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('literai_access_token');
    }
  }

  /**
   * Get the access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string | null): void {
    this.refreshToken = token;
    if (token && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('literai_refresh_token', token);
    } else if (!token && typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('literai_refresh_token');
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Make an API request with automatic retry on 401
   */
  async request<T = any>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    try {
      return await this.makeRequest<T>(method, path, data);
    } catch (error: any) {
      // If 401 and not an auth endpoint, try to refresh token
      if (error.status === 401 && !path.includes("/auth/")) {
        try {
          // Prevent multiple concurrent refresh requests
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }

          const newToken = await this.refreshPromise;
          this.refreshPromise = null;

          this.setAccessToken(newToken);

          // Retry original request with new token
          return await this.makeRequest<T>(method, path, data);
        } catch (refreshError) {
          // Refresh failed, clear token and re-throw
          this.setAccessToken(null);
          throw refreshError;
        }
      }
      throw error;
    }
  }

  /**
   * Make an HTTP request
   */
  private async makeRequest<T = any>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    console.log('[LiterAI] API Request:', { method, url, hasAuth: !!this.accessToken });

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include HTTP-only cookies
      redirect: "follow", // Follow 307 redirects
    });

    console.log('[LiterAI] API Response:', { method, url, status: response.status });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }

      throw new APIError(
        errorData.detail || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token from HTTP-only cookie
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      // Wait for refresh to complete
      return new Promise((resolve, reject) => {
        const checkToken = setInterval(() => {
          if (!this.isRefreshing && this.accessToken) {
            clearInterval(checkToken);
            resolve(this.accessToken!);
          }
        }, 100);
      });
    }

    this.isRefreshing = true;

    try {
      console.log('[LiterAI] Refreshing access token...');
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include HTTP-only cookies
        redirect: "follow", // Follow 307 redirects
      });

      if (!response.ok) {
        throw new APIError("Token refresh failed", response.status);
      }

      const data = await response.json();
      console.log('[LiterAI] Token refreshed successfully');
      return data.access_token;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  /**
   * POST request
   */
  async post<T = any>(path: string, data?: any): Promise<T> {
    return this.request<T>("POST", path, data);
  }

  /**
   * PUT request
   */
  async put<T = any>(path: string, data?: any): Promise<T> {
    return this.request<T>("PUT", path, data);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(path: string, data?: any): Promise<T> {
    return this.request<T>("PATCH", path, data);
  }

  /**
   * Clear all tokens
   */
  clear(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }
}

// Global API client instance
export const apiClient = new APIClient();
