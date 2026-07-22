/** @type {import('tailwindcss').Config} */
// Tailwind v3 config for Lekkerkuier v3 SPA.
//
// Architecture: theme palettes (Cosmic / Industrial / PsyTech) are
// CSS variables applied to `:root[data-theme="..."]`, swapped at
// runtime by the inline theme-bootstrap script in index.html. The
// safelist keeps the palette-mapped color tokens (bg-bg / bg-primary
// / bg-accent / bg-panel and the text-/border- siblings) in the JIT
// output REGARDLESS of whether the current source statically
// references them; this is defensive against any future route that
// constructs class names dynamically (e.g. `bg-${theme}`).
//
// The safelist is intentionally inside the `export default` object
// (not as a leading top-level constant) — Tailwind v3 only honors
// safelist entries that live on the config object itself.
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    'bg-bg',
    'bg-primary',
    'bg-accent',
    'bg-panel',
    'text-bg',
    'text-primary',
    'text-accent',
    'text-text',
    'border-primary',
    'border-accent',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--lekk-bg)',
        primary: 'var(--lekk-primary)',
        accent: 'var(--lekk-accent)',
        text: 'var(--lekk-text)',
        panel: 'var(--lekk-panel)',
      },
      fontFamily: {
        display: ['Orbitron', 'Audiowide', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 28px -4px var(--lekk-primary), 0 0 12px -2px var(--lekk-accent)',
        crystal: 'inset 0 0 24px -6px var(--lekk-primary)',
      },
      animation: {
        'wave-pulse': 'wavePulse 2.4s ease-in-out infinite',
        'crystal-shimmer': 'crystalShimmer 6s linear infinite',
        'orb-float': 'orbFloat 14s ease-in-out infinite',
      },
      keyframes: {
        wavePulse: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.95', transform: 'scale(1.04)' },
        },
        crystalShimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-12px,0)' },
        },
      },
    },
  },
  plugins: [],
};
