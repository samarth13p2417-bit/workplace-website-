/**
 * Week 1: Day 3-5 — Authentication API Service
 * Client-side JWT simulation with localStorage persistence.
 * Mimics real REST endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me  (verify token)
 */

const AUTH_DB_KEY = 'jira_auth_users_v1';
const TOKEN_KEY = 'jira_auth_token_v1';
const SESSION_KEY = 'jira_auth_session_v1';

// Simple JWT-like token generator (base64 encoded payload with expiry)
const generateToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'Member',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  // Encode as base64 to simulate JWT structure (header.payload.signature)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa(`${header}.${body}.secret_key_simulation`);
  return `${header}.${body}.${signature}`;
};

// Decode and verify token
const verifyToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch {
    return null;
  }
};

// Get registered users from localStorage
const getUsersDB = () => {
  try {
    const raw = localStorage.getItem(AUTH_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse auth DB:', e);
  }
  return [];
};

// Save users DB
const saveUsersDB = (users) => {
  localStorage.setItem(AUTH_DB_KEY, JSON.stringify(users));
};

// Artificial network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  /**
   * POST /api/auth/register
   * Register a new user account
   */
  async register({ name, email, password }) {
    await delay(400);

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    const users = getUsersDB();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: btoa(password), // Simulated hash (NOT real security)
      role: 'Member',
      avatar: null,
      initials: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsersDB(users);

    // Auto-login after registration
    const token = generateToken(newUser);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        initials: newUser.initials,
        avatar: newUser.avatar,
      })
    );

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        initials: newUser.initials,
      },
      token,
      message: 'Registration successful.',
    };
  },

  /**
   * POST /api/auth/login
   * Authenticate with email + password
   */
  async login({ email, password }) {
    await delay(350);

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const users = getUsersDB();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      throw new Error('No account found with this email.');
    }

    if (atob(user.passwordHash) !== password) {
      throw new Error('Incorrect password.');
    }

    const token = generateToken(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        avatar: user.avatar,
      })
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
      },
      token,
      message: 'Login successful.',
    };
  },

  /**
   * POST /api/auth/login/social
   * Login via Google/Microsoft OAuth simulation
   * (Used when user picks an account from the OAuth chooser)
   */
  async loginSocial({ name, email, provider }) {
    await delay(250);

    const users = getUsersDB();
    let user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    // Auto-register social users if they don't exist
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        passwordHash: btoa(`social_${provider}_${Date.now()}`),
        role: 'Member',
        avatar: null,
        initials: (name || email.split('@')[0])
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
        provider,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsersDB(users);
    }

    const token = generateToken(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        avatar: user.avatar,
      })
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
      },
      token,
    };
  },

  /**
   * GET /api/auth/me
   * Verify current token and return user session
   */
  async verifySession() {
    await delay(100);
    const token = localStorage.getItem(TOKEN_KEY);
    const payload = verifyToken(token);

    if (!payload) {
      // Clear stale session
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      return { authenticated: false, user: null };
    }

    // Also load full session data
    let sessionUser = null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) sessionUser = JSON.parse(raw);
    } catch {
      sessionUser = null;
    }

    return {
      authenticated: true,
      user: sessionUser || {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
      token,
      expiresAt: payload.exp,
    };
  },

  /**
   * POST /api/auth/logout
   * Clear session and token
   */
  async logout() {
    await delay(100);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    return { success: true, message: 'Logged out successfully.' };
  },

  /**
   * Check if a valid session exists (synchronous, for quick checks)
   */
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    return verifyToken(token) !== null;
  },

  /**
   * Get current token (synchronous)
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authApi;
