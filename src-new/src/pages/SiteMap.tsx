import { Link } from 'react-router-dom';

interface SitePage {
  to: string;
  title: string;
  description: string;
  icon: string;
}

const PAGES: SitePage[] = [
  { to: '/', title: 'Home', description: 'Hero section, now playing, featured shows, recently played, and listen live CTA', icon: '🏠' },
  { to: '/schedule', title: 'Schedule', description: 'Weekly show grid with live indicators, day-of-week filters, show cards', icon: '📅' },
  { to: '/djs', title: 'DJs', description: 'Resident DJ profiles with bios, show info, genre tags, and gradient avatars', icon: '🎧' },
  { to: '/events', title: 'Events', description: 'Featured events with countdown timers, genre filters, upcoming and past grids', icon: '🎪' },
  { to: '/history', title: 'Track History', description: 'Real-time recently played tracks from AzuraCast with genre filters and album art', icon: '🎵' },
  { to: '/podcast', title: 'On Demand', description: 'Archived episodes from all shows with play/download, sort by latest or popular', icon: '🎙️' },
  { to: '/blog', title: 'Blog & News', description: 'Station announcements, community stories, behind-the-scenes, and music guides', icon: '📝' },
  { to: '/gallery', title: 'Gallery', description: 'Photo grid with category filters, keyboard-accessible lightbox with navigation', icon: '🖼️' },
  { to: '/chat', title: 'Listener Chat', description: 'Live chat with song requests, message history, and real-time scrolling', icon: '💬' },
  { to: '/about', title: 'About', description: 'Station story, mission, values, interactive timeline, stats, and FAQ accordion', icon: 'ℹ️' },
  { to: '/support', title: 'Support', description: 'Donation tiers (R5/R10/R25), payment options, and other ways to help', icon: '💎' },
  { to: '/contact', title: 'Contact', description: 'Contact form with toast notifications, social links, and stream info', icon: '✉️' },
  { to: '/submit', title: 'Submit a Show', description: 'Show submission form for aspiring DJs to join the Lekkerkuier lineup', icon: '🎤' },
  { to: '/listen', title: 'Listen', description: 'Alias for the home page — quick access to the live stream and now playing', icon: '🔊' },
  { to: '/sitemap', title: 'Site Map', description: 'You are here! A directory of every page on Lekkerkuier', icon: '🗺️' },
  { to: '/login', title: 'Login', description: 'Operator authentication for admin panel access', icon: '🔐' },
  { to: '/admin', title: 'Admin', description: 'Operator dashboard for managing shows and station settings', icon: '⚙️' },
];

export function SiteMap() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-lg text-4xl md:text-5xl mb-4">
            <span className="text-[var(--lk-primary)]">Site</span> Map
          </h1>
          <p className="text-[var(--lk-text-muted)] max-w-lg mx-auto text-lg">
            Every page on Lekkerkuier — {PAGES.length} destinations
          </p>
        </div>

        {/* Page grid */}
        <div className="space-y-3">
          {PAGES.map((page, i) => (
            <Link
              key={page.to}
              to={page.to}
              className="glass-card p-4 flex items-start gap-4 hover:border-[var(--lk-primary)]/30 transition-all group block"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{page.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="heading-sm text-sm group-hover:text-[var(--lk-primary)] transition-colors">
                  {page.title}
                </p>
                <p className="text-xs text-[var(--lk-text-muted)] leading-relaxed mt-0.5">
                  {page.description}
                </p>
              </div>
              <span className="text-[var(--lk-primary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
