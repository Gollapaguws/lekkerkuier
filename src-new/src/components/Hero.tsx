import { useRef, useEffect } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  da: number;
}

interface HeroProps {
  playing: boolean;
  onTogglePlay: () => void;
  stationName?: string;
  tagline?: string;
}

export function Hero({ playing, onTogglePlay, stationName = 'Lekker Kuier', tagline = 'PsyTech Fusion Radio • 24/7' }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const maxParticles = 50;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        da: (Math.random() - 0.5) * 0.005,
      });
    }

    // Pause when tab hidden
    const onVis = () => { if (document.hidden) return; animId = requestAnimationFrame(animate); };
    document.addEventListener('visibilitychange', onVis);

    const animate = () => {
      if (document.hidden) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.da;
        if (p.alpha <= 0.05 || p.alpha >= 0.7) p.da *= -1;

        // Wrap around
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(179,136,255,${p.alpha})`;
        ctx.fill();
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(86,210,255,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 overflow-hidden">
      <canvas ref={canvasRef} className="particles-canvas" />

      <div className="relative z-10 max-w-3xl mx-auto stagger">
        {/* Tagline */}
        <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[var(--lk-primary)] mb-4">
          {tagline}
        </p>

        {/* Station name */}
        <h1 className="heading text-4xl sm:text-5xl md:text-7xl mb-4">
          {stationName}
        </h1>

        {/* Subtitle */}
        <p className="text-[var(--lk-text-muted)] text-sm md:text-base max-w-md mx-auto mb-10">
          Transcend the vibration. Plug into Mzansi's 24/7 stream of psytrance, industrial, and crystalline soundscapes.
        </p>

        {/* Play button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="hero-play-btn mx-auto"
          aria-label={playing ? 'Pause stream' : 'Play stream'}
        >
          <span className="relative z-10 heading text-4xl text-[var(--lk-bg)]">
            {playing ? '❚❚' : '▶'}
          </span>
        </button>

        <p className="text-xs text-[var(--lk-text-muted)] mt-6">
          {playing ? 'Streaming live — tap to pause' : 'Tap to start the vibe'}
        </p>
      </div>
    </section>
  );
}
