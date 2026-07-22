import { useState, FormEvent } from 'react';

const DAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];
const GENRES = [
  'house', 'techno', 'hip_hop', 'rnb', 'jazz', 'lofi',
  'drum_and_bass', 'ambient', 'pop', 'latin', 'afrobeats', 'other',
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
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

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
    <div className="h-full overflow-y-auto px-8 py-6">
      <h1 className="heading-display text-2xl mb-2">Submit Your Show</h1>
      <p className="text-muted text-sm mb-6">
        Operator reviews submissions weekly and merges approved entries into the live schedule.
      </p>
      <form onSubmit={submit} className="grid gap-3 max-w-xl glass-panel p-6">
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
            {submitting ? 'Sending…' : 'Submit'}
          </button>
          {result && (
            <span className={`text-sm ${result.ok ? 'text-primary' : 'text-accent'}`}>
              {result.message}
              {result.id && <span className="text-muted"> · id: {result.id}</span>}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
