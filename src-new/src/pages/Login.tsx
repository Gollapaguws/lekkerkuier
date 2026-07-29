import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function Login() {
  const { login, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  if (state.kind === 'authenticated') {
    nav(next, { replace: true });
    return null;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const r = await login(email, password);
    setSubmitting(false);
    if (r.ok) nav(next, { replace: true });
    else setError(r.error || 'Login failed');
  };

  return (
    <div className="h-full grid place-items-center px-6 overflow-y-auto">
      <form onSubmit={submit} className="glass p-8 w-full max-w-md space-y-5 animate-slide">
        <div className="text-center">
          <h1 className="heading text-2xl mb-1">Sign In</h1>
          <p className="text-sm text-[var(--lk-text-muted)]">
            Access your Lekkerkuier account
          </p>
        </div>

        <label className="block">
          <span className="text-xs uppercase text-[var(--lk-text-muted)] tracking-wider">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="block w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[var(--lk-text)] placeholder:text-[var(--lk-text-muted)] focus:outline-none focus:border-[var(--lk-primary)] transition-colors"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase text-[var(--lk-text-muted)] tracking-wider">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="block w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[var(--lk-text)] placeholder:text-[var(--lk-text-muted)] focus:outline-none focus:border-[var(--lk-primary)] transition-colors"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || state.kind === 'loading'}
          className="btn-glow w-full py-2.5 text-sm disabled:opacity-60"
        >
          {state.kind === 'loading' ? 'Connecting…' : submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {error && (
          <p className="text-sm text-center text-red-400 bg-red-400/5 border border-red-400/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="text-center text-xs text-[var(--lk-text-muted)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--lk-primary)] hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
