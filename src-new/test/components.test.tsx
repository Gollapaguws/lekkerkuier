import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { Visualizer } from '../src/components/Visualizer';
import { NowPlaying } from '../src/components/NowPlaying';
import { Search } from '../src/components/Search';
import { ShowCard } from '../src/components/ShowCard';
import { InstallBanner } from '../src/components/InstallBanner';
import type { Show, NowPlayingData } from '../src/api/client';

// Mock i18n for Search component
vi.mock('../src/i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'en',
    setLang: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'search.placeholder': 'Search blog, events...',
        'search.noResults': 'No results for',
        'search.typeMore': 'Type at least 2 characters',
        'search.navigateHint': 'Press arrows to navigate',
      };
      return map[key] || key;
    },
  }),
  I18nProvider: ({ children }: any) => children,
}));

describe('MiniPlayer', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    })));
    document.body.innerHTML = '<footer></footer>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns null when footer is in view (not visible)', () => {
    const { container } = render(
      <MiniPlayer playing={false} onTogglePlay={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows play icon when not playing', () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal('IntersectionObserver', vi.fn((cb: any) => {
      callback = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }));

    render(<MiniPlayer playing={false} onTogglePlay={() => {}} />);
    act(() => callback([{ isIntersecting: false }]));

    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('shows pause icon when playing', () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal('IntersectionObserver', vi.fn((cb: any) => {
      callback = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }));

    render(<MiniPlayer playing={true} onTogglePlay={() => {}} />);
    act(() => callback([{ isIntersecting: false }]));

    expect(screen.getByText('⏸')).toBeInTheDocument();
  });

  it('calls onTogglePlay when clicked', async () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal('IntersectionObserver', vi.fn((cb: any) => {
      callback = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }));

    const onToggle = vi.fn();
    render(<MiniPlayer playing={false} onTogglePlay={onToggle} />);
    act(() => callback([{ isIntersecting: false }]));

    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('has play/pause aria-label', () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal('IntersectionObserver', vi.fn((cb: any) => {
      callback = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }));

    render(<MiniPlayer playing={true} onTogglePlay={() => {}} />);
    act(() => callback([{ isIntersecting: false }]));

    expect(screen.getByLabelText('Pause')).toBeInTheDocument();
  });
});

describe('Visualizer', () => {
  const audioRef = { current: null } as React.RefObject<HTMLAudioElement | null>;

  it('renders a canvas element', () => {
    const { container } = render(
      <Visualizer audioRef={audioRef} playing={false} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('applies custom height', () => {
    const { container } = render(
      <Visualizer audioRef={audioRef} playing={false} height={120} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas?.style.height).toBe('120px');
  });

  it('accepts custom bar count', () => {
    const { container } = render(
      <Visualizer audioRef={audioRef} playing={false} bars={32} />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('accepts className prop', () => {
    const { container } = render(
      <Visualizer audioRef={audioRef} playing={false} className="my-viz" />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas?.className).toContain('my-viz');
  });
});

describe('NowPlaying', () => {
  const mockShow: Show = {
    id: '1',
    title: 'Test Show',
    dj_name: 'DJ Test',
    day_of_week: 'friday',
    genre: 'psytrance',
    start_time: '22:00',
    end_time: '00:00',
    created_date: '2026-01-01',
    is_live: true,
  };

  const mockStats: NowPlayingData = {
    station: { id: 1, name: 'Lekker Kuier', shortcode: 'lk' },
    listeners: { total: 42, unique: 10, current: 5 },
    live: { is_live: true, streamer_name: 'DJ Test' },
    now_playing: {
      sh_id: 1, played_at: 0, duration: 300, elapsed: 60, remaining: 240,
      is_request: false,
      song: { id: 's1', text: 'Test', artist: 'Tester', title: 'Test Song', album: 'Test', genre: 'psytrance', art: '' },
    },
    song_history: [],
  };

  it('renders show title', () => {
    render(<NowPlaying stats={null} currentShow={mockShow} playing={true} />);
    expect(screen.getByText('Test Show')).toBeInTheDocument();
  });

  it('renders DJ name', () => {
    render(<NowPlaying stats={null} currentShow={mockShow} playing={true} />);
    expect(screen.getByText('DJ Test')).toBeInTheDocument();
  });

  it('renders genre badge when available', () => {
    render(<NowPlaying stats={null} currentShow={mockShow} playing={true} />);
    expect(screen.getByText('psytrance')).toBeInTheDocument();
  });

  it('shows fallback when no show', () => {
    render(<NowPlaying stats={null} currentShow={null} playing={false} />);
    expect(screen.getByText('Celestial Voyage')).toBeInTheDocument();
    expect(screen.getByText('DJ Solaris')).toBeInTheDocument();
  });

  it('shows listener count from stats', () => {
    render(<NowPlaying stats={mockStats} currentShow={mockShow} playing={true} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('shows music note when playing', () => {
    render(<NowPlaying stats={null} currentShow={mockShow} playing={true} />);
    expect(screen.getByText('♪')).toBeInTheDocument();
  });

  it('shows stop symbol when not playing', () => {
    render(<NowPlaying stats={null} currentShow={mockShow} playing={false} />);
    expect(screen.getByText('◼')).toBeInTheDocument();
  });
});

describe('Search', () => {
  function renderSearch(isOpen = true) {
    return render(
      <MemoryRouter>
        <Search isOpen={isOpen} onClose={vi.fn()} />
      </MemoryRouter>
    );
  }

  it('returns null when closed', () => {
    const { container } = renderSearch(false);
    expect(container.innerHTML).toBe('');
  });

  it('renders search input when open', () => {
    renderSearch(true);
    expect(screen.getByPlaceholderText('Search blog, events...')).toBeInTheDocument();
  });

  it('shows type-more hint for short queries', async () => {
    renderSearch(true);
    const input = screen.getByPlaceholderText('Search blog, events...');
    await userEvent.type(input, 'a');
    expect(screen.getByText(/at least 2/)).toBeInTheDocument();
  });

  it('shows no results for unknown query', async () => {
    renderSearch(true);
    const input = screen.getByPlaceholderText('Search blog, events...');
    await userEvent.type(input, 'zzznotfound');
    expect(screen.getByText(/No results/)).toBeInTheDocument();
  });

  it('finds results for matching query', async () => {
    renderSearch(true);
    const input = screen.getByPlaceholderText('Search blog, events...');
    await userEvent.type(input, 'Solaris');
    // Multiple results contain "DJ Solaris" — use getAllByText
    const matches = screen.getAllByText(/DJ Solaris/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
  it('calls onClose when clicking close button', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Search isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByLabelText('Close search'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Search isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search blog, events...');
    await userEvent.type(input, '{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ShowCard', () => {
  const mockShow: Show = {
    id: '1',
    title: 'Midnight Frequencies',
    dj_name: 'DJ Solaris',
    day_of_week: 'friday',
    genre: 'psytrance',
    start_time: '22:00',
    end_time: '00:00',
    description: 'Deep psytrance journey',
    created_date: '2026-01-01',
  };

  const liveShow: Show = { ...mockShow, is_live: true };

  it('renders schedule variant by default', () => {
    render(<ShowCard show={mockShow} />);
    expect(screen.getByText('Midnight Frequencies')).toBeInTheDocument();
    expect(screen.getByText('DJ Solaris')).toBeInTheDocument();
  });

  it('renders featured variant', () => {
    render(<ShowCard show={mockShow} variant="featured" />);
    expect(screen.getByText('Midnight Frequencies')).toBeInTheDocument();
    // "psytrance" appears in both genre tag and description — check count
    const matches = screen.getAllByText(/psytrance/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('renders compact variant', () => {
    render(<ShowCard show={mockShow} variant="compact" />);
    expect(screen.getByText('Midnight Frequencies')).toBeInTheDocument();
  });

  it('shows LIVE indicator for live shows', () => {
    render(<ShowCard show={liveShow} variant="schedule" />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('shows description for featured variant', () => {
    render(<ShowCard show={mockShow} variant="featured" />);
    expect(screen.getByText('Deep psytrance journey')).toBeInTheDocument();
  });

  it('shows time range in schedule variant', () => {
    render(<ShowCard show={mockShow} variant="schedule" />);
    expect(screen.getByText('22:00–00:00')).toBeInTheDocument();
  });
});

describe('InstallBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    // Mock matchMedia — used by InstallBanner to detect standalone mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('returns null when no install prompt event', () => {
    const { container } = render(<InstallBanner />);
    expect(container.innerHTML).toBe('');
  });

  it('shows banner when beforeinstallprompt fires', () => {
    render(<InstallBanner />);

    act(() => {
      const event = new Event('beforeinstallprompt') as any;
      event.preventDefault = vi.fn();
      event.prompt = vi.fn(() => Promise.resolve());
      event.userChoice = Promise.resolve({ outcome: 'dismissed' as const, platform: 'web' });
      window.dispatchEvent(event);
    });

    expect(screen.getByText('Install Lekkerkuier')).toBeInTheDocument();
  });

  it('hides banner after dismiss', async () => {
    render(<InstallBanner />);

    act(() => {
      const event = new Event('beforeinstallprompt') as any;
      event.preventDefault = vi.fn();
      event.prompt = vi.fn(() => Promise.resolve());
      event.userChoice = Promise.resolve({ outcome: 'dismissed' as const, platform: 'web' });
      window.dispatchEvent(event);
    });

    const dismissBtn = screen.getByLabelText('Dismiss');
    await userEvent.click(dismissBtn);

    expect(screen.queryByText('Install Lekkerkuier')).not.toBeInTheDocument();
  });

  it('does not re-show after dismiss (sessionStorage)', () => {
    sessionStorage.setItem('lk-pwa-dismissed', '1');
    const { container } = render(<InstallBanner />);
    expect(container.innerHTML).toBe('');
  });
});
