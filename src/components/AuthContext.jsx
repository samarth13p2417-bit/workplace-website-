/**
 * Week 1: Day 3-5 — Auth Context & Provider
 * Provides authentication state to the entire app via React Context.
 * Usage: const { user, login, register, logout, isAuthenticated } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // True while checking existing session
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount: check if user has an existing valid session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const result = await authApi.verifySession();
      if (result.authenticated && result.user) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = useCallback(async ({ name, email, password }) => {
    const result = await authApi.register({ name, email, password });
    setUser(result.user);
    setToken(result.token);
    setIsAuthenticated(true);
    return result;
  }, []);

  /**
   * Login with email + password
   */
  const login = useCallback(async ({ email, password }) => {
    const result = await authApi.login({ email, password });
    setUser(result.user);
    setToken(result.token);
    setIsAuthenticated(true);
    return result;
  }, []);

  /**
   * Social login (Google/Microsoft OAuth)
   */
  const loginSocial = useCallback(async ({ name, email, provider }) => {
    const result = await authApi.loginSocial({ name, email, provider });
    setUser(result.user);
    setToken(result.token);
    setIsAuthenticated(true);
    return result;
  }, []);

  /**
   * Logout and clear session
   */
  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    register,
    login,
    loginSocial,
    logout,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth state from any component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};

export default AuthContext;
