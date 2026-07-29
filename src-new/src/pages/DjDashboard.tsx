import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { api, Show } from '../api/client';

export function DjDashboard() {
  const { state } = useAuth();
  const user = state.kind === 'authenticated' ? state.user : null;
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    api.shows().then(setShows).catch(() => {});
  }, []);

  const myShows = shows.filter((s) => 
    user && s.dj_name.toLowerCase() === user.full_name.toLowerCase()
  );
  const nextShow = myShows.length > 0 ? myShows[0] : null;

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <div className="animate-slide space-y-8">
        <div>
          <h1 className="heading text-2xl md:text-3xl mb-2">DJ Dashboard</h1>
          {user && (
            <p className="text-sm text-[var(--lk-text-muted)]">
              Welcome back, <span className="text-[var(--lk-text)]">{user.full_name}</span>
            </p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass p-4">
            <p className="text-xs uppercase text-[var(--lk-text-muted)]">My Shows</p>
            <p className="text-2xl mt-2 text-[var(--lk-text)]">{myShows.length || '—'}</p>
            <p className="text-xs text-[var(--lk-text-muted)] mt-1">
              {nextShow ? `${nextShow.day_of_week} ${nextShow.start_time}` : 'No shows assigned'}
            </p>
          </div>
          <div className="glass p-4">
            <p className="text-xs uppercase text-[var(--lk-text-muted)]">Stream Key</p>
            <div className="mt-2 font-mono text-xs space-y-0.5">
              <p>Server: <span className="text-[var(--lk-primary)]">lekkerkuier.com</span></p>
              <p>Port: <span className="text-[var(--lk-primary)]">8005</span></p>
              <p>Mount: <span className="text-[var(--lk-primary)]">/</span></p>
            </div>
            <p className="text-[10px] text-[var(--lk-text-muted)] mt-2">Password available in your DJ Profile</p>
          </div>
          <div className="glass p-4">
            <p className="text-xs uppercase text-[var(--lk-text-muted)]">Uploads</p>
            <p className="text-lg mt-2 text-[var(--lk-text)]">0</p>
            <p className="text-xs text-[var(--lk-text-muted)] mt-1">No mixes uploaded</p>
          </div>
        </div>

        {/* My Shows */}
        {myShows.length > 0 && (
          <section className="glass p-6">
            <h2 className="heading-sm text-lg mb-2">My Shows</h2>
            <div className="space-y-1">
              {myShows.map((s, i) => (
                <div key={i} className="glass-sm px-3 py-2 flex items-center gap-3 text-sm">
                  <span className="text-xs text-[var(--lk-text-muted)] w-20">{s.day_of_week} {s.start_time}</span>
                  <span className="font-semibold">{s.title}</span>
                  <span className="text-xs text-[var(--lk-primary)] ml-auto">{s.genre}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upload Section */}
        <section className="glass p-6">
          <h2 className="heading-sm text-lg mb-2">Upload Mix</h2>
          <p className="text-sm text-[var(--lk-text-muted)] mb-4">
            Upload pre-recorded mixes for on-demand playback or scheduled airtime.
          </p>
          <label className="btn-outline px-6 py-2 text-sm cursor-pointer inline-flex items-center gap-2">
            📁 Choose file
            <input type="file" accept="audio/*" className="hidden" disabled />
          </label>
          <p className="text-xs text-[var(--lk-text-muted)] mt-2">
            File upload will be available once station manager approves your DJ account.
          </p>
        </section>

        {/* Streaming Guide */}
        <section className="glass p-6">
          <h2 className="heading-sm text-lg mb-2">Go Live</h2>
          <p className="text-sm text-[var(--lk-text-muted)] mb-3">
            To start a live stream, connect your broadcasting software (OBS, BUTT, Mixxx, etc.) to:
          </p>
          <div className="bg-white/5 rounded-lg p-4 font-mono text-xs text-[var(--lk-text)] space-y-1">
            <p>Server: <span className="text-[var(--lk-primary)]">lekkerkuier.com</span></p>
            <p>Port: <span className="text-[var(--lk-primary)]">8005</span></p>
            <p>Mount: <span className="text-[var(--lk-primary)]">/</span></p>
            <p>Password: <span className="text-[var(--lk-text-muted)]">(your DJ password)</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
