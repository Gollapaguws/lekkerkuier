import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

const DAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];
const GENRES = [
  'house', 'techno', 'hip_hop', 'rnb', 'jazz', 'lofi',
  'drum_and_bass', 'ambient', 'pop', 'latin', 'afrobeats', 'other',
];

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Register & Get Approved',
    icon: '📝',
    content: [
      'Create an account on Lekkerkuier (you\'re already here if you see this page).',
      'Submit your show proposal using the form below — tell us about your style, experience, and what makes your show unique.',
      'Our team reviews submissions weekly. Once approved, your account will be promoted to DJ role.',
      'You\'ll get access to the DJ Dashboard where you can manage your shows and find your streaming credentials.',
    ],
  },
  {
    step: 2,
    title: 'Get Your Gear Ready',
    icon: '🎛️',
    content: [
      '<strong>Broadcasting Software:</strong> Use any Icecast-compatible encoder. We recommend:',
      '• <strong>BUTT</strong> (Broadcast Using This Tool) — Free, simple, works on Windows/Mac/Linux',
      '• <strong>Mixxx</strong> — Free DJ software with built-in live broadcasting',
      '• <strong>OBS Studio</strong> — Free, powerful, supports audio-only streams',
      '• <strong>Nicecast / Audio Hijack</strong> — Mac-only, paid options',
      '<strong>Hardware (optional but recommended):</strong>',
      '• A decent microphone for voice breaks and shoutouts',
      '• Audio interface for clean sound (Focusrite Scarlett, Behringer UMC, etc.)',
      '• Headphones for monitoring your mix',
    ],
  },
  {
    step: 3,
    title: 'Configure Your Encoder',
    icon: '⚙️',
    content: [
      'Once your DJ account is approved, use these settings in your broadcasting software:',
    ],
    code: {
      label: 'Stream Connection Settings',
      lines: [
        'Server:   lekkerkuier.com',
        'Port:     8005',
        'Mount:    /',
        'Password: (your DJ password)',
        'Format:   MP3  /  AAC+',
        'Bitrate:  256 kbps (recommended)',
      ],
    },
  },
  {
    step: 4,
    title: 'Go Live!',
    icon: '🔴',
    content: [
      'Connect your encoder and start broadcasting. Your stream will automatically appear as LIVE on the Lekkerkuier homepage.',
      'The Now Playing section will show your DJ name and show title to all listeners.',
      'You can monitor your stream by listening at <strong>lekkerkuier.com</strong> — use headphones to avoid feedback!',
      '<strong>Pro tip:</strong> Do a test stream a few days before your first show to iron out any audio issues.',
    ],
  },
  {
    step: 5,
    title: 'Show Day Checklist',
    icon: '✅',
    content: [
      '🔊 Test your levels — aim for consistent volume without clipping',
      '🎤 Check your mic — do a quick voice test before going live',
      '📋 Prepare your playlist — have more tracks than you need',
      '💬 Open the Listener Chat — engage with your audience between mixes',
      '📱 Promote on social media — let your followers know you\'re live',
      '🎵 Respect copyright — only play music you have permission to broadcast',
    ],
  },
];

interface FormState {
  title: string;
  dj_name: string;
  day_of_week: string;
  genre: string;
  start_time: string;
  end_time: string;
  description: string;
  artwork_url: string;
}

const EMPTY: FormState = {
  title: '',
  dj_name: '',
  day_of_week: 'friday',
  genre: 'techno',
  start_time: '22:00',
  end_time: '23:00',
  description: '',
  artwork_url: '',
};

interface Result {
  ok: boolean;
  message: string;
  id?: string;
}

export function Submit() {
  const { state } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  // Pre-fill DJ name from authenticated user
  useEffect(() => {
    if (state.kind === 'authenticated' && state.user.full_name) {
      setForm((prev) => ({ ...prev, dj_name: state.user.full_name }));
    }
  }, [state]);

  const toggleStep = (step: number) => {
    setExpandedStep((prev) => (prev === step ? null : step));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const r = await fetch('/api/Show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (r.status === 201) {
        const body = await r.json();
        setResult({ ok: true, message: 'Submission received — operator will review.', id: body.id });
        setForm(EMPTY);
      } else if (r.status === 400) {
        const body = await r.json().catch(() => ({}));
        const details = Array.isArray(body.details) ? body.details.join(', ') : body.error || 'validation_failed';
        setResult({ ok: false, message: details });
      } else if (r.status === 429) {
        setResult({ ok: false, message: 'Too many submissions — please try again in an hour.' });
      } else {
        setResult({ ok: false, message: `Server error ${r.status}` });
      }
    } catch (err) {
      setResult({ ok: false, message: `Network error: ${(err as Error).message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading text-3xl md:text-4xl mb-3">Become a DJ</h1>
          <p className="text-[var(--lk-text-muted)] text-sm max-w-lg mx-auto">
            Want to host your own show on Lekkerkuier? Follow this guide to get started, then submit your application below.
          </p>
        </div>

        {/* Tutorial Steps */}
        <section className="mb-12 space-y-3">
          <h2 className="heading-sm text-lg mb-4 flex items-center gap-2">
            <span>📖</span> DJ Tutorial
          </h2>

          {TUTORIAL_STEPS.map(({ step, title, icon, content, code }) => {
            const isOpen = expandedStep === step;
            return (
              <div
                key={step}
                className="glass-card overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleStep(step)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--lk-primary)]/15 flex items-center justify-center text-sm font-bold text-[var(--lk-primary)]">
                    {step}
                  </span>
                  <span className="text-2xl">{icon}</span>
                  <span className="heading-sm text-sm flex-1">{title}</span>
                  <span className={`text-[var(--lk-text-muted)] text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-5 pl-[4.5rem] space-y-2">
                    {content.map((line, i) => (
                      <p
                        key={i}
                        className={`text-sm ${
                          line.startsWith('<strong>')
                            ? 'text-[var(--lk-primary)] font-semibold pt-2'
                            : 'text-[var(--lk-text-muted)]'
                        }`}
                        dangerouslySetInnerHTML={
                          line.includes('<strong>') ? { __html: line } : undefined
                        }
                      >
                        {line.includes('<strong>') ? undefined : line}
                      </p>
                    ))}

                    {code && (
                      <div className="mt-3 bg-black/30 rounded-lg p-4 font-mono text-xs space-y-0.5 border border-white/5">
                        <p className="text-[var(--lk-text-muted)] text-[10px] uppercase tracking-wider mb-2">
                          {code.label}
                        </p>
                        {code.lines.map((line, i) => {
                          const [key, ...val] = line.split(':');
                          return (
                            <p key={i} className="flex gap-2">
                              <span className="text-[var(--lk-text-muted)] w-20 flex-shrink-0">{key.trim()}:</span>
                              <span className="text-[var(--lk-primary)]">{val.join(':').trim()}</span>
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Submission Form */}
        <section>
          <h2 className="heading-sm text-lg mb-4 flex items-center gap-2">
            <span>🎤</span> Submit Your Application
          </h2>
          <p className="text-[var(--lk-text-muted)] text-sm mb-6">
            Tell us about your show. Our team reviews submissions weekly and merges approved entries into the live schedule.
          </p>

          <form onSubmit={submit} className="grid gap-3 glass-card p-6">
        <label className="text-xs uppercase text-muted">
          Title
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
          />
        </label>
        <label className="text-xs uppercase text-muted">
          DJ name
          <input
            required
            maxLength={100}
            value={form.dj_name}
            onChange={(e) => setForm({ ...form, dj_name: e.target.value })}
            className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs uppercase text-muted">
            Day
            <select
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
              className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="text-xs uppercase text-muted">
            Genre
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
            >
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs uppercase text-muted">
            Start
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
            />
          </label>
          <label className="text-xs uppercase text-muted">
            End
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
            />
          </label>
        </div>
        <label className="text-xs uppercase text-muted">
          Description
          <textarea
            maxLength={500}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
          />
        </label>
        <label className="text-xs uppercase text-muted">
          Artwork URL (https only)
          <input
            type="url"
            value={form.artwork_url}
            onChange={(e) => setForm({ ...form, artwork_url: e.target.value })}
            className="block w-full bg-white/5 rounded px-2 py-1 mt-1"
          />
        </label>
            <div className="flex gap-3 items-center mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-glow px-5 py-2 disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Submit Application'}
              </button>
              {result && (
                <span className={`text-sm ${result.ok ? 'text-[var(--lk-mint)]' : 'text-[var(--lk-accent)]'}`}>
                  {result.message}
                  {result.id && <span className="text-[var(--lk-text-muted)]"> · id: {result.id}</span>}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* FAQ teaser */}
        <p className="text-center text-xs text-[var(--lk-text-muted)] mt-10 pb-8">
          Have questions? Join the <a href="#/chat" className="text-[var(--lk-primary)] hover:underline">Listener Chat</a> or{' '}
          <a href="#/contact" className="text-[var(--lk-primary)] hover:underline">Contact Us</a>.
        </p>
      </div>
    </div>
  );
}
