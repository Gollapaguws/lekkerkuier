import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Show } from '../api/client';

export function Listen() {
  const [nowPlaying, setNowPlaying] = useState<Show | null>(null);
  useEffect(() => {
    let cancelled = false;
    api.shows()
      .then((all) => {
        if (cancelled) return;
        const live = all.find((s) => s.is_live);
        setNowPlaying(live || all[0] || null);
      })
      .catch(() => { if (!cancelled) setNowPlaying(null); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="h-full grid grid-rows-[1fr_auto_auto] px-8 py-6 gap-4">
      <section className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
        <div className="text-right">
          <p className="text-muted text-xs uppercase tracking-widest">Now Streaming</p>
          <p className="heading-display text-2xl">{nowPlaying?.dj_name ?? 'DJ Solaris'}</p>
          <p className="text-text text-sm">{nowPlaying?.title ?? 'Celestial Voyage'}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const audio = document.getElementById('lekk-audio') as HTMLAudioElement | null;
            audio?.play();
          }}
          className="listen-btn"
          aria-label="Listen live"
        >
          <span className="relative z-10 heading-display text-bg text-3xl">▶</span>
        </button>
        <div>
          <p className="text-muted text-xs uppercase tracking-widest">Transcend the Vibration</p>
          <p className="text-sm leading-snug">
            Lekkerkuier streams 24/7 psytrance, industrial, and crystalline soundscapes.
            Plug in, lean back, let the bass carry you.
          </p>
          <div className="flex gap-3 mt-3 text-xs">
            <Link to="/schedule" className="btn-glow px-3 py-1">Schedule</Link>
            <Link to="/submit" className="glass-panel px-3 py-1">Become a DJ</Link>
          </div>
        </div>
      </section>
      <UpcomingStrip />
      <FeaturedMixesStrip />
    </div>
  );
}

function UpcomingStrip() {
  const [items, setItems] = useState<Show[]>([]);
  useEffect(() => {
    let cancelled = false;
    api.shows()
      .then((s) => { if (!cancelled) setItems(s.slice(0, 3)); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);
  if (items.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass-panel px-3 py-2 text-xs text-muted">
            Upcoming slot {n}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((s) => (
        <div key={s.id} className="glass-panel px-3 py-2">
          <p className="text-xs text-muted uppercase">{s.day_of_week} {s.start_time}–{s.end_time}</p>
          <p className="font-semibold text-sm">{s.title}</p>
          <p className="text-xs text-text">{s.dj_name} · {s.genre}</p>
        </div>
      ))}
    </div>
  );
}

function FeaturedMixesStrip() {
  // Placeholders — in production these come from a /api/uploads/list or
  // shows[*].artwork_url feed.
  const items = [
    { id: 'mix-1', title: 'Solar Flares', tag: 'psy' },
    { id: 'mix-2', title: 'Subharmonic', tag: 'industrial' },
    { id: 'mix-3', title: 'Crystal Drift', tag: 'psytech' },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 text-xs">
      {items.map((m) => (
        <div key={m.id} className="glass-panel px-3 py-2 cursor-pointer hover:bg-primary/10">
          <p className="font-semibold">{m.title}</p>
          <p className="text-muted">{m.tag}</p>
        </div>
      ))}
    </div>
  );
}
