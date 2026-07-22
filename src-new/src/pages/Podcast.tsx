import { useState, useCallback } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { useToast } from '../components/Toast';

interface Episode {
  id: string;
  showTitle: string;
  djName: string;
  episodeTitle: string;
  description: string;
  duration: string;
  date: string;
  category: string;
  plays: number;
  emoji: string;
}

const EPISODES: Episode[] = [
  {
    id: 'ep-001',
    showTitle: 'Midnight Frequencies',
    djName: 'DJ Solaris',
    episodeTitle: 'Episode 42 — Full Moon Transmission',
    description: 'A deep journey through progressive psytrance, featuring unreleased tracks from the Mzansi underground.',
    duration: '2:14:32',
    date: '2026-07-19',
    category: 'Psytrance',
    plays: 1847,
    emoji: '🌕',
  },
  {
    id: 'ep-002',
    showTitle: 'Industrial Overdrive',
    djName: 'Bass Cathedral',
    episodeTitle: 'Episode 28 — Steel & Static',
    description: 'Two hours of the hardest industrial beats. Warning: heavy distortion ahead.',
    duration: '1:58:15',
    date: '2026-07-18',
    category: 'Industrial',
    plays: 1234,
    emoji: '⚙️',
  },
  {
    id: 'ep-003',
    showTitle: 'Sunrise Sessions',
    djName: 'DJ Luna',
    episodeTitle: 'Episode 15 — Dawn Chorus Mix',
    description: 'Gentle psybient and downtempo to ease you into the morning. Perfect sunrise companion.',
    duration: '3:02:45',
    date: '2026-07-17',
    category: 'Psybient',
    plays: 956,
    emoji: '🌅',
  },
  {
    id: 'ep-004',
    showTitle: 'Dark Forest',
    djName: 'Nyx',
    episodeTitle: 'Episode 9 — Shadow Realm',
    description: 'Darkpsy and forest trance from the depths. Not for the faint of heart.',
    duration: '1:45:20',
    date: '2026-07-16',
    category: 'Darkpsy',
    plays: 2103,
    emoji: '🌲',
  },
  {
    id: 'ep-005',
    showTitle: 'Midnight Frequencies',
    djName: 'DJ Solaris',
    episodeTitle: 'Episode 41 — Stargate Sequence',
    description: 'A cosmic journey through galactic psytrance. Featuring a guest mix from special guest Vortex.',
    duration: '2:32:10',
    date: '2026-07-12',
    category: 'Psytrance',
    plays: 1567,
    emoji: '🌌',
  },
  {
    id: 'ep-006',
    showTitle: 'TechNoir',
    djName: 'Unit-7',
    episodeTitle: 'Episode 5 — Binary Pulse',
    description: 'Techno-industrial fusion at its finest. Dark rooms and strobe lights.',
    duration: '1:32:50',
    date: '2026-07-11',
    category: 'Techno',
    plays: 892,
    emoji: '🤖',
  },
];

const SHOWS = [
  { key: 'all', labelKey: 'podcast.allShows' },
  { key: 'Midnight Frequencies', label: 'Midnight Frequencies' },
  { key: 'Industrial Overdrive', label: 'Industrial Overdrive' },
  { key: 'Sunrise Sessions', label: 'Sunrise Sessions' },
  { key: 'Dark Forest', label: 'Dark Forest' },
  { key: 'TechNoir', label: 'TechNoir' },
];

interface PodcastProps {
  playing: boolean;
  onTogglePlay: () => void;
}

export function Podcast({ playing, onTogglePlay }: PodcastProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [show, setShow] = useState('all');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [activeEpisode, setActiveEpisode] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handlePlay = useCallback((id: string) => {
    if (activeEpisode === id && playing) {
      onTogglePlay();
      setActiveEpisode(null);
    } else {
      setActiveEpisode(id);
      if (!playing) onTogglePlay();
      toast('Now streaming — use the player controls at the bottom.', 'info');
    }
  }, [activeEpisode, playing, onTogglePlay]);

  const handleDownload = useCallback((id: string) => {
    setDownloading(id);
    toast('Downloads coming soon!', 'info');
    setTimeout(() => setDownloading(null), 2000);
  }, [toast]);

  const filtered = show === 'all'
    ? EPISODES
    : EPISODES.filter((ep) => ep.showTitle === show);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'popular') return b.plays - a.plays;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-lg text-4xl md:text-5xl mb-4">
            {t('podcast.title')}
          </h1>
          <p className="text-[var(--lk-text-muted)] max-w-xl mx-auto text-lg">
            {t('podcast.subtitle')}
          </p>
        </div>

        {/* Filters: show + sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {SHOWS.map(({ key, label, labelKey }) => (
              <button
                key={key}
                onClick={() => setShow(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  show === key
                    ? 'bg-[var(--lk-primary)] text-white'
                    : 'bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10 hover:text-[var(--lk-text)]'
                }`}
              >
                {labelKey ? t(labelKey) : label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSort('latest')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sort === 'latest'
                  ? 'bg-white/10 text-[var(--lk-text)]'
                  : 'text-[var(--lk-text-muted)] hover:text-[var(--lk-text)]'
              }`}
            >
              {t('podcast.latest')}
            </button>
            <button
              onClick={() => setSort('popular')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sort === 'popular'
                  ? 'bg-white/10 text-[var(--lk-text)]'
                  : 'text-[var(--lk-text-muted)] hover:text-[var(--lk-text)]'
              }`}
            >
              {t('podcast.popular')}
            </button>
          </div>
        </div>

        {/* Episode list */}
        <div className="space-y-4">
          {sorted.map((ep) => (
            <div
              key={ep.id}
              className="glass-card p-5 flex flex-col sm:flex-row gap-4 items-start group hover:border-[var(--lk-primary)]/20 transition-all"
            >
              {/* Play button / art */}
              <button
                onClick={() => handlePlay(ep.id)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  activeEpisode === ep.id && playing
                    ? 'bg-[var(--lk-primary)] text-[var(--lk-bg)] shadow-lg shadow-[var(--lk-primary)]/30'
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}
                aria-label={activeEpisode === ep.id && playing ? t('player.pause') : t('player.play')}
              >
                {activeEpisode === ep.id && playing ? '⏸' : ep.emoji}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--lk-primary)]/10 text-[var(--lk-primary)]">
                    {ep.category}
                  </span>
                  <span className="text-xs text-[var(--lk-text-muted)]">{ep.date}</span>
                </div>
                <h3 className="heading-sm text-base mb-1 truncate">{ep.episodeTitle}</h3>
                <p className="text-xs text-[var(--lk-text-muted)] mb-2">
                  {ep.showTitle} · {ep.djName}
                </p>
                <p className="text-sm text-[var(--lk-text-muted)] leading-relaxed line-clamp-2">
                  {ep.description}
                </p>
              </div>

              {/* Meta + actions */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                <span className="text-xs text-[var(--lk-text-muted)] tabular-nums">
                  {ep.duration}
                </span>
                <span className="text-xs text-[var(--lk-text-muted)]">
                  {ep.plays.toLocaleString()} plays
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlay(ep.id)}
                    className="text-xs px-3 py-1 rounded-full bg-[var(--lk-primary)]/10 text-[var(--lk-primary)] hover:bg-[var(--lk-primary)] hover:text-[var(--lk-bg)] transition-colors"
                  >
                    {activeEpisode === ep.id && playing ? '⏸' : '▶'} {t('podcast.listen')}
                  </button>
                  <button
                    onClick={() => handleDownload(ep.id)}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10 hover:text-[var(--lk-text)] transition-colors"
                  >
                    {downloading === ep.id ? '✓ Coming soon' : `↓ ${t('podcast.download')}`}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--lk-text-muted)] text-lg">{t('podcast.noEpisodes')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
