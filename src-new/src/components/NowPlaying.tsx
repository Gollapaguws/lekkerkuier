import { LiveStreamStats, Show } from '../api/client';

interface NowPlayingProps {
  stats: LiveStreamStats | null;
  currentShow: Show | null;
  playing: boolean;
  className?: string;
}

export function NowPlaying({ stats, currentShow, playing, className = '' }: NowPlayingProps) {
  return (
    <section className={`${className} stagger`}>
      <h2 className="heading-sm text-lg mb-4 text-center md:text-left">Now Playing</h2>

      <div className="glass p-6 grid md:grid-cols-[auto_1fr] gap-6 items-center">
        {/* Album art placeholder */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-[var(--lk-primary)] to-[var(--lk-accent)] flex items-center justify-center mx-auto md:mx-0 animate-glow">
          <span className="heading text-4xl md:text-5xl text-[var(--lk-bg)] opacity-80">
            {playing ? '♪' : '◼'}
          </span>
        </div>

        {/* Track info */}
        <div className="text-center md:text-left">
          <p className="heading-sm text-xl md:text-2xl">
            {currentShow?.title || 'Celestial Voyage'}
          </p>
          <p className="text-[var(--lk-primary)] text-sm mt-1">
            {currentShow?.dj_name || 'DJ Solaris'}
          </p>
          {currentShow?.genre && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs border border-[var(--lk-primary)]/30 text-[var(--lk-primary)]">
              {currentShow.genre}
            </span>
          )}

          {/* Live stats */}
          <div className="flex items-center gap-4 mt-4 justify-center md:justify-start text-xs text-[var(--lk-text-muted)]">
            <span>
              <span className="w-2 h-2 inline-block rounded-full bg-[var(--lk-mint)] mr-1" />
              {stats?.viewer_count ?? '—'} listeners
            </span>
            <span>{stats?.bitrate ?? '—'} kbps</span>
            <span>{stats?.server_name ?? 'Lekkerkuier'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
