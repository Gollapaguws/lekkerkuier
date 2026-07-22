import { useEffect, useState } from 'react';
import { api, Show, PresignResult, LiveStreamStats } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

export function Admin() {
  const { state } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [stats, setStats] = useState<LiveStreamStats | null>(null);
  const [presign, setPresign] = useState<PresignResult | null>(null);
  const [presignErr, setPresignErr] = useState<string | null>(null);
  const [presigning, setPresigning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.shows()
      .then((s) => { if (!cancelled) setShows(s); })
      .catch(() => { if (!cancelled) setShows([]); });
    const tick = () => api.liveStats()
      .then((s) => { if (!cancelled) setStats(s); })
      .catch(() => { if (!cancelled) setStats(null); });
    tick();
    const id = setInterval(tick, 5_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const doPresign = async () => {
    setPresign(null);
    setPresignErr(null);
    setPresigning(true);
    try {
      const r = await api.presign({ filename: 'admin-test.mp3', contentType: 'audio/mpeg' });
      setPresign(r);
    } catch (e) {
      setPresignErr((e as Error).message);
    } finally {
      setPresigning(false);
    }
  };

  const user = state.kind === 'authenticated' ? state.user : null;

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <h1 className="heading-display text-2xl mb-2">Admin</h1>
      {user && (
        <p className="text-sm text-muted mb-4">
          Signed in as <span className="text-text">{user.full_name}</span> ({user.role})
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-4">
          <p className="text-xs uppercase text-muted">Live Stats</p>
          <p className="text-2xl mt-2">
            {stats?.viewer_count ?? '—'}{' '}
            <span className="text-sm text-muted">listeners</span>
          </p>
          <p className="text-xs text-muted mt-2">
            {stats?.server_name ?? '—'} · {stats?.bitrate ?? '—'} kbps
          </p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs uppercase text-muted">Shows</p>
          <p className="text-2xl mt-2">{shows.length}</p>
          <p className="text-xs text-muted mt-2">curated entries</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs uppercase text-muted">Presign (test)</p>
          <button
            type="button"
            onClick={doPresign}
            disabled={presigning}
            className="btn-glow px-4 py-1 mt-2 text-sm disabled:opacity-60"
          >
            {presigning ? 'Generating…' : 'Generate presigned URL'}
          </button>
          {presign && (
            <div className="mt-2 text-xs break-all">
              <p>key: <span className="text-primary">{presign.key}</span></p>
              <p>expires: <span className="text-muted">{presign.expiresAt}</span></p>
            </div>
          )}
          {presignErr && (
            <p className="mt-2 text-accent text-xs">Error: {presignErr}</p>
          )}
        </div>
      </div>
    </div>
  );
}
