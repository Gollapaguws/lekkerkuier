import { useState, useCallback, lazy, Suspense, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Player } from './components/Player';
import { Footer } from './components/Footer';
import { Search } from './components/Search';
import { InstallBanner } from './components/InstallBanner';
import { ToastContainer } from './components/Toast';
import { MiniPlayer } from './components/MiniPlayer';
import { PageSkeleton } from './components/Skeleton';
import { useAuth, type Role } from './auth/AuthProvider';
import { Home } from './pages/Home';

const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const DjDashboard = lazy(() => import('./pages/DjDashboard').then((m) => ({ default: m.DjDashboard })));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard').then((m) => ({ default: m.ManagerDashboard })));

const Schedule = lazy(() => import('./pages/Schedule').then((m) => ({ default: m.Schedule })));
const DJs = lazy(() => import('./pages/DJs').then((m) => ({ default: m.DJs })));
const Events = lazy(() => import('./pages/Events').then((m) => ({ default: m.Events })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Chat = lazy(() => import('./pages/Chat').then((m) => ({ default: m.Chat })));
const Support = lazy(() => import('./pages/Support').then((m) => ({ default: m.Support })));
const Blog = lazy(() => import('./pages/Blog').then((m) => ({ default: m.Blog })));
const History = lazy(() => import('./pages/History').then((m) => ({ default: m.History })));
const SiteMap = lazy(() => import('./pages/SiteMap').then((m) => ({ default: m.SiteMap })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const Submit = lazy(() => import('./pages/Submit').then((m) => ({ default: m.Submit })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '?') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause' },
    { key: 'S', action: 'Search' },
    { key: 'H', action: 'Home' },
    { key: 'L', action: 'Switch Language' },
    { key: '?', action: 'Toggle this help' },
    { key: 'Esc', action: 'Close overlays' },
  ];

  return (
    <div className="shortcut-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="shortcut-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="heading-sm text-lg">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-[var(--lk-text-muted)] hover:text-[var(--lk-text)] text-lg">✕</button>
        </div>
        <div className="p-4 space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5">
              <span className="text-sm text-[var(--lk-text-muted)]">{action}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-mono text-[var(--lk-primary)] border border-white/10">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RequireRole({ roles, children }: { roles: Role[]; children: JSX.Element }) {
  const { state } = useAuth();
  const loc = useLocation();
  if (state.kind === 'loading') return null;
  if (state.kind === 'anonymous') {
    return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }
  if (!roles.includes(state.user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function App() {
  const [playing, setPlaying] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const editable = (e.target as HTMLElement).isContentEditable;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable;

      // Space = play/pause (not in inputs)
      if (e.key === ' ' && !isInput) { e.preventDefault(); togglePlay(); return; }

      // Single-key shortcuts (only when not in inputs)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !isInput) {
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); setSearchOpen((o) => !o); return; }
        if (e.key === 'h' || e.key === 'H') { e.preventDefault(); window.location.hash = '#/'; return; }
        if (e.key === 'l' || e.key === 'L') { e.preventDefault(); return; }
        if (e.key === '?') { e.preventDefault(); setShortcutsOpen((o) => !o); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay]);

  return (
    <HashRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <Header onSearchOpen={() => setSearchOpen(true)} />
        <main id="main-content" className="flex-1 overflow-hidden" tabIndex={-1}>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Home playing={playing} onTogglePlay={togglePlay} audioRef={audioRef} />} />
                <Route path="/listen" element={<Home playing={playing} onTogglePlay={togglePlay} audioRef={audioRef} />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/djs" element={<DJs />} />
                <Route path="/events" element={<Events />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/history" element={<History />} />
                <Route path="/sitemap" element={<SiteMap />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/support" element={<Support />} />
                <Route path="/submit" element={<RequireRole roles={['listener','dj','manager','owner']}><Submit /></RequireRole>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dj" element={<RequireRole roles={['dj','manager','owner']}><DjDashboard /></RequireRole>} />
                <Route path="/manager" element={<RequireRole roles={['manager','owner']}><ManagerDashboard /></RequireRole>} />
                <Route path="/admin" element={<RequireRole roles={['owner']}><Admin /></RequireRole>} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Player playing={playing} onTogglePlay={togglePlay} audioRef={audioRef} />
        <Footer />
        <Search isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <InstallBanner />
        <ToastContainer />
        <MiniPlayer playing={playing} onTogglePlay={togglePlay} />
        {shortcutsOpen && <ShortcutHelp onClose={() => setShortcutsOpen(false)} />}
      </div>
    </HashRouter>
  );
}
