import { useEffect, useState } from 'react';
import { api, Show } from '../api/client';
import { ShowCard } from '../components/ShowCard';

const DAYS: Show['day_of_week'][] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

const DAY_LABELS: Record<string, string> = {
  sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};

export function Schedule() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.shows()
      .then((all) => { if (!cancelled) { setShows(all); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const grouped = DAYS.map((d) => ({
    day: d,
    label: DAY_LABELS[d],
    items: shows.filter((s) => s.day_of_week === d),
  }));

  // Find today
  const todayIndex = new Date().getDay(); // 0=Sun

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="heading text-2xl md:text-4xl mb-2">Weekly Schedule</h1>
        <p className="text-[var(--lk-text-muted)] text-sm mb-8">
          All times SAST. Schedule updates every Sunday.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="glass-sm p-4 animate-pulse">
                <div className="h-4 bg-[var(--lk-text-muted)]/20 rounded w-12 mb-3" />
                <div className="h-3 bg-[var(--lk-text-muted)]/10 rounded w-full mb-2" />
                <div className="h-3 bg-[var(--lk-text-muted)]/10 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass p-8 text-center">
            <p className="text-[var(--lk-accent)] mb-2">Could not load schedule</p>
            <p className="text-xs text-[var(--lk-text-muted)]">{error}</p>
          </div>
        ) : (
          <div className="schedule-grid stagger">
            {grouped.map(({ day, label, items }, idx) => (
              <div
                key={day}
                className={`glass-sm p-3 ${idx === todayIndex ? 'ring-1 ring-[var(--lk-primary)]' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="heading-sm text-sm capitalize">{label}</p>
                  {idx === todayIndex && (
                    <span className="text-[10px] text-[var(--lk-primary)]">TODAY</span>
                  )}
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-[var(--lk-text-muted)] italic">Open slot</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((s) => (
                      <li key={s.id}>
                        <ShowCard show={s} variant="schedule" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
