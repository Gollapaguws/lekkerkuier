import type { Show } from '../api/client';

interface ShowCardProps {
  show: Show;
  variant?: 'schedule' | 'featured' | 'compact';
}

export function ShowCard({ show, variant = 'schedule' }: ShowCardProps) {
  const live = show.is_live;

  if (variant === 'compact') {
    return (
      <div className={`glass-sm px-3 py-2 flex items-center gap-2 text-xs ${live ? 'ring-1 ring-[var(--lk-primary)]' : ''}`}>
        {live && <span className="w-2 h-2 rounded-full bg-[var(--lk-primary)] animate-glow" />}
        <span className="text-[var(--lk-text-muted)]">{show.start_time}</span>
        <span className="font-semibold truncate">{show.title}</span>
        <span className="text-[var(--lk-text-muted)] ml-auto">{show.dj_name}</span>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`glass p-4 cursor-pointer hover:bg-[var(--lk-primary)]/10 transition-colors ${live ? 'ring-1 ring-[var(--lk-primary)]' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          {live && (
            <span className="flex items-center gap-1 text-xs text-[var(--lk-primary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--lk-primary)] animate-glow" />
              LIVE
            </span>
          )}
          <span className="text-xs text-[var(--lk-text-muted)] uppercase">{show.day_of_week} {show.start_time}–{show.end_time}</span>
        </div>
        <p className="heading-sm text-base mb-1">{show.title}</p>
        <p className="text-sm text-[var(--lk-text-muted)]">{show.dj_name} · {show.genre}</p>
        {show.description && <p className="text-xs text-[var(--lk-text-muted)] mt-2 line-clamp-2">{show.description}</p>}
      </div>
    );
  }

  // schedule variant (default)
  return (
    <div className={`glass-sm p-3 ${live ? 'ring-1 ring-[var(--lk-primary)]' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {live && (
          <span className="flex items-center gap-1 text-[10px] text-[var(--lk-primary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lk-primary)] animate-glow" />
            LIVE
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--lk-text-muted)]">{show.start_time}–{show.end_time}</p>
      <p className="font-semibold text-sm mt-0.5 leading-tight">{show.title}</p>
      <p className="text-xs text-[var(--lk-text-muted)] mt-0.5">{show.dj_name}</p>
      <p className="text-[11px] text-[var(--lk-primary)] mt-1">{show.genre}</p>
    </div>
  );
}
