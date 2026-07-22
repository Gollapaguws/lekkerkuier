import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

interface SearchResult {
  id: string;
  type: 'blog' | 'podcast' | 'event' | 'page';
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

// Search index built from existing data
const SEARCH_INDEX: SearchResult[] = [
  // Blog posts
  { id: 'blog-welcome', type: 'blog', title: 'Welcome to Lekkerkuier', subtitle: 'Mzansi\'s New PsyTech Fusion Station', url: '#/blog', icon: '🚀' },
  { id: 'blog-studio', type: 'blog', title: 'Studio Upgrade 2026', subtitle: 'New broadcast equipment', url: '#/blog', icon: '🎛️' },
  { id: 'blog-solaris', type: 'blog', title: 'DJ Solaris Interview', subtitle: 'Evolution of Psytrance in SA', url: '#/blog', icon: '🎤' },
  { id: 'blog-psytech', type: 'blog', title: 'What is PsyTech?', subtitle: 'Fusion genre guide', url: '#/blog', icon: '🎵' },
  { id: 'blog-spotlight', type: 'blog', title: 'Community Spotlight July', subtitle: 'Most active listeners', url: '#/blog', icon: '💜' },
  { id: 'blog-submit-guide', type: 'blog', title: 'Submit Your Show Guide', subtitle: 'Complete guide for new DJs', url: '#/blog', icon: '📻' },
  // Podcast episodes
  { id: 'pod-midnight-42', type: 'podcast', title: 'Midnight Frequencies Ep.42', subtitle: 'Full Moon Transmission — DJ Solaris', url: '#/podcast', icon: '🌕' },
  { id: 'pod-industrial-28', type: 'podcast', title: 'Industrial Overdrive Ep.28', subtitle: 'Steel & Static — Bass Cathedral', url: '#/podcast', icon: '⚙️' },
  { id: 'pod-sunrise-15', type: 'podcast', title: 'Sunrise Sessions Ep.15', subtitle: 'Dawn Chorus Mix — DJ Luna', url: '#/podcast', icon: '🌅' },
  { id: 'pod-dark-9', type: 'podcast', title: 'Dark Forest Ep.9', subtitle: 'Shadow Realm — Nyx', url: '#/podcast', icon: '🌲' },
  { id: 'pod-midnight-41', type: 'podcast', title: 'Midnight Frequencies Ep.41', subtitle: 'Stargate Sequence — DJ Solaris', url: '#/podcast', icon: '🌌' },
  { id: 'pod-technoir-5', type: 'podcast', title: 'TechNoir Ep.5', subtitle: 'Binary Pulse — Unit-7', url: '#/podcast', icon: '🤖' },
  // Events
  { id: 'evt-cosmic', type: 'event', title: 'Cosmic Dawn Festival Set', subtitle: 'Aug 15 — DJ Solaris', url: '#/events', icon: '🌅' },
  { id: 'evt-industrial', type: 'event', title: 'Industrial Revolt: Dark Techno Night', subtitle: 'Jul 30 — BassCathedral', url: '#/events', icon: '🏭' },
  { id: 'evt-chill', type: 'event', title: 'Chill Vortex Sunday', subtitle: 'Aug 3 — Aurora Flux', url: '#/events', icon: '🌊' },
  { id: 'evt-bass', type: 'event', title: 'Bass Cathedral Monthly', subtitle: 'Aug 22 — BassCathedral b2b Shadow_Byte', url: '#/events', icon: '⛪' },
  { id: 'evt-yoga', type: 'event', title: 'Psy-Sunrise Yoga Flow', subtitle: 'Aug 10 — DJ Solaris', url: '#/events', icon: '🧘' },
  { id: 'evt-circuit', type: 'event', title: 'Midnight Circuit', subtitle: 'Aug 29 — Phantom Current', url: '#/events', icon: '🌃' },
  // Pages
  { id: 'page-schedule', type: 'page', title: 'Weekly Schedule', subtitle: 'Show timetable', url: '#/schedule', icon: '📅' },
  { id: 'page-djs', type: 'page', title: 'Our DJs', subtitle: 'Meet the resident DJs', url: '#/djs', icon: '🎧' },
  { id: 'page-support', type: 'page', title: 'Support Lekkerkuier', subtitle: 'Donate and help the station', url: '#/support', icon: '💎' },
  { id: 'page-about', type: 'page', title: 'About Lekkerkuier', subtitle: 'Our story and mission', url: '#/about', icon: 'ℹ️' },
  { id: 'page-contact', type: 'page', title: 'Contact Us', subtitle: 'Get in touch', url: '#/contact', icon: '✉️' },
  { id: 'page-gallery', type: 'page', title: 'Gallery', subtitle: 'Photos and artwork', url: '#/gallery', icon: '🖼️' },
];

const TYPE_LABELS: Record<string, string> = { blog: 'Blog', podcast: 'On Demand', event: 'Event', page: 'Page' };
const TYPE_COLORS: Record<string, string> = { blog: 'bg-purple-500/20 text-purple-300', podcast: 'bg-cyan-500/20 text-cyan-300', event: 'bg-amber-500/20 text-amber-300', page: 'bg-emerald-500/20 text-emerald-300' };

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Search({ isOpen, onClose }: SearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = query.trim().length < 2
    ? []
    : SEARCH_INDEX.filter((r) => {
        const q = query.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q);
      }).slice(0, 10);

  const navigateTo = useCallback((url: string) => {
    navigate(url);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[focusedIdx]) {
      navigateTo(results[focusedIdx].url);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, focusedIdx, navigateTo, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setFocusedIdx(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <span className="text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-[var(--lk-text)] text-lg outline-none placeholder:text-[var(--lk-text-muted)]"
            autoComplete="off"
          />
          <button
            onClick={onClose}
            className="text-[var(--lk-text-muted)] hover:text-[var(--lk-text)] text-lg px-2"
            aria-label="Close search"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length > 0 && query.trim().length < 2 && (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--lk-text-muted)]">{t('search.typeMore')}</p>
            </div>
          )}

          {results.length === 0 && query.trim().length >= 2 && (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">🔎</p>
              <p className="text-sm text-[var(--lk-text-muted)]">{t('search.noResults')} "{query}"</p>
            </div>
          )}

          <div className="py-2">
            {results.map((result, i) => (
              <button
                key={result.id}
                onClick={() => navigateTo(result.url)}
                onMouseEnter={() => setFocusedIdx(i)}
                className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors ${
                  i === focusedIdx
                    ? 'bg-white/5'
                    : ''
                }`}
                role="option"
                aria-selected={i === focusedIdx}
              >
                <span className="text-xl mt-0.5 flex-shrink-0">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--lk-text)] truncate">{result.title}</p>
                  <p className="text-xs text-[var(--lk-text-muted)] truncate">{result.subtitle}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[result.type]}`}>
                  {TYPE_LABELS[result.type]}
                </span>
              </button>
            ))}
          </div>

          {results.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5 text-xs text-[var(--lk-text-muted)]">
              {t('search.navigateHint')}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
