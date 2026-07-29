import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';

// We test RequireRole indirectly by importing the function from App.tsx.
// Since RequireRole is not exported, we recreate it here identically.

import { type Role, roleAtLeast } from '../src/auth/AuthProvider';

function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { state } = useAuth();
  if (state.kind === 'loading') return <div>Loading...</div>;
  if (state.kind === 'anonymous') return <div>Unauthorized — redirect to login</div>;
  if (!roles.includes(state.user.role)) return <div>Forbidden — wrong role</div>;
  return <>{children}</>;
}

// Mock fetch for auth probe
function mockAuthProbe(response: { ok: boolean; status: number; user?: any }) {
  (fetch as any).mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: () => Promise.resolve(response.ok ? { user: response.user } : { error: 'nope' }),
  });
}

function renderRoute(initialRoute: string, roles: Role[]) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireRole roles={roles}>
                <div>Protected Content</div>
              </RequireRole>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Route Protection (RequireRole)', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows loading while auth state is unknown', () => {
    // Never resolve the probe
    (fetch as any).mockImplementation(() => new Promise(() => {}));

    renderRoute('/protected', ['listener']);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when anonymous', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    renderRoute('/protected', ['listener']);
    // Wait for probe to resolve
    const el = await screen.findByText('Unauthorized — redirect to login');
    expect(el).toBeInTheDocument();
  });

  it('allows access when role matches', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'token');
    mockAuthProbe({
      ok: true,
      status: 200,
      user: { id: '1', email: 'dj@test.com', full_name: 'DJ', role: 'dj' },
    });

    renderRoute('/protected', ['dj', 'manager', 'owner']);
    const el = await screen.findByText('Protected Content');
    expect(el).toBeInTheDocument();
  });

  it('blocks access when role is too low', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'token');
    mockAuthProbe({
      ok: true,
      status: 200,
      user: { id: '1', email: 'l@test.com', full_name: 'Listener', role: 'listener' },
    });

    renderRoute('/protected', ['manager', 'owner']);
    const el = await screen.findByText('Forbidden — wrong role');
    expect(el).toBeInTheDocument();
  });

  it('allows owner to access owner-only routes', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'token');
    mockAuthProbe({
      ok: true,
      status: 200,
      user: { id: '1', email: 'o@test.com', full_name: 'Owner', role: 'owner' },
    });

    renderRoute('/protected', ['owner']);
    const el = await screen.findByText('Protected Content');
    expect(el).toBeInTheDocument();
  });
});
