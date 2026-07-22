import { useState, useEffect } from 'react';

interface MiniPlayerProps {
  playing: boolean;
  onTogglePlay: () => void;
}

export function MiniPlayer({ playing, onTogglePlay }: MiniPlayerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Use IntersectionObserver to detect when the footer is out of view
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show mini-player when footer is NOT intersecting (scrolled out of view)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px 80px 0px' },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={onTogglePlay}
      className="mini-player animate-slide"
      aria-label={playing ? 'Pause' : 'Play'}
      title={playing ? 'Pause stream' : 'Play stream'}
    >
      <span className="relative">
        {playing ? '⏸' : '▶'}
        {playing && (
          <span className="absolute -inset-1 rounded-full bg-[var(--lk-primary)]/20 animate-pulse" />
        )}
      </span>
    </button>
  );
}
