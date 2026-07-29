import { useState } from 'react';
import { useToast } from '../components/Toast';

const DONATION_TIERS = [
  { amount: 5, label: 'Listener', perks: ['Our eternal gratitude', 'Name on website'], emoji: '💚', color: 'from-emerald-500/20 to-emerald-600/10' },
  { amount: 10, label: 'Supporter', perks: ['Shoutout on air', 'Priority song requests', 'Name on website'], emoji: '💎', color: 'from-blue-500/20 to-purple-600/10' },
  { amount: 25, label: 'Patron', perks: ['Monthly mix download', 'Behind-the-scenes access', 'Shoutout on air', 'Priority song requests'], emoji: '🌟', color: 'from-amber-500/20 to-orange-600/10' },
];

const OTHER_WAYS = [
  { title: 'Share the Station', desc: 'Tell your friends about Lekkerkuier. Word of mouth is the most powerful support.', emoji: '📢' },
  { title: 'Become a DJ', desc: 'Got mixing skills? Submit your own show and become part of the family.', emoji: '🎧' },
  { title: 'Send Us Music', desc: 'Know great underground psytrance? Send us tracks and we\'ll feature them.', emoji: '🎵' },
  { title: 'Join the Chat', desc: 'Be active in our listener chat — a vibrant community makes everything better.', emoji: '💬' },
];

export function Support() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<number | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const handlePayment = (method: string) => {
    setComingSoon(method);
    toast(`${method} payments coming soon!`, 'info');
    setTimeout(() => setComingSoon(null), 2500);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="heading-lg text-4xl md:text-5xl mb-4">
            Support <span className="text-[var(--lk-primary)]">Lekkerkuier</span>
          </h1>
          <p className="text-[var(--lk-text-muted)] max-w-2xl mx-auto text-lg">
            We're a community-powered, independent radio station. Every contribution helps keep the music playing 24/7 — server costs, licensing, and growing our reach.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: '24/7', label: 'Streaming' },
            { value: '100%', label: 'Listener Funded' },
            { value: '∞', label: 'Good Vibes' },
            { value: '0', label: 'Corporate Ads' },
          ].map(({ value, label }) => (
            <div key={label} className="glass-card p-5 text-center">
              <p className="text-2xl md:text-3xl heading-sm text-[var(--lk-primary)] mb-1">{value}</p>
              <p className="text-xs text-[var(--lk-text-muted)]">{label}</p>
            </div>
          ))}
        </div>

        {/* Donate tiers */}
        <h2 className="heading-sm text-2xl text-center mb-6">Choose Your Support Level</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {DONATION_TIERS.map((tier) => (
            <button
              key={tier.label}
              onClick={() => { setSelected(tier.amount); toast(`Thanks for selecting the R${tier.amount} tier!`, 'info'); }}
              className={`glass-card p-6 text-left transition-all duration-300 hover:scale-[1.02] ${
                selected === tier.amount
                  ? 'ring-2 ring-[var(--lk-primary)] shadow-lg shadow-[var(--lk-primary)]/20'
                  : ''
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 text-2xl`}>
                {tier.emoji}
              </div>
              <p className="text-xl heading-sm mb-1">{tier.label}</p>
              <p className="text-3xl heading-lg text-[var(--lk-primary)] mb-3">
                R{tier.amount}<span className="text-sm text-[var(--lk-text-muted)]">/mo</span>
              </p>
              <ul className="space-y-2 mb-4">
                {tier.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-[var(--lk-text-muted)]">
                    <span className="text-[var(--lk-primary)] mt-0.5">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              {selected === tier.amount && (
                <p className="text-xs text-[var(--lk-primary)] animate-pulse">Selected ✓</p>
              )}
            </button>
          ))}
        </div>

        {/* Donate CTA */}
        <div className="glass-card p-8 text-center mb-14">
          <p className="text-lg mb-3">
            {selected ? `You selected the R${selected}/mo tier — thank you! 🎉` : 'Select a tier above to get started'}
          </p>
          <p className="text-sm text-[var(--lk-text-muted)] mb-6">
            Donations are processed securely. You can cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handlePayment('Card')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--lk-primary)] text-white font-medium hover:bg-[var(--lk-accent)] transition-colors shadow-lg shadow-[var(--lk-primary)]/25"
            >
              💳 Donate with Card
            </button>
            <button
              onClick={() => handlePayment('PayPal')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-[var(--lk-text)] font-medium hover:bg-white/15 transition-colors"
            >
              PayPal
            </button>
            <button
              onClick={() => handlePayment('Crypto')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-[var(--lk-text)] font-medium hover:bg-white/15 transition-colors"
            >
              ₿ Crypto
            </button>
          </div>
          {comingSoon && (
            <p className="text-sm text-[var(--lk-primary)] mt-3 animate-fade">
              🚀 {comingSoon} payments coming soon — stay tuned!
            </p>
          )}
          <p className="text-xs text-[var(--lk-text-muted)] mt-4">
            🔒 Secure payment processing. We'll never share your info.
          </p>
        </div>

        {/* Other ways */}
        <h2 className="heading-sm text-2xl text-center mb-6">Other Ways to Support</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {OTHER_WAYS.map(({ title, desc, emoji }) => (
            <div key={title} className="glass-card p-5 flex gap-4 items-start">
              <span className="text-3xl flex-shrink-0">{emoji}</span>
              <div>
                <p className="font-medium text-[var(--lk-text)] mb-1">{title}</p>
                <p className="text-sm text-[var(--lk-text-muted)]">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <p className="text-center text-sm text-[var(--lk-text-muted)] mt-14">
          From the bottom of our hearts — <span className="text-[var(--lk-primary)]">thank you</span> for being part of Lekkerkuier.
          <br />
          Every listener, every share, every contribution keeps the psychedelic frequencies flowing. 🌀
        </p>
      </div>
    </div>
  );
}
