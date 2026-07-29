import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { NowPlaying } from '../components/NowPlaying';
import { RecentlyPlayed } from '../components/RecentlyPlayed';
import { ShowCard } from '../components/ShowCard';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { useI18n } from '../i18n/I18nProvider';
import { api, Show, NowPlayingData } from '../api/client';

interface HomeProps {
  playing: boolean;
  onTogglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function Home({ playing, onTogglePlay, audioRef }: HomeProps) {
  const { t } = useI18n();
  const [stats, setStats] = useState<NowPlayingData | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [currentShow, setCurrentShow] = useState<Show | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Live stats — use nowPlaying since LiveStreamStats is inaccessible
    const tick = async () => {
      try {
        const data = await api.nowPlaying();
        if (!cancelled && data.length > 0) setStats(data[0]);
      } catch { /* offline */ }
    };
    tick();
    const statsId = setInterval(tick, 8000);

    // Shows
    api.shows()
      .then((all) => {
        if (cancelled) return;
        setShows(all);
        const live = all.find((s) => s.is_live);
        setCurrentShow(live || all[0] || null);
      })
      .catch(() => {});

    return () => { cancelled = true; clearInterval(statsId); };
  }, []);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      {/* Hero */}
      <Hero
        playing={playing}
        onTogglePlay={onTogglePlay}
        stationName="Lekker Kuier"
        tagline={t('home.tagline') + ' • 24/7'}
      />

      {/* Audio Visualizer */}
      <AudioVisualizer playing={playing} audioRef={audioRef} />

      {/* Content sections */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24 space-y-10">
        {/* Now Playing */}
        <NowPlaying stats={stats} currentShow={currentShow} playing={playing} />

        {/* Featured Shows */}
        <section className="stagger">
          <h2 className="heading-sm text-lg mb-4">{t('home.featuredShows')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.slice(0, 3).map((show) => (
              <ShowCard key={show.id} show={show} variant="featured" />
            ))}
            {shows.length === 0 && (
              <>
                {[
                  { title: 'Solar Flares', dj: 'DJ Nova', genre: 'psytrance', day: 'friday', start: '22:00', end: '00:00' },
                  { title: 'Industrial Complex', dj: 'Mx. Voltage', genre: 'industrial', day: 'saturday', start: '20:00', end: '23:00' },
                  { title: 'Crystal Waves', dj: 'Luna Wave', genre: 'psytech', day: 'sunday', start: '18:00', end: '21:00' },
                ].map((s, i) => (
                  <div key={i} className="glass p-4">
                    <span className="text-xs text-[var(--lk-text-muted)] uppercase">{s.day} {s.start}–{s.end}</span>
                    <p className="heading-sm text-base mt-1">{s.title}</p>
                    <p className="text-sm text-[var(--lk-text-muted)]">{s.dj} · {s.genre}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Recently Played */}
        <RecentlyPlayed shows={shows} />

        {/* CTA Banner */}
        <section className="glass p-8 text-center stagger">
          <h2 className="heading text-2xl md:text-3xl mb-3">{t('home.submitYourShow')}</h2>
          <p className="text-[var(--lk-text-muted)] max-w-md mx-auto mb-6 text-sm">
            Transcend the vibration. Plug into Mzansi's 24/7 stream.
          </p>
          <a href="#/submit" className="btn-glow px-8 py-3 inline-flex text-sm">
            {t('home.submitYourShow')}
          </a>
        </section>
      </div>
    </div>
  );
}
