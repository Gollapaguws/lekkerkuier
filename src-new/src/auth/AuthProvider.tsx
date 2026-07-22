import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

/**
 * AuthProvider — 3-state contract that mirrors the /api/auth/me
 * contract behind the nginx + call-trigger stack.
 *
 * State transitions:
 *   mount       → fetch('/api/auth/me') with Bearer if localStorage has a
 *                 token
 *     200 + bare user shape  → Authenticated
 *     200 + {"user":{}}     → Anonymous (Path-X shape; never null)
 *     401                    → Anonymous (also clears stale token)
 *     network blip           → Anonymous (without nuking the token; the
 *                              60s re-probe below will catch a real
 *                              expiry rather than a transient fetch err)
 *
 *   login(tok)  → POST /api/auth/login → on 200 store token + Authenticated
 *   logout()    → clear token + Anonymous
 *
 * The "anonymous" branch stays `user: {}` (an empty object) because the
 * SPA's layout helper computes `(s && (s.full_name||s.email||"?"))[0]`
 * and `null[0]` would throw — see Path-X defect 2026-07-19.
 */

export interface OperatorUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator';
}

export type AuthState =
  | { kind: 'loading' }
  | { kind: 'anonymous'; user: Record<string, never> }
  | { kind: 'authenticated'; user: OperatorUser };

interface AuthContextValue {
  state: AuthState;
  login: (token: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  getToken: () => string | null;
}

const TOKEN_KEY = 'lekkerkuier-token';

const AuthContext = createContext<AuthContextValue | null>(null);

async function probeMe(token: string | null): Promise<AuthState> {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const r = await fetch('/api/auth/me', { headers, cache: 'no-store' });
    if (r.ok) {
      const body = await r.json().catch(() => null);
      if (body && typeof body === 'object' && 'id' in body && 'role' in body) {
        return { kind: 'authenticated', user: body as OperatorUser };
      }
      return { kind: 'anonymous', user: {} };
    }
    if (r.status === 401) {
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      return { kind: 'anonymous', user: {} };
    }
    return { kind: 'anonymous', user: {} };
  } catch {
    // Network blip — degrade without nuking the token.
    return { kind: 'anonymous', user: {} };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const tok = (() => {
      try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    })();
    probeMe(tok).then((s) => { if (!cancelled) setState(s); });
    return () => { cancelled = true; };
  }, []);

  // Periodic re-probe (60s). If the operator's token expires server-side
  // we want the SPA to flip to anonymous within ~1m rather than the next
  // manual page reload. Light enough that it doesn't hammer the API.
  useEffect(() => {
    const id = setInterval(() => {
      const tok = (() => {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
      })();
      probeMe(tok).then((s) => setState(s));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const login = useCallback(async (token: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (r.ok) {
        const user = (await r.json()) as OperatorUser;
        try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
        setState({ kind: 'authenticated', user });
        return { ok: true };
      }
      if (r.status === 401) return { ok: false, error: 'invalid_token' };
      if (r.status === 429) return { ok: false, error: 'rate_limited' };
      return { ok: false, error: 'unknown' };
    } catch {
      return { ok: false, error: 'network' };
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
    () => ({ state, login, logout, getToken }),
    [state, login, logout, getToken]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
