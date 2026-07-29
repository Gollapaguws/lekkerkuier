import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function Register() {
  const { register, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  if (state.kind === 'authenticated') {
    nav('/', { replace: true });
    return null;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    setError(null);
    const r = await register(email, password, fullName);
    setSubmitting(false);
    if (r.ok) nav('/', { replace: true });
    else setError(r.error || 'Registration failed');
  };

  return (
    <div className="h-full grid place-items-center px-6 overflow-y-auto">
      <form onSubmit={submit} className="glass p-8 w-full max-w-md space-y-5 animate-slide">
        <div className="text-center">
          <h1 className="heading text-2xl mb-1">Create Account</h1>
          <p className="text-sm text-[var(--lk-text-muted)]">
            Join the Lekkerkuier community as a listener
          </p>
        </div>

        <label className="block">
          <span className="text-xs uppercase text-[var(--lk-text-muted)] tracking-wider">Full Name</span>
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="block w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[var(--lk-text)] placeholder:text-[var(--lk-text-muted)] focus:outline-none focus:border-[var(--lk-primary)] transition-colors"
            placeholder="Your name or alias"
          />
        </label>

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
            autoComplete="new-password"
            minLength={6}
            className="block w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[var(--lk-text)] placeholder:text-[var(--lk-text-muted)] focus:outline-none focus:border-[var(--lk-primary)] transition-colors"
            placeholder="Min 6 characters"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || state.kind === 'loading'}
          className="btn-glow w-full py-2.5 text-sm disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        {error && (
          <p className="text-sm text-center text-red-400 bg-red-400/5 border border-red-400/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="text-center text-xs text-[var(--lk-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--lk-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
