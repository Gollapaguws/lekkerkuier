import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, roleAtLeast } from '../auth/AuthProvider';
import { useTheme, THEMES, ThemeName } from '../theme/themes.tsx';
import { useI18n, type Lang } from '../i18n/I18nProvider';

const NAV = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/schedule', labelKey: 'nav.schedule' },
  { to: '/djs', labelKey: 'nav.djs' },
  { to: '/events', labelKey: 'nav.events' },
  { to: '/history', labelKey: 'history.title' },
  { to: '/blog', labelKey: 'blog.title' },
  { to: '/chat', labelKey: 'nav.chat' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/support', labelKey: 'nav.support' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/submit', labelKey: 'nav.submit' },
];

const LANG_LABELS: Record<Lang, string> = { en: 'EN', af: 'AF' };

const THEME_GLYPHS: Record<ThemeName, string> = {
  cosmic: '🌌',
  industrial: '⚙️',
  psytech: '💎',
};

export function Header({ onSearchOpen }: { onSearchOpen: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { state, logout } = useAuth();
  const { theme, setTheme, cycleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const isLoggedIn = state.kind === 'authenticated';
  const userRole = isLoggedIn ? state.user.role : null;

  return (
    <header className="relative z-40 flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5 bg-[var(--lk-bg)]/80 backdrop-blur-xl">
      {/* Logo */}
      <Link to="/" className="heading-sm text-lg md:text-xl hover:text-[var(--lk-primary)] transition-colors">
        Lekkerkuier
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV.map(({ to, labelKey }) => (
          <Link
            key={to}
            to={to}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              location.pathname === to || (to === '/' && location.pathname === '/listen')
                ? 'bg-[var(--lk-primary)]/15 text-[var(--lk-primary)]'
                : 'text-[var(--lk-text-muted)] hover:text-[var(--lk-text)]'
            }`}
          >
            {t(labelKey)}
          </Link>
        ))}
      </nav>

      {/* Right side: lang + theme + auth */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="text-sm px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[var(--lk-text-muted)] hover:text-[var(--lk-text)] transition-colors"
          title="Search"
          aria-label="Search"
        >
          🔍
        </button>

        {/* Language switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'af' : 'en')}
          title={`Switch to ${lang === 'en' ? 'Afrikaans' : 'English'}`}
          className="text-xs px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[var(--lk-text-muted)] hover:text-[var(--lk-text)] transition-colors font-medium"
        >
          {LANG_LABELS[lang]}
        </button>

        {/* Theme cycle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          className="text-lg px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
        >
          {THEME_GLYPHS[theme]}
        </button>

        {/* Theme dots */}
        <div className="hidden lg:flex gap-1" aria-hidden="true">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                theme === t ? 'border-[var(--lk-primary)] bg-[var(--lk-primary)]' : 'border-white/20'
              }`}
              aria-label={`Switch to ${t}`}
            />
          ))}
        </div>

        {/* Auth */}
        {isLoggedIn ? (
          <div className="hidden md:flex items-center gap-2">
            {userRole && roleAtLeast(userRole, 'dj') && (
              <Link to="/dj" className="text-xs text-[var(--lk-mint)] hover:text-[var(--lk-primary)]">DJ</Link>
            )}
            {userRole && roleAtLeast(userRole, 'manager') && (
              <Link to="/manager" className="text-xs text-[var(--lk-accent)] hover:text-[var(--lk-primary)]">Manager</Link>
            )}
            {userRole && roleAtLeast(userRole, 'owner') && (
              <Link to="/admin" className="text-xs text-[var(--lk-primary)] hover:text-[var(--lk-accent)]">Admin</Link>
            )}
            <button onClick={logout} className="text-xs text-[var(--lk-text-muted)] hover:text-[var(--lk-accent)] ml-1">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="hidden md:block text-xs text-[var(--lk-text-muted)] hover:text-[var(--lk-text)]">
            Sign in
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-[var(--lk-text)] transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--lk-text)] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--lk-text)] transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <nav className="flex flex-col items-center gap-4">
            {NAV.map(({ to, labelKey }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`heading-sm text-xl ${
                  location.pathname === to || (to === '/' && location.pathname === '/listen')
                    ? 'text-[var(--lk-primary)]'
                    : 'text-[var(--lk-text-muted)]'
                }`}
              >
                {t(labelKey)}
              </Link>
            ))}
            <button
              onClick={() => { setLang(lang === 'en' ? 'af' : 'en'); setMenuOpen(false); }}
              className="heading-sm text-lg text-[var(--lk-text-muted)]"
            >
              {lang === 'en' ? '🇿🇦 Afrikaans' : '🇬🇧 English'}
            </button>
            {isLoggedIn && (
              <>
                {userRole && roleAtLeast(userRole, 'dj') && (
                  <Link to="/dj" onClick={() => setMenuOpen(false)} className="heading-sm text-xl text-[var(--lk-mint)]">DJ Dashboard</Link>
                )}
                {userRole && roleAtLeast(userRole, 'manager') && (
                  <Link to="/manager" onClick={() => setMenuOpen(false)} className="heading-sm text-xl text-[var(--lk-accent)]">Manager</Link>
                )}
                {userRole && roleAtLeast(userRole, 'owner') && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="heading-sm text-xl text-[var(--lk-primary)]">Admin</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="heading-sm text-xl text-[var(--lk-accent)]">Logout</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
