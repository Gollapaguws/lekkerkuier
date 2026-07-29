import { Link } from 'react-router-dom';

const SOCIALS = [
  { label: 'Discord', url: 'https://discord.gg/lekkerkuier', icon: '💬' },
  { label: 'Twitter / X', url: 'https://x.com/lekkerkuier', icon: '🐦' },
  { label: 'Instagram', url: 'https://instagram.com/lekkerkuier', icon: '📸' },
  { label: 'SoundCloud', url: 'https://soundcloud.com/lekkerkuier', icon: '☁️' },
  { label: 'Mixcloud', url: 'https://mixcloud.com/lekkerkuier', icon: '🎚' },
  { label: 'YouTube', url: 'https://youtube.com/@lekkerkuier', icon: '▶️' },
];

const QUICK_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/djs', label: 'DJs' },
  { to: '/events', label: 'Events' },
  { to: '/history', label: 'Track History' },
  { to: '/blog', label: 'Blog' },
  { to: '/chat', label: 'Chat' },
  { to: '/support', label: 'Support Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/sitemap', label: 'Site Map' },
  { to: '/submit', label: 'Become a DJ' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[var(--lk-bg)]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="heading text-lg hover:text-[var(--lk-primary)] transition-colors">
              Lekkerkuier
            </Link>
            <p className="text-sm text-[var(--lk-text-muted)] leading-relaxed max-w-xs">
              Mzansi's 24/7 PsyTech Fusion radio. Transcend the Vibration. Broadcasting psytrance, industrial, and electronic music to the world.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-[var(--lk-text-muted)]">Live now</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="heading-sm text-xs uppercase tracking-widest text-[var(--lk-text-muted)]">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-[var(--lk-text-muted)] hover:text-[var(--lk-primary)] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="heading-sm text-xs uppercase tracking-widest text-[var(--lk-text-muted)]">Connect</h4>
            <div className="grid grid-cols-2 gap-2">
              {SOCIALS.map(({ label, url, icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--lk-text-muted)] hover:text-[var(--lk-primary)] transition-colors"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--lk-text-muted)]">
          <p>© {new Date().getFullYear()} Lekker Kuier Psy Radio. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Streaming 256kbps AAC+</span>
            <span className="hidden sm:inline">•</span>
            <span>Made with 💜 in Mzansi</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
