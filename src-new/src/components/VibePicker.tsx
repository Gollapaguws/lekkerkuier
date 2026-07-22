import { useTheme, THEMES, ThemeName } from '../theme/themes.tsx';

const THEME_GLYPHS: Record<ThemeName, string> = {
  cosmic: '🌌 Cosmic',
  industrial: '⚙️ Industrial',
  psytech: '💎 PsyTech',
};

const THEME_SWATCH: Record<ThemeName, string> = {
  cosmic: '#d236ff',
  industrial: '#ff1b3a',
  psytech: '#56d2ff',
};

export function VibePicker() {
  const { theme, setTheme, cycleTheme } = useTheme();
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Vibe picker">
      <button
        type="button"
        onClick={cycleTheme}
        title={`Click to switch vibe (current: ${theme})`}
        className="text-sm px-3 py-1 rounded-full glass-panel hover:bg-primary/10"
      >
        🎚 {THEME_GLYPHS[theme]}
      </button>
      <div className="hidden md:flex gap-1" aria-hidden="true">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            aria-label={`Switch to ${t}`}
            className={`w-3 h-3 rounded-full border ${theme === t ? 'border-primary' : 'border-white/20'}`}
            style={{ background: THEME_SWATCH[t] }}
          />
        ))}
      </div>
    </div>
  );
}
