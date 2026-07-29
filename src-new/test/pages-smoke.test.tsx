import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/auth/AuthProvider';
import { ToastProvider } from '../src/components/Toast';

// ─── Global mocks ────────────────────────────────────────

// Mock API client — all data calls return empty arrays or null
vi.mock('../src/api/client', () => ({
  api: {
    shows: () => Promise.resolve([]),
    nowPlaying: () => Promise.resolve([]),
    liveStats: () => Promise.resolve({ viewer_count: 0, bitrate: 0, server_name: '', listenurl: '', updated_date: '' }),
    djs: () => Promise.resolve([]),
    sendContact: () => Promise.resolve({ ok: true }),
    sendChat: () => Promise.resolve({ ok: true }),
    submitShow: () => Promise.resolve({}),
    presign: () => Promise.resolve({}),
  },
  Show: {},
  NowPlayingData: {},
  SongHistoryEntry: {},
  LiveStreamStats: {},
  PresignResult: {},
}));

// Mock theme provider
vi.mock('../src/theme/themes', () => ({
  useTheme: () => ({ theme: 'psytech', setTheme: vi.fn(), cycleTheme: vi.fn() }),
  ThemeProvider: ({ children }: any) => children,
  THEMES: ['cosmic', 'industrial', 'psytech'],
}));

// Mock i18n provider
vi.mock('../src/i18n/I18nProvider', () => {
  const messages: Record<string, string> = {
    'nav.home': 'Home','nav.schedule': 'Schedule','nav.djs': 'DJs','nav.events': 'Events',
    'nav.gallery': 'Gallery','nav.chat': 'Chat','nav.about': 'About','nav.support': 'Support',
    'nav.contact': 'Contact','nav.submit': 'Become a DJ','blog.title': 'Blog','history.title': 'History',
    'home.tagline': 'PsyTech Fusion Radio','home.subtitle': 'Transcend the Vibration',
    'home.listenLive': 'Listen Live','home.featuredShows': 'Featured Shows',
    'home.submitYourShow': 'Become a DJ','blog.all': 'All','blog.announcements': 'Announcements',
    'blog.community': 'Community','blog.tech': 'Tech','blog.music': 'Music','blog.minRead': 'min read',
    'blog.readMore': 'Read More','general.error': 'Error','general.retry': 'Retry',
    'about.title': 'About','about.values': 'Values','about.timeline': 'Timeline','about.faq': 'FAQ',
    'about.stats': 'Stats','events.title': 'Events','events.upcoming': 'Upcoming','events.past': 'Past',
    'events.days': 'd','events.hours':'h','events.mins':'m','events.secs':'s','events.countdown':'Countdown',
    'player.live': 'LIVE','history.nowPlaying': 'Now Playing','history.allTracks': 'All Tracks',
    'support.title': 'Support','support.streaming': 'Streaming',
  };
  return {
    useI18n: () => ({
      lang: 'en',
      setLang: vi.fn(),
      t: (key: string) => messages[key] || key,
    }),
    I18nProvider: ({ children }: any) => children,
    Lang: {},
    MESSAGES: { en: messages, af: {} },
  };
});

// ─── Common test wrapper ────────────────────────────────
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

function renderPage(Page: React.ComponentType<any>, props = {}) {
  return render(
    <Wrapper>
      <Page {...props} />
    </Wrapper>
  );
}

// ─── Setup ──────────────────────────────────────────────
beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
  (fetch as any).mockImplementation((url: string) => {
    if (url === '/api/auth/me') {
      return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
    }
    if (url === '/api/auth/users') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ users: [] }) });
    }
    if (url === '/api/site/settings') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ stationName: 'Test', tagline: 'Test', description: 'Test' }) });
    }
    if (url === '/api/Show') {
      return Promise.resolve({ status: 201, ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
  });
});

// ══════════════════════════════════════════════════════════
//  Page Smoke Tests (render each page without crashing)
// ══════════════════════════════════════════════════════════

describe('Page smoke tests', () => {
  // ─── Static pages (no auth/api required) ──────────────

  it('NotFound renders 404 message', async () => {
    const { NotFound } = await import('../src/pages/NotFound');
    renderPage(NotFound);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('SiteMap renders page directory', async () => {
    const { SiteMap } = await import('../src/pages/SiteMap');
    renderPage(SiteMap);
    expect(screen.getByText('Site')).toBeInTheDocument();
  });

  it('About renders station story', async () => {
    const { About } = await import('../src/pages/About');
    renderPage(About);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('Blog renders blog title', async () => {
    const { Blog } = await import('../src/pages/Blog');
    renderPage(Blog);
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('Events renders events title', async () => {
    const { Events } = await import('../src/pages/Events');
    renderPage(Events);
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('Support renders support title', async () => {
    const { Support } = await import('../src/pages/Support');
    renderPage(Support);
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  // ─── Auth pages ────────────────────────────────────────

  it('Login renders sign in form', async () => {
    const { Login } = await import('../src/pages/Login');
    renderPage(Login);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('Register renders create account form', async () => {
    const { Register } = await import('../src/pages/Register');
    renderPage(Register);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  // ─── API-dependent pages ───────────────────────────────

  it('Schedule renders weekly schedule', async () => {
    const { Schedule } = await import('../src/pages/Schedule');
    renderPage(Schedule);
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
  });

  it('DJs renders resident DJs', async () => {
    const { DJs } = await import('../src/pages/DJs');
    renderPage(DJs);
    expect(screen.getByText('Resident DJs')).toBeInTheDocument();
  });

  it('History renders track history', async () => {
    // Override nowPlaying mock to return data with song history so the page loads
    const apiMod = await import('../src/api/client');
    (apiMod.api as any).nowPlaying = () => Promise.resolve([{
      station: { id: 1, name: 'Test', shortcode: 't' },
      listeners: { total: 0, unique: 0, current: 0 },
      live: { is_live: false, streamer_name: '' },
      now_playing: {
        sh_id: 1, played_at: Date.now()/1000, duration: 300, elapsed: 60, remaining: 240,
        is_request: false,
        song: { id: '1', text: 'Test Song', artist: 'Test Artist', title: 'Test Song', album: 'Test', genre: 'Electronic', art: '' },
      },
      song_history: [{
        sh_id: 2, played_at: Date.now()/1000 - 300, duration: 240, is_request: false,
        song: { id: '2', text: 'Past Song', artist: 'Past Artist', title: 'Past Song', album: 'Past', genre: 'Electronic', art: '' },
      }],
    }]);
    const { History } = await import('../src/pages/History');
    renderPage(History);
    // Wait for the now-playing indicator to appear (shows data loaded)
    const el = await screen.findByText('LIVE');
    expect(el).toBeInTheDocument();
  });

  it('Listen renders listen page', async () => {
    const { Listen } = await import('../src/pages/Listen');
    renderPage(Listen);
    expect(screen.getByText('Now Streaming')).toBeInTheDocument();
  });

  it('Contact renders contact form', async () => {
    const { Contact } = await import('../src/pages/Contact');
    renderPage(Contact);
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('Chat renders listener chat', async () => {
    // jsdom doesn't implement scrollTo — mock it
    Element.prototype.scrollTo = vi.fn();
    const { Chat } = await import('../src/pages/Chat');
    renderPage(Chat);
    expect(screen.getByText('Listener Chat & Requests')).toBeInTheDocument();
  });

  it('Submit renders Become a DJ page', async () => {
    const { Submit } = await import('../src/pages/Submit');
    renderPage(Submit);
    expect(screen.getByText('Become a DJ')).toBeInTheDocument();
  });

  // ─── Authenticated dashboards ──────────────────────────
  // These need an authenticated user to render fully, but we
  // can test that they render while loading (before auth redirect)

  it('DjDashboard renders loading state', async () => {
    const { DjDashboard } = await import('../src/pages/DjDashboard');
    renderPage(DjDashboard);
    // Renders with empty data (no matching shows for anonymous user)
    expect(screen.getByText('DJ Dashboard')).toBeInTheDocument();
  });

  it('ManagerDashboard renders loading state', async () => {
    const { ManagerDashboard } = await import('../src/pages/ManagerDashboard');
    renderPage(ManagerDashboard);
    expect(screen.getByText('Station Manager')).toBeInTheDocument();
  });

  it('Admin renders station management tabs', async () => {
    const { Admin } = await import('../src/pages/Admin');
    renderPage(Admin);
    expect(screen.getByText('Station Management')).toBeInTheDocument();
  });

  // ─── Home page (needs extra props) ─────────────────────

  it('Home renders hero section', async () => {
    const { Home } = await import('../src/pages/Home');
    const audioRef = { current: null } as React.RefObject<HTMLAudioElement | null>;
    renderPage(Home, { playing: false, onTogglePlay: () => {}, audioRef });
    expect(screen.getByText(/PsyTech/)).toBeInTheDocument();
  });
});
