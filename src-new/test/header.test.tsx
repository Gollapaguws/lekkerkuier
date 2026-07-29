import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../src/components/Header';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';

// Mock theme and i18n modules to avoid provider chain complexity
// Must match the exact import path Header uses: '../theme/themes.tsx'
vi.mock('../src/theme/themes.tsx', () => ({
  useTheme: () => ({ theme: 'psytech', setTheme: vi.fn(), cycleTheme: vi.fn() }),
  ThemeProvider: ({ children }: any) => children,
  THEMES: ['cosmic', 'industrial', 'psytech'],
  ThemeName: 'psytech',
}));

vi.mock('../src/i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'en',
    setLang: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.home': 'Home',
        'nav.schedule': 'Schedule',
        'nav.djs': 'DJs',
        'nav.events': 'Events',
        'nav.gallery': 'Gallery',
        'nav.chat': 'Chat',
        'nav.about': 'About',
        'nav.support': 'Support',
        'nav.contact': 'Contact',
        'nav.submit': 'Become a DJ',
        'nav.signin': 'Sign in',
        'history.title': 'History',
        'blog.title': 'Blog',
      };
      return map[key] || key;
    },
  }),
  I18nProvider: ({ children }: any) => children,
}));

function renderHeader(onSearchOpen = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Header onSearchOpen={onSearchOpen} />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
  });

  it('renders the station name link', () => {
    renderHeader();
    expect(screen.getByText('Lekkerkuier')).toBeInTheDocument();
  });

  it('has a working home link', () => {
    renderHeader();
    const homeLink = screen.getByText('Lekkerkuier').closest('a');
    expect(homeLink).toHaveAttribute('href');
    expect(homeLink!.getAttribute('href')).toMatch(/\/$|#\//);
  });

  it('has navigation links for main sections', () => {
    renderHeader();
    const links = screen.getAllByRole('link');
    const linkTexts = links.map(l => l.textContent);
    expect(linkTexts).toContain('Lekkerkuier');
  });

  it('calls onSearchOpen when search button is clicked', async () => {
    const onSearchOpen = vi.fn();
    renderHeader(onSearchOpen);

    const searchBtn = screen.getByLabelText('Search');
    await userEvent.click(searchBtn);
    expect(onSearchOpen).toHaveBeenCalledTimes(1);
  });

  it('renders the language switcher', () => {
    renderHeader();
    const langBtn = screen.getByText('EN');
    expect(langBtn).toBeInTheDocument();
  });
});
