import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';

// Helper component to read auth state
function AuthConsumer() {
  const { state, login, register, logout, getToken } = useAuth();
  return (
    <div>
      <span data-testid="auth-kind">{state.kind}</span>
      {state.kind === 'authenticated' && (
        <span data-testid="auth-role">{state.user.role}</span>
      )}
      {state.kind === 'authenticated' && (
        <span data-testid="auth-email">{state.user.email}</span>
      )}
      <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      <button onClick={() => register('new@test.com', 'pass1234', 'New User')}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => { const t = getToken(); document.title = t || 'no-token'; }}>Get Token</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  // ─── Initial state ─────────────────────────────────────

  it('starts in loading state', () => {
    (fetch as any).mockImplementation(() => new Promise(() => {}));
    renderAuth();
    expect(screen.getByTestId('auth-kind').textContent).toBe('loading');
  });

  it('becomes anonymous when no token exists', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Unauthorized' }) });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
    });
  });

  it('becomes authenticated when probe succeeds', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'valid-token');
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { id: '1', email: 'dj@test.com', full_name: 'DJ Test', role: 'dj' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('authenticated');
      expect(screen.getByTestId('auth-role').textContent).toBe('dj');
    });
  });

  it('clears invalid token and becomes anonymous', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'expired-token');
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
      expect(window.localStorage.getItem('lekkerkuier-jwt')).toBeNull();
    });
  });

  it('keeps token on network error', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'maybe-valid-token');
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.reject(new Error('Network error'));
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
      expect(window.localStorage.getItem('lekkerkuier-jwt')).toBe('maybe-valid-token');
    });
  });

  // ─── Login flow ────────────────────────────────────────

  it('successful login stores token and becomes authenticated', async () => {
    (fetch as any).mockImplementation((url: string, options?: any) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      if (url === '/api/auth/login') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'new-jwt-token',
            user: { id: '2', email: 'test@test.com', full_name: 'Tester', role: 'listener' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
    });

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('authenticated');
      expect(screen.getByTestId('auth-email').textContent).toBe('test@test.com');
      expect(window.localStorage.getItem('lekkerkuier-jwt')).toBe('new-jwt-token');
    }, { timeout: 3000 });
  });

  it('failed login stays anonymous', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      if (url === '/api/auth/login') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid credentials' }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
    });

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
    });
  });

  // ─── Register flow ─────────────────────────────────────

  it('successful registration becomes authenticated', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      if (url === '/api/auth/register') {
        return Promise.resolve({
          status: 201,
          ok: true,
          json: () => Promise.resolve({
            token: 'reg-jwt-token',
            user: { id: '3', email: 'new@test.com', full_name: 'New User', role: 'listener' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
    });

    await userEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('authenticated');
      expect(window.localStorage.getItem('lekkerkuier-jwt')).toBe('reg-jwt-token');
    }, { timeout: 3000 });
  });

  // ─── Logout flow ───────────────────────────────────────

  it('logout clears token and becomes anonymous', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'valid-token');
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { id: '1', email: 'dj@test.com', full_name: 'DJ', role: 'dj' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('authenticated');
    });

    await userEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
      expect(window.localStorage.getItem('lekkerkuier-jwt')).toBeNull();
    });
  });

  // ─── getToken ──────────────────────────────────────────

  it('getToken returns the stored JWT', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'my-jwt');
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { id: '1', email: 't@t.com', full_name: 'T', role: 'listener' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('authenticated');
    });

    await userEvent.click(screen.getByText('Get Token'));
    expect(document.title).toBe('my-jwt');
  });

  it('getToken returns null when no token', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth-kind').textContent).toBe('anonymous');
    });

    await userEvent.click(screen.getByText('Get Token'));
    expect(document.title).toBe('no-token');
  });
});
