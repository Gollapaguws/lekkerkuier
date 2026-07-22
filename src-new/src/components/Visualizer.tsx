import { useRef, useEffect, useCallback } from 'react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  /** Bar count — more bars = finer detail */
  bars?: number;
  /** Height multiplier */
  height?: number;
  className?: string;
}

export function Visualizer({ audioRef, playing, bars = 64, height = 80, className = '' }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const acRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(bars));

  const setup = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Create AudioContext only once
    if (!acRef.current) {
      try {
        const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = ac.createAnalyser();
        analyser.fftSize = bars * 2;
        analyser.smoothingTimeConstant = 0.8;
        const source = ac.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ac.destination);
        acRef.current = ac;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch {
        return; // browser blocked audio context
      }
    }
  }, [audioRef, bars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');

    const draw = () => {
      const ctx = ctxRef.current;
      const analyser = analyserRef.current;
      if (!ctx || !analyser || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      analyser.getByteFrequencyData(dataRef.current);
      const data = dataRef.current;

      const barW = (w / bars) * 0.7;
      const gap = (w / bars) * 0.3;
      const maxVal = 255;

      for (let i = 0; i < bars; i++) {
        const val = data[i] / maxVal;
        const barH = Math.max(3, val * h * 0.9);
        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        // Gradient from primary to accent based on frequency
        const ratio = i / bars;
        const r1 = 86;  const g1 = 210; const b1 = 255; // primary
        const r2 = 179; const g2 = 136; const b2 = 255; // accent
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        ctx.fillStyle = `rgba(${r},${g},${b},${0.5 + val * 0.5})`;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x, y, barW, barH, [4]);
        } else {
          // Fallback: manual rounded rect
          const rr = Math.min(4, barW / 2, barH / 2);
          ctx.moveTo(x + rr, y);
          ctx.lineTo(x + barW - rr, y);
          ctx.arcTo(x + barW, y, x + barW, y + rr, rr);
          ctx.lineTo(x + barW, y + barH - rr);
          ctx.arcTo(x + barW, y + barH, x + barW - rr, y + barH, rr);
          ctx.lineTo(x + rr, y + barH);
          ctx.arcTo(x, y + barH, x, y + barH - rr, rr);
          ctx.lineTo(x, y + rr);
          ctx.arcTo(x, y, x + rr, y, rr);
        }
        ctx.fill();

        // Glow on taller bars
        if (val > 0.5) {
          ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    if (playing) {
      setup();
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [playing, bars, setup]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`visualizer-canvas ${className}`}
      style={{ height }}
    />
  );
}
