import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

const MISSION = {
  title: 'Transcend the Vibration',
  body: 'Lekker Kuier Psy Radio was born in the heart of Mzansi with one mission: to broadcast the finest psytrance, industrial, and electronic music 24 hours a day, 7 days a week. We\'re not just a radio station — we\'re a frequency, a community, a state of mind.',
};

const VALUES = [
  {
    icon: '🌀',
    title: 'Authenticity',
    desc: 'Underground sounds, no commercial compromises. Every track is hand-picked by our resident DJs.',
  },
  {
    icon: '🌍',
    title: 'Community',
    desc: 'Listener-driven. Your requests, your chat messages, your vibe shapes what we play next.',
  },
  {
    icon: '⚡',
    title: 'Energy',
    desc: 'High-BPM, bass-heavy, mind-bending frequencies engineered to move body and soul.',
  },
  {
    icon: '🔮',
    title: 'Innovation',
    desc: 'Cutting-edge audio processing, interactive visualizers, and a platform built for the future.',
  },
  {
    icon: '🤝',
    title: 'Inclusivity',
    desc: 'All are welcome in the Kuier. No gatekeeping — just good music and good vibes.',
  },
  {
    icon: '🎧',
    title: 'Quality',
    desc: '256kbps AAC+ streaming. Crystal-clear audio engineered for club systems and headphones alike.',
  },
];

const TIMELINE = [
  { year: '2022', event: 'Station founded in a garage studio in Johannesburg.' },
  { year: '2023', event: 'First 24/7 broadcast goes live. 12 resident DJs join the roster.' },
  { year: '2024', event: 'Launched interactive visualizer and listener chat. Community hits 5k.' },
  { year: '2025', event: 'Expanded to industrial and dark techno blocks. Global listeners from 40+ countries.' },
  { year: '2026', event: 'Complete redesign. PWA launch. Mobile listening everywhere.' },
];

const FAQ = [
  {
    q: 'How do I listen?',
    a: 'Hit the big play button on the home page, or navigate to any page — the player bar at the bottom keeps the stream going. You can also tune in directly via /autodj.mp3.',
  },
  {
    q: 'Can I request a song?',
    a: 'Absolutely! Head over to the Chat page and drop a request. Our DJs monitor the chat during live shows.',
  },
  {
    q: 'How do I become a DJ?',
    a: 'Use the Submit page to send us a demo mix or show proposal. Our team reviews every submission.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Lekkerkuier is a PWA — install it to your home screen from Chrome or Safari for a native app experience.',
  },
  {
    q: 'What bitrate do you stream?',
    a: '256kbps AAC+. Optimized for both high-fidelity listening and mobile data efficiency.',
  },
];

export function About() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-6 animate-slide">
          <h1 className="heading text-4xl md:text-6xl">
            {t('about.title')}
          </h1>
          <p className="text-[var(--lk-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            {MISSION.body}
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <div className="glass-sm px-6 py-3 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-400 animate-glow" />
              <span className="text-sm text-[var(--lk-text-muted)]">Live 24/7 since 2022</span>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="space-y-8">
          <h2 className="heading text-2xl md:text-3xl text-center">{t('about.values')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="glass-sm p-6 hover:border-[var(--lk-primary)]/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="text-3xl mb-3 block">{v.icon}</span>
                  <h3 className="heading-sm text-base mb-2">{v.title}</h3>
                  <p className="text-sm text-[var(--lk-text-muted)] leading-relaxed">{v.desc}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-8">
          <h2 className="heading text-2xl md:text-3xl text-center">{t('about.timeline')}</h2>
          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--lk-primary)] via-[var(--lk-accent)] to-transparent" />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-6 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[var(--lk-primary)] -translate-x-1/2 mt-1.5 shadow-[0_0_12px_var(--lk-primary)]" />

                  {/* Card */}
                  <div className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <div className="glass-sm p-4 inline-block">
                      <span className="heading-sm text-sm text-[var(--lk-primary)]">{item.year}</span>
                      <p className="text-sm text-[var(--lk-text-muted)] mt-1">{item.event}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '24/7', label: t('support.streaming') },
            { value: '40+', label: 'Countries' },
            { value: '12+', label: 'Resident DJs' },
            { value: '256k', label: 'Bitrate (AAC+)' },
          ].map((stat) => (
            <div key={stat.label} className="glass-sm p-6 text-center hover:border-[var(--lk-primary)]/30 transition-all">
              <p className="heading text-2xl md:text-3xl text-gradient">{stat.value}</p>
              <p className="text-sm text-[var(--lk-text-muted)] mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="space-y-8 max-w-2xl mx-auto">
          <h2 className="heading text-2xl md:text-3xl text-center">{t('about.faq')}</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="glass-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="heading-sm text-sm">{item.q}</span>
                  <span className={`text-[var(--lk-primary)] transition-transform duration-300 ${
                    openFaq === i ? 'rotate-45' : ''
                  }`}>
                    +
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-40 pb-5 px-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm text-[var(--lk-text-muted)] leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-8 space-y-6">
          <h2 className="heading text-2xl md:text-3xl">Join the Kuier</h2>
          <p className="text-[var(--lk-text-muted)] max-w-md mx-auto">
            Tune in, chat with fellow listeners, request tracks, and become part of Mzansi's fastest-growing electronic music community.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/chat" className="btn-glow px-8 py-3 text-sm">Join the Chat</Link>
            <Link to="/submit" className="btn-outline px-8 py-3 text-sm">Become a DJ</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
