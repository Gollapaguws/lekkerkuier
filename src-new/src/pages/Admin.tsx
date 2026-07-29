import { useEffect, useState, useCallback } from 'react';
import { useAuth, type Role } from '../auth/AuthProvider';
import { api, Show } from '../api/client';

interface UserEntry {
  id: string; email: string; full_name: string; role: Role; created_at: string;
}
interface SiteSettings { stationName: string; tagline: string; description: string; }

const TABS = [
  { key: 'users', label: '👥 Users' },
  { key: 'schedule', label: '📅 Schedule' },
  { key: 'djs', label: '🎧 DJs' },
  { key: 'content', label: '📝 Content' },
  { key: 'stream', label: '🔴 Stream' },
] as const;
type Tab = typeof TABS[number]['key'];

export function Admin() {
  const { state, getToken: authToken } = useAuth();
  const user = state.kind === 'authenticated' ? state.user : null;
  const [tab, setTab] = useState<Tab>('users');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = useCallback((m: string, isError = false) => {
    if (isError) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(null); setError(null); }, 4000);
  }, []);

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto pb-24">
      <div className="animate-slide space-y-6">
        {/* Header */}
        <div>
          <h1 className="heading text-2xl md:text-3xl mb-2">Station Management</h1>
          {user && (
            <p className="text-sm text-[var(--lk-text-muted)]">
              Signed in as <span className="text-[var(--lk-text)]">{user.full_name}</span> ({user.role})
            </p>
          )}
        </div>

        {/* Flash messages */}
        {msg && <div className="bg-green-400/10 border border-green-400/30 rounded-lg px-4 py-3 text-sm text-green-400">{msg}</div>}
        {error && <div className="bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                tab === key
                  ? 'bg-[var(--lk-primary)]/20 text-[var(--lk-primary)]'
                  : 'bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'users' && <UsersTab token={authToken} user={user} flash={flash} />}
        {tab === 'schedule' && <ScheduleTab flash={flash} />}
        {tab === 'djs' && <DJsTab token={authToken} flash={flash} />}
        {tab === 'content' && <ContentTab token={authToken} flash={flash} />}
        {tab === 'stream' && <StreamTab token={authToken} flash={flash} />}
      </div>
    </div>
  );
}

/* ─── Users Tab ─────────────────────────────────── */
function UsersTab({ token, user, flash }: { token: () => string | null; user: { id: string } | null; flash: (m: string, e?: boolean) => void }) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const ROLE_OPTIONS: Role[] = ['listener', 'dj', 'manager', 'owner'];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token()}` } });
      if (r.ok) { const { users: list } = await r.json(); setUsers(list); }
      else { const b = await r.json().catch(() => ({})); flash(b.error || 'Failed to load users', true); }
    } catch { flash('Network error', true); }
    finally { setLoading(false); }
  };

  const promote = async (userId: string, role: Role) => {
    try {
      const r = await fetch('/api/auth/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ userId, role }),
      });
      const b = await r.json().catch(() => ({}));
      if (r.ok) { flash(`User updated to ${role}`); fetchUsers(); }
      else flash(b.error || 'Promotion failed', true);
    } catch { flash('Network error', true); }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <section className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-sm text-lg">User Management</h2>
        <button onClick={fetchUsers} disabled={loading} className="text-xs text-[var(--lk-primary)] hover:underline">
          {loading ? 'Loading…' : '🔄 Refresh'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[var(--lk-text-muted)]">
              <th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Role</th><th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-4 text-[var(--lk-text)]">{u.full_name}</td>
                <td className="py-3 pr-4 text-[var(--lk-text-muted)]">{u.email}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'owner' ? 'bg-[var(--lk-primary)]/20 text-[var(--lk-primary)]' :
                    u.role === 'manager' ? 'bg-[var(--lk-accent)]/20 text-[var(--lk-accent)]' :
                    u.role === 'dj' ? 'bg-[var(--lk-mint)]/20 text-[var(--lk-mint)]' :
                    'bg-white/10 text-[var(--lk-text-muted)]'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3">
                  {user && user.id !== u.id ? (
                    <select
                      value={u.role}
                      onChange={(e) => promote(u.id, e.target.value as Role)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-[var(--lk-text)] focus:outline-none focus:border-[var(--lk-primary)]"
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r} className="bg-[var(--lk-bg)]">{r}</option>)}
                    </select>
                  ) : <span className="text-xs text-[var(--lk-text-muted)]">You</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p className="text-sm text-[var(--lk-text-muted)] text-center py-8">No users yet. They'll appear after registration.</p>
        )}
      </div>
    </section>
  );
}

/* ─── Schedule Tab ─────────────────────────────────── */
function ScheduleTab({ flash }: { flash: (m: string, e?: boolean) => void }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shows().then(setShows).catch(() => flash('Could not load schedule', true)).finally(() => setLoading(false));
  }, []);

  const liveNow = shows.filter((s) => s.is_live).length;

  return (
    <section className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-sm text-lg">Schedule Overview</h2>
        <span className="text-xs text-[var(--lk-text-muted)]">{shows.length} shows · {liveNow} live</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
      ) : shows.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm text-[var(--lk-text-muted)] mb-2">No shows configured</p>
          <p className="text-xs text-[var(--lk-text-muted)]">
            Add shows via the <a href="https://admin.lekkerkuier.com" target="_blank" rel="noopener noreferrer" className="text-[var(--lk-primary)] hover:underline">station admin panel</a>.
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {shows.map((s, i) => (
            <div key={s.id || i} className="glass-sm px-3 py-2 flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.is_live ? '#4ad7c4' : 'var(--lk-text-muted)' }} />
              <span className="text-xs text-[var(--lk-text-muted)] w-20">{s.day_of_week} {s.start_time}</span>
              <span className="font-semibold flex-1">{s.title}</span>
              <span className="text-xs text-[var(--lk-text-muted)]">{s.dj_name}</span>
              <span className="text-xs text-[var(--lk-primary)]">{s.genre}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── DJs Tab ─────────────────────────────────── */
function DJsTab({ token: _token, flash: _flash }: { token: () => string | null; flash: (m: string, e?: boolean) => void }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shows().then(setShows).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const djMap = new Map<string, Show[]>();
  shows.forEach((s) => {
    if (s.dj_name) {
      const list = djMap.get(s.dj_name) || [];
      list.push(s);
      djMap.set(s.dj_name, list);
    }
  });
  const djs = [...djMap.entries()].map(([name, items]) => ({ name, shows: items.length, genres: [...new Set(items.map((s) => s.genre))] }));

  return (
    <section className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-sm text-lg">DJ Roster</h2>
        <span className="text-xs text-[var(--lk-text-muted)]">{djs.length} DJs from schedule</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
      ) : djs.length === 0 ? (
        <p className="text-sm text-[var(--lk-text-muted)] text-center py-8">No DJs in the schedule yet. Add shows with DJ names to populate this list.</p>
      ) : (
        <div className="space-y-1">
          {djs.map((dj) => (
            <div key={dj.name} className="glass-sm px-4 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lk-primary)] to-[var(--lk-accent)] flex items-center justify-center text-white font-bold text-lg">
                {dj.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{dj.name}</p>
                <p className="text-xs text-[var(--lk-text-muted)]">{dj.shows} show{dj.shows !== 1 ? 's' : ''} · {dj.genres.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                {dj.genres.slice(0, 2).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--lk-primary)]/10 text-[var(--lk-primary)]">{g}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Content Tab ─────────────────────────────────── */
function ContentTab({ token, flash }: { token: () => string | null; flash: (m: string, e?: boolean) => void }) {
  const [settings, setSettings] = useState<SiteSettings>({ stationName: '', tagline: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/site/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/site/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(settings),
      });
      if (r.ok) flash('✅ Settings saved');
      else flash('Failed to save', true);
    } catch { flash('Network error', true); }
    finally { setSaving(false); }
  };

  return (
    <section className="glass p-6">
      <h2 className="heading-sm text-lg mb-4">Site Content</h2>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase text-[var(--lk-text-muted)]">Station Name</span>
            <input
              value={settings.stationName}
              onChange={(e) => setSettings({ ...settings, stationName: e.target.value })}
              className="block w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm text-[var(--lk-text)] focus:outline-none focus:border-[var(--lk-primary)]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase text-[var(--lk-text-muted)]">Tagline</span>
            <input
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="block w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm text-[var(--lk-text)] focus:outline-none focus:border-[var(--lk-primary)]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase text-[var(--lk-text-muted)]">Description</span>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={3}
              className="block w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm text-[var(--lk-text)] focus:outline-none focus:border-[var(--lk-primary)]"
            />
          </label>
          <button onClick={save} disabled={saving} className="btn-glow px-6 py-2 text-sm">
            {saving ? 'Saving…' : '💾 Save Settings'}
          </button>
        </div>
      )}
    </section>
  );
}

/* ─── Stream Tab ─────────────────────────────────── */
function StreamTab({ token, flash }: { token: () => string | null; flash: (m: string, e?: boolean) => void }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [stats, setStats] = useState<{ listeners: number; live: boolean; streamer: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.nowPlaying().then((data) => {
      if (!cancelled && data.length > 0) {
        setStats({
          listeners: data[0].listeners?.total || 0,
          live: data[0].live?.is_live || false,
          streamer: data[0].live?.streamer_name || '',
        });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      const r = await fetch('/api/auth/disconnect-dj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      });
      const b = await r.json();
      flash(b.ok ? '✅ DJ disconnected' : `❌ ${b.message}`, !b.ok);
    } catch { flash('❌ Network error', true); }
    finally { setDisconnecting(false); }
  };

  return (
    <section className="glass p-6">
      <h2 className="heading-sm text-lg mb-4">Stream Controls</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl text-[var(--lk-text)]">{stats?.listeners ?? '—'}</p>
          <p className="text-xs text-[var(--lk-text-muted)] mt-1">Listeners</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className={`text-2xl ${stats?.live ? 'text-[var(--lk-mint)]' : 'text-[var(--lk-text-muted)]'}`}>
            {stats?.live ? '🔴 LIVE' : '⚫ Off'}
          </p>
          <p className="text-xs text-[var(--lk-text-muted)] mt-1">{stats?.streamer || 'AutoDJ'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl text-[var(--lk-text)]">256</p>
          <p className="text-xs text-[var(--lk-text-muted)] mt-1">kbps</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={disconnect}
          disabled={disconnecting}
          className="btn-glow px-4 py-2 text-sm disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }}
        >
          {disconnecting ? 'Disconnecting…' : '🔌 Disconnect DJ'}
        </button>
        <p className="text-xs text-[var(--lk-text-muted)]">
          Force-disconnects the current live DJ and returns to AutoDJ.
        </p>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <p className="text-xs uppercase text-[var(--lk-text-muted)] mb-2">Connection Info</p>
        <div className="font-mono text-xs space-y-0.5">
          <p>Server: <span className="text-[var(--lk-primary)]">lekkerkuier.com</span></p>
          <p>Port: <span className="text-[var(--lk-primary)]">8005</span></p>
          <p>Mount: <span className="text-[var(--lk-primary)]">/</span></p>
          <p>Format: <span className="text-[var(--lk-text-muted)]">MP3 / AAC+ · 256kbps</span></p>
        </div>
      </div>
    </section>
  );
}
