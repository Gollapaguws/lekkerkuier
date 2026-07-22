import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

/**
 * themes.tsx — Lekkerkuier ThemeProvider + useTheme hook.
 *
 * File is `.tsx` (NOT `.ts`) because it returns a JSX element
 * `<ThemeContext.Provider>`. A `.ts` file would emit TS1005
 * '>' expected when TypeScript tries to parse the JSX as TypeScript.
 */

export type ThemeName = 'cosmic' | 'industrial' | 'psytech';

export const THEMES: ReadonlyArray<ThemeName> = ['cosmic', 'industrial', 'psytech'];
export const DEFAULT_THEME: ThemeName = 'psytech';
const STORAGE_KEY = 'lekkerkuier-theme';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider — keeps React state in sync with the
 * `<html data-theme="...">` attribute, which is the source-of-truth CSS
 * hook the index.css `:root[data-theme="..."]` rule listens on.
 *
 * The index.html inline bootstrap script sets the attribute from
 * localStorage BEFORE React mounts (anti-FOUC), so the initial render
 * already has the right palette — this provider just keeps subsequent
 * user choices (vibe picker) in sync AND persists them.
 */
function detectOSTheme(): ThemeName | null {
  if (typeof window === 'undefined') return null;
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'industrial';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'cosmic';
  } catch {}
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && (THEMES as ReadonlyArray<string>).includes(raw)) return raw as ThemeName;
    } catch {}
    // No manual choice — try OS preference
    const osTheme = detectOSTheme();
    if (osTheme) return osTheme;
    return DEFAULT_THEME;
  });

  // Listen for OS theme changes when user hasn't manually chosen
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      try {
        const manual = localStorage.getItem(STORAGE_KEY);
        if (manual) return; // User has manually chosen — don't override
      } catch {}
      setThemeState(e.matches ? 'industrial' : 'cosmic');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => {
    if ((THEMES as ReadonlyArray<string>).includes(next)) setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((cur) => {
      const idx = THEMES.indexOf(cur);
      const next = THEMES[(idx + 1) % THEMES.length];
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, cycleTheme }),
    [theme, setTheme, cycleTheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
