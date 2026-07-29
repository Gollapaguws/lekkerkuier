import { useEffect, useState, useCallback } from 'react';
import { api, NowPlayingData } from '../api/client';
import { Visualizer } from './Visualizer';

interface PlayerProps {
  playing: boolean;
  onTogglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function Player({ playing, onTogglePlay, audioRef }: PlayerProps) {
  const [stats, setStats] = useState<NowPlayingData | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => { /* autoplay blocked */ });
    } else {
      audio.pause();
    }
  }, [playing]);

  // Live stats polling — use nowPlaying since LiveStreamStats is inaccessible
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await api.nowPlaying();
        if (!cancelled && data.length > 0) setStats(data[0]);
      } catch { /* offline */ }
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const togglePlay = useCallback(() => {
    onTogglePlay();
  }, [onTogglePlay]);

  return (
    <footer className="player-bar px-4 py-2 flex items-center gap-3 text-xs">
      {/* Hidden audio element — src set once via ref to avoid reload-on-render */}
      <audio
        ref={(el) => {
          if (el && !el.src) el.src = `/autodj.mp3?t=${Date.now()}`;
          (audioRef as any).current = el;
        }}
        preload="none"
        crossOrigin="anonymous"
      />

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="btn-glow w-10 h-10 !rounded-full flex-shrink-0 text-base"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>

      {/* Mini visualizer */}
      <div className="hidden md:block w-24 h-10 flex-shrink-0">
        <Visualizer audioRef={audioRef} playing={playing} bars={32} height={40} />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--lk-text)] truncate">
          {stats?.station?.name || 'Lekker Kuier Psy Radio'}
        </p>
        <p className="text-[var(--lk-text-muted)] truncate">
          {stats ? `${stats.listeners.total} listeners · 192 kbps` : 'Connecting…'}
        </p>
      </div>

      {/* Volume */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setMuted(!muted)}
          className="text-[var(--lk-text-muted)] hover:text-[var(--lk-text)] w-6 text-center"
        >
          {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
          className="volume-slider w-20"
          aria-label="Volume"
        />
      </div>

      {/* Connection indicator */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stats ? 'bg-[var(--lk-mint)]' : 'bg-[var(--lk-accent)]'}`} />
    </footer>
  );
}
