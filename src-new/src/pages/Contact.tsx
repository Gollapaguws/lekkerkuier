import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { useToast } from '../components/Toast';

export function Contact() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.sendContact({ ...form });
      setSent(true);
      toast('Message sent! We will get back to you soon.', 'success');
    } catch (err) {
      setError((err as Error).message || 'Failed to send. Try again or email us directly.');
      toast('Failed to send message. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading text-2xl md:text-4xl mb-2">Contact</h1>
        <p className="text-[var(--lk-text-muted)] text-sm mb-10">
          Got a question, submission, or just want to say hi? Reach out.
        </p>

        <div className="grid md:grid-cols-2 gap-8 stagger">
          {/* Contact form */}
          <div className="glass p-6">
            {sent ? (
              <div className="text-center py-8">
                <p className="heading-sm text-xl text-[var(--lk-mint)] mb-2">Message Sent!</p>
                <p className="text-sm text-[var(--lk-text-muted)]">We'll get back to you within 48 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }} className="btn-outline mt-4 px-4 py-1 text-sm">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase text-[var(--lk-text-muted)]">Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full mt-1 bg-white/5 border border-[var(--lk-primary)]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--lk-primary)]"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase text-[var(--lk-text-muted)]">Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full mt-1 bg-white/5 border border-[var(--lk-primary)]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--lk-primary)]"
                    placeholder="you@email.com"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase text-[var(--lk-text-muted)]">Message</span>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="block w-full mt-1 bg-white/5 border border-[var(--lk-primary)]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--lk-primary)] resize-none"
                    placeholder="What's on your mind?"
                  />
                </label>
                <button type="submit" className="btn-glow px-6 py-2 text-sm" disabled={sending}>
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
                {error && <p className="text-xs text-[var(--lk-accent)] mt-2">{error}</p>}
              </form>
            )}
          </div>

          {/* Social & Info */}
          <div className="space-y-5">
            <div className="glass p-5">
              <h3 className="heading-sm text-base mb-3">Connect With Us</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Email', value: 'info@lekkerkuier.com', href: 'mailto:info@lekkerkuier.com' },
                  { label: 'Instagram', value: '@lekkerkuier', href: '#' },
                  { label: 'SoundCloud', value: '/lekkerkuier', href: '#' },
                  { label: 'Mixcloud', value: '/lekkerkuier', href: '#' },
                ].map(({ label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center justify-between py-2 border-b border-white/5 hover:text-[var(--lk-primary)] transition-colors"
                  >
                    <span className="text-[var(--lk-text-muted)]">{label}</span>
                    <span>{value}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass p-5">
              <h3 className="heading-sm text-base mb-2">Stream Info</h3>
              <div className="text-xs space-y-1 text-[var(--lk-text-muted)]">
                <p>Stream: <code className="text-[var(--lk-primary)]">https://lekkerkuier.com/autodj.mp3</code></p>
                <p>Quality: 320kbps MP3</p>
                <p>Location: Cape Town, ZA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
