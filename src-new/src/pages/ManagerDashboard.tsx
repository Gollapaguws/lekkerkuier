import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { api, Show } from '../api/client';
import { ShowCard } from '../components/ShowCard';

function getToken(): string | null {
  try { return localStorage.getItem('lekkerkuier-jwt'); } catch { return null; }
}

export function ManagerDashboard() {
  const { state } = useAuth();
  const user = state.kind === 'authenticated' ? state.user : null;
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.shows()
      .then((data) => { if (!cancelled) { setShows(data); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const uniqueDjs = [...new Set(shows.map((s) => s.dj_name).filter(Boolean))];
  const liveNow = shows.filter((s) => s.is_live);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectMsg, setDisconnectMsg] = useState<string | null>(null);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    setDisconnectMsg(null);
    try {
      const token = getToken();
      const r = await fetch('/api/auth/disconnect-dj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await r.json();
      setDisconnectMsg(data.ok ? '✅ DJ disconnected' : `❌ ${data.message}`);
    } catch {
      setDisconnectMsg('❌ Network error');
    } finally {
      setDisconnecting(false);
      setTimeout(() => setDisconnectMsg(null), 4000);
    }
  }, []);

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <div className="animate-slide space-y-8">
        <div>
          <h1 className="heading text-2xl md:text-3xl mb-2">Station Manager</h1>
          {user && (
            <p className="text-sm text-[var(--lk-text-muted)]">
              Managing as <span className="text-[var(--lk-text)]">{user.full_name}</span>
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="btn-glow px-4 py-2 text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }}
          >
            {disconnecting ? 'Disconnecting…' : '🔌 Disconnect DJ'}
          </button>
          {disconnectMsg && (
            <span className={`text-sm self-center ${disconnectMsg.startsWith('✅') ? 'text-[var(--lk-mint)]' : 'text-[var(--lk-accent)]'}`}>
              {disconnectMsg}
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: 'DJs', value: uniqueDjs.length || '—' },
            { label: 'Shows', value: shows.length || '—' },
            { label: 'Live Now', value: liveNow.length },
            { label: 'Listeners', value: '—' },
          ].map((s) => (
            <div key={s.label} className="glass p-4 text-center">
              <p className="text-2xl text-[var(--lk-text)]">{s.value}</p>
              <p className="text-xs text-[var(--lk-text-muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Schedule Management */}
        <section className="glass p-6">
          <h2 className="heading-sm text-lg mb-2">Schedule</h2>
          <p className="text-sm text-[var(--lk-text-muted)] mb-4">
            Manage show schedules, assign DJs to time slots, and configure recurring shows.
          </p>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-[var(--lk-text-muted)]/10 rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-[var(--lk-accent)]">Could not load schedule data. Is the stream server running?</p>
          ) : shows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-sm text-[var(--lk-text-muted)] mb-2">No shows configured yet</p>
              <p className="text-xs text-[var(--lk-text-muted)]">
                Add shows in the{' '}
                <a
                  href="https://admin.lekkerkuier.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--lk-primary)] hover:underline"
                >
                  station admin panel
                </a>
                {' '}→ Manage → Schedule to populate this dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {shows.map((s, i) => (
                <ShowCard key={s.id || i} show={s} variant="compact" />
              ))}
            </div>
          )}
        </section>

        {/* DJ Management */}
        <section className="glass p-6">
          <h2 className="heading-sm text-lg mb-2">DJ Management</h2>
          <p className="text-sm text-[var(--lk-text-muted)] mb-4">
            Review DJ applications, approve accounts, and manage streaming permissions.
          </p>
          <p className="text-xs text-[var(--lk-text-muted)]">
            Use the <a href="#/admin" className="text-[var(--lk-primary)] hover:underline">Admin panel</a> for user role management.
          </p>
        </section>

        {/* Chat Moderation */}
        <section className="glass p-6">
          <h2 className="heading-sm text-lg mb-2">Chat Moderation</h2>
          <p className="text-sm text-[var(--lk-text-muted)]">
            Monitor and moderate listener chat. Remove offensive messages and manage timeouts.
          </p>
        </section>
      </div>
    </div>
  );
}
