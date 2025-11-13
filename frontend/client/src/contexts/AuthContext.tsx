/**
 * AuthContext - Production-grade authentication management
 * 
 * Features:
 * - HTTP-only cookies for refresh tokens (secure)
 * - Access tokens stored in memory (RAM)
 * - Automatic token refresh before expiration
 * - Retry logic on 401 errors
 * - Comprehensive error handling
 * - Audit logging on backend
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api_client';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  /**
   * Schedule token refresh before expiration
   * Access tokens expire in 15 minutes, refresh at 13 minutes
   */
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh 2 minutes before expiration (15 min token - 2 min = 13 min)
    refreshTimeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, 13 * 60 * 1000);
  }, []);

  /**
   * Refresh access token silently
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await apiClient.post<{access_token: string}>('/auth/refresh');
      setAccessToken(response.access_token);
      apiClient.setAccessToken(response.access_token);
      setError(null);
      scheduleTokenRefresh();
    } catch (err) {
      // Refresh failed - logout user
      logout().catch(console.error);
    }
  }, [scheduleTokenRefresh]);

  /**
   * Initialize authentication on mount
   * Attempts to refresh token from HTTP-only cookie
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitializingRef.current) return;
      isInitializingRef.current = true;

      try {
        // Update API client base URL (detects from current location)
        apiClient.updateBaseUrl();
        console.log('[LiterAI] API client base URL:', apiClient['baseURL']);

        // Try to refresh token (refresh_token is in HTTP-only cookie)
        const response = await apiClient.post<{access_token: string}>('/auth/refresh');
        setAccessToken(response.access_token);
        apiClient.setAccessToken(response.access_token);

        // Fetch current user
        const currentUser = await apiClient.get<User>('/auth/me');
        setUser(currentUser);
        setError(null);

        // Schedule next refresh
        scheduleTokenRefresh();
      } catch (err) {
        // No valid session - user not authenticated
        setUser(null);
        setAccessToken(null);
        setError(null);
      } finally {
        setIsLoading(false);
        isInitializingRef.current = false;
      }
    };

    initializeAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<{access_token: string}>('/auth/login', {
        email,
        password
      });

      setAccessToken(response.access_token);
      apiClient.setAccessToken(response.access_token);

      // Fetch user info
      const currentUser = await apiClient.get<User>('/auth/me');
      setUser(currentUser);

      scheduleTokenRefresh();
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setAccessToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        await apiClient.post<User>('/auth/register', {
          email,
          password,
          full_name: fullName
        });

        // Auto-login after registration
        await login(email, password);
      } catch (err: any) {
        const errorMessage = err.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  /**
   * Logout and clear all authentication data
   */
  const logout = useCallback(async () => {
    try {
      // Notify backend to revoke refresh token
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Logout on backend failed, but clear local state anyway
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      setError(null);
      apiClient.setAccessToken(null);

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    accessToken,
    error,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
