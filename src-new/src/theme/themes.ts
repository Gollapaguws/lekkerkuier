// themes.ts — STUB. The real ThemeProvider + useTheme implementation
// lives in ./themes.tsx (which is named `.tsx` because it returns a JSX
// element). This `.ts` file is kept as a no-op stub so the bundler
// doesn't try to resolve `./theme/themes` (no extension) to a file with
// JSX that can't be parsed as TypeScript.
//
// CONSUMERS (must all import with explicit `.tsx` extension):
//   - src/main.tsx                       → import { ThemeProvider } from './theme/themes.tsx'
//   - src/components/VibePicker.tsx      → import { useTheme, THEMES, ThemeName } from '../theme/themes.tsx'
//
// DO NOT REVERT any consumer import back to `./theme/themes` (extension-
// less) without ALSO deleting this stub. Vite's resolve.extensions order
// is `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` — `.ts`
// is checked BEFORE `.tsx`, so an extension-less import resolves to
// THIS stub (which is empty) → TS2305 'no exported member' + runtime
// crash with `useTheme is undefined`.
//
// If you want a single canonical entry (no stub), do BOTH:
//   1. Delete this stub file.
//   2. Revert main.tsx AND VibePicker.tsx imports to `./theme/themes`.
// Partial migration produces a broken build — Vite resolves extension-
// less `./theme/themes` to the stub, not the .tsx implementation.
//
// Audit (run this grep after any future author adds a 3rd theme
// consumer; result MUST be empty — every theme/* import should use
// the explicit .tsx extension so the resolver picks the impl, not
// this stub):
//   grep -rE "from ['\"][./]*theme/themes['\"]" src/ | grep -v 'themes\.tsx'
//
// DO NOT add JSX here — the file is .ts and would re-trigger TS1005.
export {};
