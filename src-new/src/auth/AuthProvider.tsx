import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

/**
 * Role-based AuthProvider — 4-tier system backed by Node.js auth backend.
 *
 * Roles (ascending): listener → dj → manager → owner
 *
 * State transitions:
 *   mount → GET /api/auth/me (Bearer JWT from localStorage)
 *     200 → Authenticated with role
 *     401 → Anonymous (clear stale token)
 *     4xx/5xx → Anonymous (keep token for retry)
 *
 *   login(email, pw) → POST /api/auth/login
 *     200 → store JWT → Authenticated
 *
 *   register(email, pw, name) → POST /api/auth/register
 *     201 → store JWT → Authenticated (all new accounts are 'listener')
 *
 *   logout() → clear JWT → Anonymous
 */

export type Role = 'listener' | 'dj' | 'manager' | 'owner';

export const ROLE_RANK: Record<Role, number> = {
  listener: 0,
  dj: 1,
  manager: 2,
  owner: 3,
};

/** Check if a role meets the minimum required rank */
export function roleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at?: string;
}

export type AuthState =
  | { kind: 'loading' }
  | { kind: 'anonymous'; user: Record<string, never> }
  | { kind: 'authenticated'; user: User };

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  getToken: () => string | null;
}

const TOKEN_KEY = 'lekkerkuier-jwt';

const AuthContext = createContext<AuthContextValue | null>(null);

async function probeMe(token: string | null): Promise<AuthState> {
  if (!token) return { kind: 'anonymous', user: {} };
  try {
    const r = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (r.ok) {
      const { user } = await r.json();
      return { kind: 'authenticated', user: user as User };
    }
    // Token invalid — clear it
    if (r.status === 401) {
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    }
    return { kind: 'anonymous', user: {} };
  } catch {
    // Network blip — keep token for retry
    return { kind: 'anonymous', user: {} };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ kind: 'loading' });

  // Mount probe
  useEffect(() => {
    let cancelled = false;
    const tok = (() => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } })();
    probeMe(tok).then((s) => { if (!cancelled) setState(s); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await r.json().catch(() => ({}));
      if (r.ok && body.token && body.user) {
        try { localStorage.setItem(TOKEN_KEY, body.token); } catch { /* ignore */ }
        setState({ kind: 'authenticated', user: body.user });
        return { ok: true };
      }
      return { ok: false, error: body.error || 'Login failed' };
    } catch {
      return { ok: false, error: 'Network error — try again' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const body = await r.json().catch(() => ({}));
      if ((r.status === 201 || r.ok) && body.token && body.user) {
        try { localStorage.setItem(TOKEN_KEY, body.token); } catch { /* ignore */ }
        setState({ kind: 'authenticated', user: body.user });
        return { ok: true };
      }
      return { ok: false, error: body.error || 'Registration failed' };
    } catch {
      return { ok: false, error: 'Network error — try again' };
    }
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setState({ kind: 'anonymous', user: {} });
  }, []);

  const getToken = useCallback(() => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, register, logout, getToken }),
    [state, login, register, logout, getToken]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
