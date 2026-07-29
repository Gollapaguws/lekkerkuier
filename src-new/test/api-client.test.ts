import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test api.client in isolation via mocked fetch.
// Since the module reads localStorage on import, we pre-set the mock first.

describe('API Client', () => {
  let api: typeof import('../src/api/client').api;

  beforeEach(async () => {
    vi.resetModules();
    // Reset localStorage
    window.localStorage.clear();
    // Default: mock fetch to return a 200 JSON response
    vi.stubGlobal('fetch', vi.fn());
    api = (await import('../src/api/client')).api;
  });

  // ─── authHeader behaviour (tested indirectly) ──────────

  it('sends Authorization header when token is stored', async () => {
    window.localStorage.setItem('lekkerkuier-jwt', 'test-token-123');
    // Re-import so authHeader picks up the token
    const mod = await import('../src/api/client');
    const api2 = mod.api;

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1', title: 'Test Show' }]),
      text: () => Promise.resolve(''),
    });

    await api2.shows();

    expect(fetch).toHaveBeenCalledWith('/api/station/1/schedule', {
      headers: { Authorization: 'Bearer test-token-123' },
      cache: 'no-store',
    });
  });

  it('does NOT send Authorization when no token', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1', title: 'Test Show' }]),
      text: () => Promise.resolve(''),
    });

    await api.shows();

    expect(fetch).toHaveBeenCalledWith('/api/station/1/schedule', {
      headers: {},
      cache: 'no-store',
    });
  });

  // ─── shows() ───────────────────────────────────────────

  it('api.shows returns an array of shows', async () => {
    const mockShows = [
      {
        id: '1', title: 'Midnight Frequencies', dj_name: 'DJ Solaris',
        day_of_week: 'friday', genre: 'Psytrance',
        start_time: '22:00', end_time: '00:00', created_date: '2026-01-01',
      },
    ];

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockShows),
      text: () => Promise.resolve(''),
    });

    const result = await api.shows();
    expect(result).toEqual(mockShows);
  });

  it('api.shows throws on non-ok response', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    });

    await expect(api.shows()).rejects.toThrow('/api/station/1/schedule → 500');
  });

  // ─── nowPlaying() ─────────────────────────────────────

  it('api.nowPlaying returns now playing data', async () => {
    const mockNP = [{
      station: { id: 1, name: 'Lekker Kuier', shortcode: 'lk' },
      listeners: { total: 42, unique: 10, current: 5 },
      live: { is_live: false, streamer_name: '' },
      now_playing: {
        sh_id: 1, played_at: 0, duration: 300, elapsed: 60, remaining: 240,
        is_request: false,
        song: { id: 's1', text: 'Test', artist: 'Tester', title: 'Test Song', album: 'Test', genre: 'Test', art: '' },
      },
      song_history: [],
    }];

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockNP),
      text: () => Promise.resolve(''),
    });

    const result = await api.nowPlaying();
    expect(result).toEqual(mockNP);
  });

  // ─── sendContact() ─────────────────────────────────────

  it('api.sendContact sends POST with correct body', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
      text: () => Promise.resolve(''),
    });

    const result = await api.sendContact({
      name: 'Alice', email: 'a@b.com', message: 'Hi',
    });

    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'a@b.com', message: 'Hi' }),
    });
  });

  // ─── sendChat() ───────────────────────────────────────

  it('api.sendChat sends POST with correct body', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
      text: () => Promise.resolve(''),
    });

    const result = await api.sendChat({ name: 'Bob', message: 'Hello' });
    expect(result).toEqual({ ok: true });
  });

  // ─── liveStats() ──────────────────────────────────────

  it('api.liveStats returns stream stats', async () => {
    const stats = { viewer_count: 10, bitrate: 256, server_name: 'lk', listenurl: '/', updated_date: '' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(stats),
      text: () => Promise.resolve(''),
    });

    const result = await api.liveStats();
    expect(result).toEqual(stats);
  });
});
