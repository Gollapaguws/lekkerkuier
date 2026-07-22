import type { Show } from '../api/client';
import { ShowCard } from './ShowCard';

interface RecentlyPlayedProps {
  shows: Show[];
  className?: string;
}

const PLACEHOLDER_TRACKS = [
  { title: 'Solar Flares', dj: 'DJ Nova', time: '14:30' },
  { title: 'Subharmonic Depths', dj: 'Bass Cathedral', time: '12:45' },
  { title: 'Crystal Drift', dj: 'Luna Wave', time: '10:15' },
  { title: 'Neon Vortex', dj: 'Psyphonix', time: '08:00' },
  { title: 'Deep Space Transmission', dj: 'Orbit', time: '05:30' },
];

export function RecentlyPlayed({ shows, className = '' }: RecentlyPlayedProps) {
  const items = shows.length > 0 ? shows.slice(0, 8) : [];

  return (
    <section className={`${className} stagger`}>
      <h2 className="heading-sm text-lg mb-4">Recently Played</h2>

      <div className="track-scroll">
        {items.length > 0 ? (
          items.map((show) => (
            <ShowCard key={show.id} show={show} variant="featured" />
          ))
        ) : (
          PLACEHOLDER_TRACKS.map((t, i) => (
            <div key={i} className="glass-sm p-4 min-w-[200px]">
              <p className="font-semibold text-sm">{t.title}</p>
              <p className="text-xs text-[var(--lk-text-muted)] mt-1">{t.dj}</p>
              <p className="text-xs text-[var(--lk-primary)] mt-2">{t.time}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
