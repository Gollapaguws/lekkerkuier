import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';
import { Hero } from '../src/components/Hero';

function renderHero() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Hero playing={false} onTogglePlay={() => {}} />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Hero', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
  });

  it('renders the station tagline', () => {
    renderHero();
    expect(screen.getByText(/PsyTech/i)).toBeInTheDocument();
  });

  it('renders a play button', () => {
    renderHero();
    const buttons = screen.getAllByRole('button');
    const playBtn = buttons.find(b => b.getAttribute('aria-label')?.toLowerCase().includes('play'));
    expect(playBtn).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { container } = renderHero();
    expect(container).toBeTruthy();
  });
});
