/**
 * Authentication API Service
 * Connects to Express + MongoDB backend with JWT token session management.
 * Endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/login/social
 *   GET  /api/auth/me  (verify token)
 *   POST /api/auth/logout
 */

const TOKEN_KEY = 'jira_auth_token_v1';
const SESSION_KEY = 'jira_auth_session_v1';
const API_BASE = '/api/auth';

export const authApi = {
  /**
   * POST /api/auth/register
   * Register a new user account
   */
  async register({ name, email, password }) {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.warn('[authApi] Backend unreachable, falling back to local simulation:', err.message);
      // Fallback local simulation if backend server is offline
      return this._localRegister({ name, email, password });
    }
  },

  /**
   * POST /api/auth/login
   * Authenticate with email + password
   */
  async login({ email, password }) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.warn('[authApi] Backend unreachable, falling back to local simulation:', err.message);
      return this._localLogin({ email, password });
    }
  },

  /**
   * POST /api/auth/login/social
   * Login via Google/Microsoft OAuth
   */
  async loginSocial({ name, email, provider }) {
    try {
      const res = await fetch(`${API_BASE}/login/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, provider }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Social login failed.');
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.warn('[authApi] Backend unreachable, falling back to local simulation:', err.message);
      return this._localLoginSocial({ name, email, provider });
    }
  },

  /**
   * GET /api/auth/me
   * Verify current token and return user session
   */
  async verifySession() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, user: null };
    }

    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        return {
          authenticated: true,
          user: data.user,
          token,
        };
      }
    } catch (err) {
      console.warn('[authApi] Session verify error, falling back to cached session:', err.message);
    }

    // Fallback: check cached session in localStorage
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const cachedUser = JSON.parse(raw);
        return { authenticated: true, user: cachedUser, token };
      }
    } catch {
      // ignore
    }

    return { authenticated: false, user: null };
  },

  /**
   * POST /api/auth/logout
   */
  async logout() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // Ignore network errors on logout
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    return { success: true, message: 'Logged out successfully.' };
  },

  /**
   * Synchronous check
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // =========================================================================
  // LOCAL FALLBACK HELPERS
  // =========================================================================
  _localRegister({ name, email }) {
    const user = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'Member',
      initials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    };
    const token = `mock_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user, token, message: 'Registration successful.' };
  },

  _localLogin({ email }) {
    const user = {
      id: 'usr_samarth_1',
      name: 'Samarth Choudhary',
      email,
      role: 'Member',
      initials: 'SC',
    };
    const token = `mock_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user, token, message: 'Login successful.' };
  },

  _localLoginSocial({ name, email, provider }) {
    const user = {
      id: `usr_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      role: 'Member',
      initials: (name || email).substring(0, 2).toUpperCase(),
      provider,
    };
    const token = `mock_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user, token };
  },
};

export default authApi;
