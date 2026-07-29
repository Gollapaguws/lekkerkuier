import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';
import { Footer } from '../src/components/Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Footer />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Footer', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
  });

  it('renders without crashing', () => {
    const { container } = renderFooter();
    expect(container).toBeTruthy();
  });

  it('contains links to static pages', () => {
    renderFooter();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('includes copyright or station name', () => {
    const { container } = renderFooter();
    expect(container.textContent).toContain('Lekker Kuier');
  });
});
