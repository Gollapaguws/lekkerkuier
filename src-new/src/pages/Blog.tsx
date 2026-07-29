import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'announcements' | 'community' | 'tech' | 'music';
  author: string;
  date: string;
  readTime: number;
  imageEmoji: string;
}

const POSTS: BlogPost[] = [
  {
    slug: 'welcome-to-lekkerkuier',
    title: 'Welcome to Lekkerkuier — Mzansi\'s New PsyTech Fusion Station',
    excerpt: 'We\'re thrilled to launch South Africa\'s first dedicated psytrance and industrial radio station. Here\'s our story, our mission, and what you can expect from the Lekkerkuier airwaves.',
    category: 'announcements',
    author: 'Station Manager',
    date: '2026-07-20',
    readTime: 4,
    imageEmoji: '🚀',
  },
  {
    slug: 'studio-upgrade-2026',
    title: 'Behind the Scenes: Our New Broadcast Studio Upgrade',
    excerpt: 'We\'ve invested in new broadcast equipment to bring you crystal-clear 256kbps AAC+ streaming. Take a peek at the new setup and what it means for your listening experience.',
    category: 'tech',
    author: 'Tech Team',
    date: '2026-07-15',
    readTime: 6,
    imageEmoji: '🎛️',
  },
  {
    slug: 'dj-solaris-interview',
    title: 'Interview: DJ Solaris on the Evolution of Psytrance in South Africa',
    excerpt: 'We sat down with resident DJ Solaris to discuss the growing psytrance scene in Mzansi, from underground parties to international recognition.',
    category: 'community',
    author: 'Editorial Team',
    date: '2026-07-10',
    readTime: 8,
    imageEmoji: '🎤',
  },
  {
    slug: 'psytech-explained',
    title: 'What is PsyTech? A Guide to the Fusion Genre Taking Over',
    excerpt: 'PsyTech blends the hypnotic elements of psytrance with the raw energy of industrial techno. We break down the sound, the history, and the artists defining the genre.',
    category: 'music',
    author: 'Music Director',
    date: '2026-07-05',
    readTime: 5,
    imageEmoji: '🎵',
  },
  {
    slug: 'community-spotlight-july',
    title: 'Community Spotlight: July\'s Most Active Listeners',
    excerpt: 'Every month we celebrate our most engaged community members. Meet the listeners keeping the chat alive and the vibes flowing on Lekkerkuier.',
    category: 'community',
    author: 'Community Team',
    date: '2026-07-01',
    readTime: 3,
    imageEmoji: '💜',
  },
  {
    slug: 'submission-guide',
    title: 'How to Become a DJ: A Complete Guide',
    excerpt: 'Want to host your own show on Lekkerkuier? We\'ve put together everything you need to know about submitting, preparing, and broadcasting your mix.',
    category: 'announcements',
    author: 'Programming Team',
    date: '2026-06-25',
    readTime: 7,
    imageEmoji: '📻',
  },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  announcements: '📢',
  community: '💜',
  tech: '🔧',
  music: '🎵',
};

const CATEGORIES = [
  { key: 'all', labelKey: 'blog.all' },
  { key: 'announcements', labelKey: 'blog.announcements' },
  { key: 'community', labelKey: 'blog.community' },
  { key: 'tech', labelKey: 'blog.tech' },
  { key: 'music', labelKey: 'blog.music' },
];

export function Blog() {
  const { t } = useI18n();
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = category === 'all'
    ? POSTS
    : POSTS.filter((p) => p.category === category);

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = { announcements: t('blog.announcements'), community: t('blog.community'), tech: t('blog.tech'), music: t('blog.music') };
    return map[cat] ?? cat;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-lg text-4xl md:text-5xl mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-[var(--lk-text-muted)] max-w-xl mx-auto text-lg">
            Station announcements, community stories, and behind-the-scenes updates from the Lekkerkuier team.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === key
                  ? 'bg-[var(--lk-primary)] text-white shadow-lg shadow-[var(--lk-primary)]/25'
                  : 'bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10 hover:text-[var(--lk-text)]'
              }`}
            >
              {key !== 'all' && CATEGORY_EMOJIS[key]} {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Featured post (first) */}
        {filtered.length > 0 && (
          <div
            className="glass-card mb-8 overflow-hidden group hover:border-[var(--lk-primary)]/30 transition-all cursor-pointer"
            onClick={() => setExpanded(expanded === filtered[0].slug ? null : filtered[0].slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(expanded === filtered[0].slug ? null : filtered[0].slug); } }}
          >
            <div className="md:flex">
              <div className="w-full md:w-2/5 aspect-video md:aspect-auto flex items-center justify-center bg-gradient-to-br from-[var(--lk-primary)]/10 to-[var(--lk-accent)]/10 text-7xl">
                {filtered[0].imageEmoji}
              </div>
              <div className="p-6 md:p-8 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--lk-primary)]/10 text-[var(--lk-primary)] flex items-center gap-1">
                    {CATEGORY_EMOJIS[filtered[0].category]} {categoryLabel(filtered[0].category)}
                  </span>
                  <span className="text-xs text-[var(--lk-text-muted)]">{filtered[0].date}</span>
                  <span className="text-xs text-[var(--lk-text-muted)]">· {filtered[0].readTime} {t('blog.minRead')}</span>
                </div>
                <h2 className="heading-sm text-xl md:text-2xl mb-2 group-hover:text-[var(--lk-primary)] transition-colors">
                  {filtered[0].title}
                </h2>
                <p className="text-[var(--lk-text-muted)] text-sm leading-relaxed mb-4">
                  {filtered[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--lk-text-muted)]">{filtered[0].author}</span>
                  <span className="text-sm text-[var(--lk-primary)]">
                    {expanded === filtered[0].slug ? 'Show less ↑' : `${t('blog.readMore')} →`}
                  </span>
                </div>
                {expanded === filtered[0].slug && (
                  <div className="mt-4 pt-4 border-t border-white/5 text-sm text-[var(--lk-text-muted)] leading-relaxed space-y-3">
                    <p>The Lekkerkuier team has been working around the clock to bring this station to life. From sourcing the best underground psytrance and industrial tracks to building our broadcast infrastructure, every step has been driven by passion for the music and love for the Mzansi community.</p>
                    <p>We believe radio should be more than a playlist — it should be a living, breathing space where music lovers connect, discover new sounds, and feel part of something bigger. That's why we built live chat, show submissions, and a schedule packed with diverse DJs from across the country.</p>
                    <p>Stay tuned for exciting announcements, new show launches, and community events. The frequency is just getting started. 🌀</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(1).map((post) => (
            <div
              key={post.slug}
              onClick={() => setExpanded(expanded === post.slug ? null : post.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(expanded === post.slug ? null : post.slug); } }}
              className={`glass-card text-left overflow-hidden group transition-all hover:border-[var(--lk-primary)]/20 cursor-pointer ${
                expanded === post.slug ? 'ring-1 ring-[var(--lk-primary)]/30' : ''
              }`}
            >
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[var(--lk-primary)]/05 to-[var(--lk-accent)]/05 text-5xl">
                {post.imageEmoji}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lk-primary)]/10 text-[var(--lk-primary)]">
                    {CATEGORY_EMOJIS[post.category]} {categoryLabel(post.category)}
                  </span>
                  <span className="text-[10px] text-[var(--lk-text-muted)]">{post.readTime} {t('blog.minRead')}</span>
                </div>
                <h3 className="heading-sm text-base mb-2 group-hover:text-[var(--lk-primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--lk-text-muted)] leading-relaxed mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--lk-text-muted)]">{post.date}</span>
                  <span className="text-[var(--lk-primary)]">
                    {expanded === post.slug ? '↑' : '→'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--lk-text-muted)] text-lg">No posts found.</p>
            <button onClick={() => setCategory('all')} className="mt-4 text-[var(--lk-primary)] hover:text-[var(--lk-accent)] transition-colors text-sm">
              Show all posts →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
