import { useEffect, useState } from 'react';
import { api, Show } from '../api/client';

interface DJProfile {
  name: string;
  show: string;
  genre: string;
  day: string;
  time: string;
  bio: string;
  color: string;
}

export function DJs() {
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    api.shows()
      .then((all) => setShows(all))
      .catch(() => setShows([]));
  }, []);

  // Build unique DJ list from shows
  const djs: DJProfile[] = shows.length > 0
    ? (() => {
        const seen = new Set<string>();
        return shows
          .filter((s) => {
            if (seen.has(s.dj_name)) return false;
            seen.add(s.dj_name);
            return true;
          })
          .map((s) => ({
            name: s.dj_name,
            show: s.title,
            genre: s.genre,
            day: s.day_of_week,
            time: `${s.start_time}–${s.end_time}`,
            bio: s.description || 'Resident DJ spinning the finest electronic frequencies.',
            color: ['#56d2ff', '#b388ff', '#ff7e29', '#d236ff', '#4ad7c4'][Math.floor(Math.random() * 5)],
          }));
      })()
    : [
        { name: 'DJ Solaris', show: 'Celestial Voyage', genre: 'psytrance', day: 'Friday', time: '22:00–00:00', bio: 'Resident selector bringing deep, driving psytrance to the airwaves.', color: '#56d2ff' },
        { name: 'Mx. Voltage', show: 'Industrial Complex', genre: 'industrial', day: 'Saturday', time: '20:00–23:00', bio: 'Dark, heavy industrial beats. No compromise.', color: '#ff1b3a' },
        { name: 'Luna Wave', show: 'Crystal Drift', genre: 'psytech', day: 'Sunday', time: '18:00–21:00', bio: 'Ethereal psytech and progressive journeys through sound.', color: '#d236ff' },
        { name: 'Psyphonix', show: 'Neon Vortex', genre: 'psytrance', day: 'Thursday', time: '21:00–23:00', bio: 'High-energy full-on psytrance. Prepare for takeoff.', color: '#ff7e29' },
        { name: 'Bass Cathedral', show: 'Subharmonic', genre: 'dub/techno', day: 'Wednesday', time: '20:00–22:00', bio: 'Deep bass explorations at the intersection of dub and techno.', color: '#4ad7c4' },
      ];

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="heading text-2xl md:text-4xl mb-2">Resident DJs</h1>
        <p className="text-[var(--lk-text-muted)] text-sm mb-8">
          The sonic architects behind the Lekker Kuier frequency.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {djs.map((dj) => (
            <div key={dj.name} className="glass p-5 hover:bg-[var(--lk-primary)]/5 transition-colors">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                style={{ background: `linear-gradient(135deg, ${dj.color}, transparent)` }}
              >
                {dj.name.charAt(0)}
              </div>

              <h3 className="heading-sm text-lg text-center">{dj.name}</h3>
              <p className="text-center text-[var(--lk-primary)] text-sm mt-1">{dj.show}</p>

              <div className="flex items-center justify-center gap-3 mt-3 text-xs text-[var(--lk-text-muted)]">
                <span className="px-2 py-0.5 rounded-full border border-[var(--lk-primary)]/20">{dj.genre}</span>
                <span>{dj.day} {dj.time}</span>
              </div>

              <p className="text-xs text-[var(--lk-text-muted)] mt-4 text-center leading-relaxed">
                {dj.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
