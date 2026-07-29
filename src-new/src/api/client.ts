import type { User } from '../auth/AuthProvider';

export interface Show {
  id: string;
  title: string;
  dj_name: string;
  day_of_week:
    | 'sunday' | 'monday' | 'tuesday' | 'wednesday'
    | 'thursday' | 'friday' | 'saturday';
  genre: string;
  start_time: string;
  end_time: string;
  description?: string;
  artwork_url?: string;
  stream_url?: string;
  is_live?: boolean;
  created_date: string;
}

export interface NowPlayingSong {
  id: string;
  text: string;
  artist: string;
  title: string;
  album: string;
  genre: string;
  art: string;
}

export interface SongHistoryEntry {
  sh_id: number;
  played_at: number;
  duration: number;
  is_request: boolean;
  song: NowPlayingSong;
}

export interface NowPlayingData {
  station: { id: number; name: string; shortcode: string };
  listeners: { total: number; unique: number; current: number };
  live: { is_live: boolean; streamer_name: string };
  now_playing: {
    sh_id: number;
    played_at: number;
    duration: number;
    elapsed: number;
    remaining: number;
    is_request: boolean;
    song: NowPlayingSong;
  };
  playing_next?: {
    song: NowPlayingSong;
  };
  song_history: SongHistoryEntry[];
}

export interface LiveStreamStats {
  viewer_count: number;
  bitrate: number;
  server_name: string;
  listenurl: string;
  updated_date: string;
  error?: string;
}

export interface PresignResult {
  uploadUrl: string;
  key: string;
  expiresIn: number;
  expiresAt: string;
  headers: Record<string, string>;
  bucket: string;
  prefix: string;
}

const TOKEN_KEY = 'lekkerkuier-jwt';
function authHeader(): HeadersInit {
  try {
    const tok = localStorage.getItem(TOKEN_KEY);
    return tok ? { Authorization: `Bearer ${tok}` } : {};
  } catch {
    return {};
  }
}

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { ...authHeader() }, cache: 'no-store' });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`${url} → ${r.status}: ${txt.slice(0, 200)}`);
  }
  return r.json() as Promise<T>;
}

async function jpost<T>(url: string, body: unknown, withAuth = false): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(withAuth ? authHeader() : {}) },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`${url} → ${r.status}: ${txt.slice(0, 200)}`);
  }
  return r.json() as Promise<T>;
}

export const api = {
  shows: () => jget<Show[]>('/api/station/1/schedule'),
  liveStats: () => jget<LiveStreamStats>('/api/LiveStreamStats'),
  djs: () => jget<User[]>('/api/station/1/streamers'),
  submitShow: (
    payload: Omit<Show, 'id' | 'is_live' | 'created_date' | 'stream_url'>
  ) => jpost<Show>('/api/Show', payload, false),
  presign: (params: {
    filename: string;
    contentType?: string;
    prefix?: 'blobs/' | 'archives/';
  }) => jpost<PresignResult>('/api/uploads/presign', params, true),
  sendContact: (payload: { name: string; email: string; message: string }) =>
    jpost<{ ok: boolean }>('/api/contact', payload, false),
  sendChat: (payload: { name: string; message: string }) =>
    jpost<{ ok: boolean }>('/api/chat', payload, false),
  nowPlaying: () => jget<NowPlayingData[]>('/api/nowplaying'),
};
