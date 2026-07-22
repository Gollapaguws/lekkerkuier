import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function Login() {
  const { login, state } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/admin';

  if (state.kind === 'authenticated') {
    nav(next, { replace: true });
    return null;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const r = await login(token);
    setSubmitting(false);
    if (r.ok) nav(next, { replace: true });
    else setError(r.error || 'unknown');
  };

  return (
    <div className="h-full grid place-items-center px-8">
      <form onSubmit={submit} className="glass-panel p-8 w-full max-w-md">
        <h1 className="heading-display text-2xl mb-2">Operator Sign-in</h1>
        <p className="text-muted text-sm mb-6">
          Sign in with your CALL_TOKEN to manage the schedule, review submissions, or upload mixes.
        </p>
        <label className="text-xs uppercase text-muted">
          Token
          <input
            required
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
          />
        </label>
        <button
          type="submit"
          disabled={submitting || state.kind === 'loading'}
          className="btn-glow mt-4 px-5 py-2 disabled:opacity-60"
        >
          {state.kind === 'loading' ? 'Connecting…' : submitting ? 'Sending…' : 'Sign in'}
        </button>
        {error && (
          <p className="mt-3 text-sm text-accent">Sign-in failed: {error}</p>
        )}
      </form>
    </div>
  );
}
