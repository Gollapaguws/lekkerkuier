import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { Skeleton } from '../components/Skeleton';
import { api, SongHistoryEntry } from '../api/client';

interface HistoryEntry {
  id: string;
  title: string;
  artist: string;
  playedAt: Date;
  duration: string;
  genre?: string;
  art?: string;
}

const GENRE_EMOJIS: Record<string, string> = {
  'Psytrance': '🌀', 'Progressive': '🔮', 'Darkpsy': '🌑',
  'PsyTech': '⚡', 'Industrial': '🏭', 'Techno': '🤖',
  'Psybient': '🌊', 'Full-On': '🔥', 'Trance': '✨',
  'Goa': '🕉️', 'Electronic': '🎛', 'Ambient': '🌙',
};

const GRADIENT_COLORS = [
  'from-purple-500/20 to-pink-500/10',
  'from-cyan-500/20 to-blue-500/10',
  'from-amber-500/20 to-orange-500/10',
  'from-emerald-500/20 to-teal-500/10',
  'from-rose-500/20 to-red-500/10',
  'from-indigo-500/20 to-violet-500/10',
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function mapEntry(entry: SongHistoryEntry): HistoryEntry {
  return {
    id: `sh-${entry.sh_id}`,
    title: entry.song.title || entry.song.text || 'Unknown Track',
    artist: entry.song.artist || 'Unknown Artist',
    playedAt: new Date(entry.played_at * 1000),
    duration: formatDuration(entry.duration),
    genre: entry.song.genre || undefined,
    art: entry.song.art || undefined,
  };
}

export function History() {
  const { t } = useI18n();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [nowPlaying, setNowPlaying] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const data = await api.nowPlaying();
        if (cancelled) return;
        const station = data?.[0];
        if (!station) return;

        // Current track
        if (station.now_playing?.song) {
          setNowPlaying({
            id: 'np',
            title: station.now_playing.song.title || station.now_playing.song.text || '—',
            artist: station.now_playing.song.artist || '—',
            playedAt: new Date(station.now_playing.played_at * 1000),
            duration: formatDuration(station.now_playing.duration),
            genre: station.now_playing.song.genre || undefined,
            art: station.now_playing.song.art || undefined,
          });
        }

        // History
        const entries = (station.song_history || []).map(mapEntry);
        setHistory(entries);
        setLoading(false);
        setError(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetch();
    const id = setInterval(fetch, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [retry]);

  const genres = [...new Set(history.map((h) => h.genre).filter(Boolean))] as string[];
  const filtered = filter ? history.filter((h) => h.genre === filter) : history;

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="text-center mb-8">
            <div className="h-10 w-64 bg-white/5 rounded animate-pulse mx-auto mb-4" />
            <div className="h-5 w-80 bg-white/5 rounded animate-pulse mx-auto" />
          </div>
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
            ))}
          </div>
          <Skeleton rows={6} variant="list" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📡</p>
          <p className="text-sm text-[var(--lk-text-muted)] mb-4">{t('general.error')}</p>
          <button onClick={() => { setLoading(true); setError(false); setRetry((r) => r + 1); }} className="btn-outline px-4 py-2 text-sm">
            {t('general.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-lg text-4xl md:text-5xl mb-4">
            <span className="text-[var(--lk-primary)]">Track</span> History
          </h1>
          <p className="text-[var(--lk-text-muted)] max-w-lg mx-auto text-lg">
            {history.length} recently played tracks
          </p>
        </div>

        {/* Genre filter chips */}
        {genres.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !filter
                  ? 'bg-[var(--lk-primary)] text-white shadow-lg shadow-[var(--lk-primary)]/25'
                  : 'bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10 hover:text-[var(--lk-text)]'
              }`}
            >
              {t('history.allTracks')}
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setFilter(filter === genre ? null : genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filter === genre
                    ? 'bg-[var(--lk-primary)] text-white'
                    : 'bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10 hover:text-[var(--lk-text)]'
                }`}
              >
                {GENRE_EMOJIS[genre] || '🎵'} {genre}
              </button>
            ))}
          </div>
        )}

        {/* Now playing indicator */}
        {nowPlaying && (
          <div className="glass-card p-5 mb-6 flex items-center gap-4">
            <div className="relative">
              {nowPlaying.art ? (
                <img src={nowPlaying.art} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <span className="text-3xl">🎧</span>
              )}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse border-2 border-[var(--lk-bg)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--lk-text-muted)] uppercase tracking-wider">{t('history.nowPlaying')}</p>
              <p className="heading-sm text-base text-[var(--lk-primary)]">
                {nowPlaying.title} — {nowPlaying.artist}
              </p>
            </div>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-400/15 text-green-400">{t('player.live')}</span>
          </div>
        )}

        {/* Track list */}
        <div className="space-y-2">
          {filtered.map((track, i) => (
            <div
              key={track.id}
              className="glass-card p-4 flex items-center gap-4 hover:border-[var(--lk-primary)]/20 transition-all group"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Album art */}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                {track.art ? (
                  <img src={track.art} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{GENRE_EMOJIS[track.genre || ''] || '🎵'}</span>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--lk-text)] truncate group-hover:text-[var(--lk-primary)] transition-colors">
                  {track.title}
                </p>
                <p className="text-xs text-[var(--lk-text-muted)] truncate">
                  {track.artist}
                  {track.genre && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <span className="opacity-40">·</span>
                      {GENRE_EMOJIS[track.genre]} {track.genre}
                    </span>
                  )}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs text-[var(--lk-text-muted)] tabular-nums hidden sm:inline">
                  {track.duration}
                </span>
                <span className="text-xs text-[var(--lk-text-muted)] w-14 text-right">
                  {timeAgo(track.playedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-sm text-[var(--lk-text-muted)]">No tracks found for this genre.</p>
          </div>
        )}
      </div>
    </div>
  );
}
