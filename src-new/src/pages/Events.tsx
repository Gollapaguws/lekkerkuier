import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n/I18nProvider';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(targetDate: Date): Countdown | null {
  const calc = useCallback((): Countdown | null => {
    const now = Date.now();
    const diff = targetDate.getTime() - now;
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [cd, setCd] = useState<Countdown | null>(calc);

  useEffect(() => {
    const id = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return cd;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  dj: string;
  genre: string;
  description: string;
  image: string;
  featured: boolean;
}

const EVENTS: Event[] = [
  {
    id: 'cosmic-dawn',
    title: 'Cosmic Dawn Festival Set',
    date: new Date('2026-08-15T20:00:00+02:00'),
    dj: 'DJ Solaris',
    genre: 'Psytrance / Progressive',
    description: 'A 4-hour journey through the cosmos. DJ Solaris brings her signature blend of deep progressive psytrance and ethereal melodies. Live visuals synced to the beat.',
    image: '🌅',
    featured: true,
  },
  {
    id: 'industrial-revolt',
    title: 'Industrial Revolt: Dark Techno Night',
    date: new Date('2026-07-30T22:00:00+02:00'),
    dj: 'BassCathedral',
    genre: 'Dark Techno / Industrial',
    description: 'Two hours of relentless dark techno and industrial beats. Industrial-strength bass. Ear protection recommended (seriously).',
    image: '🏭',
    featured: true,
  },
  {
    id: 'chill-vortex',
    title: 'Chill Vortex Sunday',
    date: new Date('2026-08-03T14:00:00+02:00'),
    dj: 'Aurora Flux',
    genre: 'Ambient / Downtempo',
    description: 'Wind down your weekend with two hours of ambient textures, downtempo grooves, and ethereal soundscapes. Perfect for a lazy Sunday.',
    image: '🌊',
    featured: false,
  },
  {
    id: 'bass-cathedral-monthly',
    title: 'Bass Cathedral Monthly',
    date: new Date('2026-08-22T21:00:00+02:00'),
    dj: 'BassCathedral b2b Shadow_Byte',
    genre: 'Hard Techno / Industrial',
    description: 'The monthly Bass Cathedral takeover. Back-to-back with special guest Shadow_Byte. Three hours of punishing kicks and distorted basslines.',
    image: '⛪',
    featured: false,
  },
  {
    id: 'psy-sunrise',
    title: 'Psy-Sunrise Yoga Flow',
    date: new Date('2026-08-10T06:00:00+02:00'),
    dj: 'DJ Solaris',
    genre: 'Psybient / Chillgressive',
    description: 'Start your day right. One hour of psybient and chillgressive beats curated for morning yoga, meditation, or just staring at the ceiling.',
    image: '🧘',
    featured: false,
  },
  {
    id: 'midnight-circuit',
    title: 'Midnight Circuit',
    date: new Date('2026-08-29T00:00:00+02:00'),
    dj: 'Phantom Current',
    genre: 'Cyberpunk / Synthwave / Dark Electro',
    description: 'A neon-drenched midnight broadcast. Synthwave, dark electro, and cyberpunk soundtracks for the insomniacs and night riders.',
    image: '🌃',
    featured: false,
  },
];

function FeaturedEventCard({ event }: { event: Event }) {
  const cd = useCountdown(event.date);

  return (
    <div className="glass p-6 md:p-8 relative overflow-hidden group hover:border-[var(--lk-primary)]/40 transition-all">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--lk-accent)]/10 blur-3xl group-hover:bg-[var(--lk-accent)]/20 transition-colors" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-4xl mb-2 block">{event.image}</span>
            <h3 className="heading-sm text-lg">{event.title}</h3>
            <p className="text-sm text-[var(--lk-primary)] mt-1">
              {event.date.toLocaleDateString('en-ZA', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--lk-text-muted)] leading-relaxed">{event.description}</p>

        <div className="flex items-center gap-3 pt-2">
          <span className="glass-sm px-3 py-1 text-xs text-[var(--lk-primary)]">{event.genre}</span>
          <span className="text-xs text-[var(--lk-text-muted)]">by {event.dj}</span>
        </div>

        {cd ? (
          <CountdownDisplay cd={cd} />
        ) : (
          <p className="text-sm text-[var(--lk-accent)] font-medium">Live now!</p>
        )}
      </div>
    </div>
  );
}

function CountdownDisplay({ cd }: { cd: Countdown }) {
  const { t } = useI18n();
  const units: [string, number][] = [
    [t('events.days'), cd.days],
    [t('events.hours'), cd.hours],
    [t('events.mins'), cd.minutes],
    [t('events.secs'), cd.seconds],
  ];
  return (
    <div className="flex gap-3 md:gap-4">
      {units.map(([label, value]) => (
        <div key={label} className="glass-sm px-3 py-2 md:px-4 md:py-3 text-center min-w-[60px] md:min-w-[72px]">
          <p className="heading text-xl md:text-2xl text-gradient">{String(value).padStart(2, '0')}</p>
          <p className="text-[10px] md:text-xs text-[var(--lk-text-muted)] uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function Events() {
  const { t } = useI18n();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = [...new Set(EVENTS.map((e) => e.genre))];
  const filtered = selectedGenre ? EVENTS.filter((e) => e.genre === selectedGenre) : EVENTS;

  const featured = EVENTS.filter((e) => e.featured && e.date > new Date());
  const upcoming = filtered.filter((e) => e.date > new Date()).sort((a, b) => a.date.getTime() - b.date.getTime());
  const past = filtered.filter((e) => e.date <= new Date()).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-16">

        {/* Header */}
        <section className="text-center space-y-4 animate-slide">
          <h1 className="heading text-4xl md:text-5xl">
            <span className="text-gradient">{t('events.title')}</span>
          </h1>
          <p className="text-[var(--lk-text-muted)] text-lg max-w-xl mx-auto">
            Mark your calendar. Live sets, takeovers, and special broadcasts — only on Lekkerkuier.
          </p>
        </section>

        {/* Featured events with countdown */}
        {featured.length > 0 && (
          <section className="space-y-6">
            <h2 className="heading text-xl md:text-2xl">🔥 Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((event) => (
                <FeaturedEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Genre filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              !selectedGenre
                ? 'bg-[var(--lk-primary)]/15 text-[var(--lk-primary)] border border-[var(--lk-primary)]/30'
                : 'glass-sm text-[var(--lk-text-muted)] hover:text-[var(--lk-text)]'
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                selectedGenre === genre
                  ? 'bg-[var(--lk-primary)]/15 text-[var(--lk-primary)] border border-[var(--lk-primary)]/30'
                  : 'glass-sm text-[var(--lk-text-muted)] hover:text-[var(--lk-text)]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Upcoming events */}
        {upcoming.length > 0 && (
          <section className="space-y-6">
            <h2 className="heading text-xl md:text-2xl">{t('events.upcoming')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {upcoming.map((event) => (
                <div key={event.id} className="glass-sm p-5 hover:border-[var(--lk-primary)]/30 transition-all hover:-translate-y-1">
                  <span className="text-3xl mb-2 block">{event.image}</span>
                  <h3 className="heading-sm text-sm mb-1">{event.title}</h3>
                  <p className="text-xs text-[var(--lk-primary)]">
                    {event.date.toLocaleDateString('en-ZA', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-[var(--lk-text-muted)] mt-2 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] glass-sm px-2 py-0.5 text-[var(--lk-primary)]">{event.genre.split(' / ')[0]}</span>
                    <span className="text-[10px] text-[var(--lk-text-muted)]">{event.dj}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past events */}
        {past.length > 0 && (
          <section className="space-y-6">
            <h2 className="heading text-xl md:text-2xl">{t('events.past')}</h2>
            <div className="space-y-3">
              {past.map((event) => (
                <div key={event.id} className="glass-sm p-4 flex items-center gap-4 hover:border-[var(--lk-primary)]/20 transition-all">
                  <span className="text-2xl flex-shrink-0">{event.image}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-sm text-sm">{event.title}</h3>
                    <p className="text-xs text-[var(--lk-text-muted)]">
                      {event.date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} — {event.dj}
                    </p>
                  </div>
                  <span className="text-[10px] glass-sm px-2 py-0.5 text-[var(--lk-text-muted)] flex-shrink-0">{event.genre.split(' / ')[0]}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {upcoming.length === 0 && past.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📻</p>
            <p className="heading-sm text-lg text-[var(--lk-text-muted)]">No events in this category</p>
            <p className="text-sm text-[var(--lk-text-muted)] mt-2">Check back soon or browse all events.</p>
          </div>
        )}

      </div>
    </div>
  );
}
