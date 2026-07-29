import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../src/auth/AuthProvider';
import { ToastProvider } from '../src/components/Toast';

// ─── Global mocks ────────────────────────────────────────

vi.mock('../src/api/client', () => ({
  api: {
    shows: () => Promise.resolve([]),
    nowPlaying: () => Promise.resolve([]),
    liveStats: () => Promise.resolve({ viewer_count: 0, bitrate: 0, server_name: '', listenurl: '', updated_date: '' }),
    djs: () => Promise.resolve([]),
    sendContact: () => Promise.resolve({ ok: true }),
    notifyContact: () => Promise.resolve({ ok: true }),
    sendChat: () => Promise.resolve({ ok: true }),
    submitShow: () => Promise.resolve({}),
    presign: () => Promise.resolve({}),
  },
}));

vi.mock('../src/theme/themes.tsx', () => ({
  useTheme: () => ({ theme: 'psytech', setTheme: vi.fn(), cycleTheme: vi.fn() }),
  ThemeProvider: ({ children }: any) => children,
  THEMES: ['cosmic', 'industrial', 'psytech'],
}));

vi.mock('../src/i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'en', setLang: vi.fn(),
    t: (key: string) => {
      const m: Record<string, string> = {
        'nav.home': 'Home','nav.schedule': 'Schedule','nav.djs': 'DJs','nav.events': 'Events',
        'nav.chat': 'Chat','nav.about': 'About','nav.support': 'Support','nav.contact': 'Contact',
        'nav.submit': 'Become a DJ','blog.title': 'Blog','history.title': 'History',
        'home.tagline': 'PsyTech Fusion Radio','home.featuredShows': 'Featured Shows',
        'home.submitYourShow': 'Become a DJ','about.title': 'About','events.title': 'Events',
      };
      return m[key] || key;
    },
  }),
  I18nProvider: ({ children }: any) => children,
}));

// Mock sub-components to simplify rendering
vi.mock('../src/components/Hero', () => ({
  Hero: ({ tagline }: any) => <div data-testid="hero">{tagline}</div>,
}));
vi.mock('../src/components/Player', () => ({
  Player: () => <div data-testid="player">Player</div>,
}));
vi.mock('../src/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));
vi.mock('../src/components/AudioVisualizer', () => ({
  AudioVisualizer: () => <div data-testid="visualizer" />,
}));
vi.mock('../src/components/NowPlaying', () => ({
  NowPlaying: () => <div data-testid="now-playing" />,
}));
vi.mock('../src/components/RecentlyPlayed', () => ({
  RecentlyPlayed: () => <div data-testid="recently-played" />,
}));
vi.mock('../src/components/ShowCard', () => ({
  ShowCard: () => <div data-testid="show-card" />,
}));
vi.mock('../src/components/Skeleton', () => ({
  PageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

// Mock InstallBanner — uses window.matchMedia which jsdom lacks
vi.mock('../src/components/InstallBanner', () => ({
  InstallBanner: () => null,
}));

// ─── Render helper ───────────────────────────────────────
// App uses HashRouter internally — do NOT wrap in another Router.
// Navigate by setting window.location.hash.

let AppModule: any;

async function renderApp(initialHash = '/') {
  window.location.hash = initialHash;
  if (!AppModule) {
    AppModule = await import('../src/App');
  }
  return render(
    <ToastProvider>
      <AuthProvider>
        <AppModule.App />
      </AuthProvider>
    </ToastProvider>
  );
}

function navigateTo(hash: string) {
  act(() => {
    window.location.hash = hash;
  });
}

// ─── Setup ──────────────────────────────────────────────
beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '/';
  vi.stubGlobal('fetch', vi.fn());
  (fetch as any).mockImplementation((url: string) => {
    if (url === '/api/auth/me') {
      return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
  });
});  afterEach(() => {
  window.location.hash = '/';
});

// ─── Admin auth helper ──────────────────────────────────
function mockAdminAuth() {
  window.localStorage.setItem('lekkerkuier-jwt', 'admin-token');
  (fetch as any).mockImplementation((url: string, options?: any) => {
    if (url === '/api/auth/me') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: { id: 'admin-1', email: 'admin@test.com', full_name: 'Admin User', role: 'owner' },
        }),
      });
    }
    // Content tab: GET settings
    if (url === '/api/site/settings' && (!options || !options.method || options.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ stationName: 'Lekker Kuier', tagline: 'PsyTech Fusion', description: 'Internet radio' }),
      });
    }
    // Content tab: PUT settings
    if (url === '/api/site/settings' && options?.method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
    }
    // Users tab: GET users
    if (url === '/api/auth/users') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          users: [
            { id: 'admin-1', email: 'admin@test.com', full_name: 'Admin User', role: 'owner', created_at: '2026-01-01' },
            { id: 'user-2', email: 'listener@test.com', full_name: 'Listener Jane', role: 'listener', created_at: '2026-06-01' },
          ],
        }),
      });
    }
    // Users tab: POST promote
    if (url === '/api/auth/promote' && options?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
    }
    return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
  });
}

// ══════════════════════════════════════════════════════════
//  Integration Tests
// ══════════════════════════════════════════════════════════

describe('Integration: Anonymous Browsing', () => {
  it('loads home page and renders hero', async () => {
    await renderApp('/');
    const hero = await screen.findByTestId('hero');
    expect(hero).toBeInTheDocument();
  });

  it('navigates from home to About page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/about');
    const about = await screen.findByText('About');
    expect(about).toBeInTheDocument();
  });

  it('navigates to Blog page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/blog');
    const blog = await screen.findByText('Blog');
    expect(blog).toBeInTheDocument();
  });

  it('navigates to Schedule page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/schedule');
    const schedule = await screen.findByText('Weekly Schedule');
    expect(schedule).toBeInTheDocument();
  });

  it('navigates to Events page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/events');
    const events = await screen.findByText('Events');
    expect(events).toBeInTheDocument();
  });

  it('shows 404 page for unknown routes', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/nonexistent');
    const notFound = await screen.findByText('404');
    expect(notFound).toBeInTheDocument();
  });

  it('shows player and footer on all pages', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');
    expect(screen.getByTestId('player')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});

describe('Integration: Login Flow', () => {
  it('logs in with valid credentials and redirects to home', async () => {
    (fetch as any).mockImplementation((url: string, options?: any) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      if (url === '/api/auth/login' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'jwt-integration-token',
            user: { id: '1', email: 'user@test.com', full_name: 'Test User', role: 'listener' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    await renderApp('#/login');
    await screen.findByText('Sign In');

    // Fill in credentials
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Should redirect to home
    const hero = await screen.findByTestId('hero');
    expect(hero).toBeInTheDocument();
    expect(window.localStorage.getItem('lekkerkuier-jwt')).toBe('jwt-integration-token');
  });

  it('shows error on invalid credentials', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      if (url === '/api/auth/login') {
        return Promise.resolve({
          ok: false, status: 401,
          json: () => Promise.resolve({ error: 'Invalid email or password' }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    await renderApp('#/login');
    await screen.findByText('Sign In');

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'bad@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const error = await screen.findByText(/Invalid email/);
    expect(error).toBeInTheDocument();
  });
});

describe('Integration: Register Flow', () => {
  it('registers a new account and redirects to home', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      if (url === '/api/auth/register') {
        return Promise.resolve({
          status: 201, ok: true,
          json: () => Promise.resolve({
            token: 'reg-jwt-token',
            user: { id: '2', email: 'new@test.com', full_name: 'New User', role: 'listener' },
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    await renderApp('#/register');
    await screen.findByText('Create Account');

    await userEvent.type(screen.getByPlaceholderText('Your name or alias'), 'New User');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'new@test.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), 'pass1234');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    const hero = await screen.findByTestId('hero');
    expect(hero).toBeInTheDocument();
    expect(window.localStorage.getItem('lekkerkuier-jwt')).toBe('reg-jwt-token');
  });

  it('shows validation error for short password', async () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    await renderApp('#/register');
    await screen.findByText('Create Account');

    await userEvent.type(screen.getByPlaceholderText('Your name or alias'), 'Test');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), '12345');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    const error = await screen.findByText(/at least 6/);
    expect(error).toBeInTheDocument();
  });
});

describe('Integration: Protected Routes', () => {
  it('redirects anonymous user from /dj to login', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/dj');
    const signIn = await screen.findByText('Sign In');
    expect(signIn).toBeInTheDocument();
  });

  it('redirects anonymous user from /manager to login', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/manager');
    const signIn = await screen.findByText('Sign In');
    expect(signIn).toBeInTheDocument();
  });

  it('redirects anonymous user from /admin to login', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/admin');
    const signIn = await screen.findByText('Sign In');
    expect(signIn).toBeInTheDocument();
  });

  it('allows authenticated DJ to access DJ dashboard', async () => {
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

    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/dj');
    const djDashboard = await screen.findByText('DJ Dashboard');
    expect(djDashboard).toBeInTheDocument();
  });

  it('manager can access dashboard and interact with disconnect button', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'mgr-token');
    (fetch as any).mockImplementation((url: string, options?: any) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { id: '2', email: 'mgr@test.com', full_name: 'Manager', role: 'manager' },
          }),
        });
      }
      if (url === '/api/auth/disconnect-dj' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, message: 'DJ disconnected' }),
        });
      }
      return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    });

    await renderApp('/');
    await screen.findByTestId('hero');

    // Navigate to Manager dashboard
    navigateTo('#/manager');
    await screen.findByText('Station Manager');

    // Find and click the Disconnect DJ button
    const disconnectBtn = screen.getByText('🔌 Disconnect DJ');
    await userEvent.click(disconnectBtn);

    // Should show success feedback
    const feedback = await screen.findByText('✅ DJ disconnected');
    expect(feedback).toBeInTheDocument();
  });
});

describe('Integration: Navigation', () => {
  it('player bar persists across page changes', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');
    expect(screen.getByTestId('player')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    navigateTo('#/schedule');
    await screen.findByText('Weekly Schedule');
    expect(screen.getByTestId('player')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('navigates to Contact page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/contact');
    const heading = await screen.findByText('Contact');
    expect(heading).toBeInTheDocument();
  });

  it('navigates to Chat page', async () => {
    // Chat page uses scrollTo which jsdom doesn't implement
    Element.prototype.scrollTo = vi.fn();
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/chat');
    const heading = await screen.findByText('Listener Chat & Requests');
    expect(heading).toBeInTheDocument();
  });

  it('navigates to Become a DJ page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/submit');
    const heading = await screen.findByText('Become a DJ');
    expect(heading).toBeInTheDocument();
  });

  it('navigates to SiteMap page', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/sitemap');
    const heading = await screen.findByText('Site');
    expect(heading).toBeInTheDocument();
  });
});

describe('Integration: Admin Content Save', () => {
  it('admin edits site content and saves successfully', async () => {
    mockAdminAuth();

    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/admin');
    await screen.findByText('Station Management');

    // Click Content tab
    await userEvent.click(screen.getByText('📝 Content'));
    await screen.findByText('Site Content');

    // Wait for settings to load (find pre-filled inputs)
    const stationInput = await screen.findByDisplayValue('Lekker Kuier');
    expect(stationInput).toBeInTheDocument();

    // Edit the tagline
    const taglineInput = screen.getByDisplayValue('PsyTech Fusion');
    await userEvent.clear(taglineInput);
    await userEvent.type(taglineInput, 'New Tagline 2026');

    // Save
    await userEvent.click(screen.getByText('💾 Save Settings'));

    // Should show success flash
    const flash = await screen.findByText('✅ Settings saved');
    expect(flash).toBeInTheDocument();
  });
});

describe('Integration: Admin User Promote', () => {
  it('admin promotes a listener to dj', async () => {
    mockAdminAuth();

    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/admin');
    await screen.findByText('Station Management');

    // Wait for users table to load
    await screen.findByText('Listener Jane');

    // Find the select dropdown for Listener Jane (not the admin/"You" row)
    // The select for non-self users has role options; admin sees "You" instead
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);

    // Change Listener Jane's role from listener to dj
    await userEvent.selectOptions(selects[0], 'dj');

    // Should show promotion flash
    const flash = await screen.findByText('User updated to dj');
    expect(flash).toBeInTheDocument();
  });
});

describe('Integration: Contact Form Submit', () => {
  it('fills contact form and submits successfully', async () => {
    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/contact');
    await screen.findByText('Contact');

    // Fill form
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'test@lekkerkuier.com');
    await userEvent.type(screen.getByPlaceholderText("What's on your mind?"), 'Great radio station!');

    // Submit
    await userEvent.click(screen.getByText('Send Message'));

    // Should show success state
    const success = await screen.findByText('Message Sent!');
    expect(success).toBeInTheDocument();
  });
});

describe('Integration: Chat Message Send', () => {
  it('sends a chat message and sees it in the feed', async () => {
    Element.prototype.scrollTo = vi.fn() as any;

    await renderApp('/');
    await screen.findByTestId('hero');

    navigateTo('#/chat');
    await screen.findByText('Listener Chat & Requests');

    // Fill chat form
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'ChatUser');
    await userEvent.type(screen.getByPlaceholderText(/Type a message/), 'Hello world!');

    // Submit
    await userEvent.click(screen.getByText('Send'));

    // The new message should appear in the chat feed
    const sentMsg = await screen.findByText('Hello world!');
    expect(sentMsg).toBeInTheDocument();

    // The sender name should also be visible
    expect(screen.getByText('ChatUser')).toBeInTheDocument();
  });
});
