import { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  playing: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function AudioVisualizer({ playing, audioRef }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;

    let animId: number;
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaElementAudioSourceNode | null = null;

    const setup = () => {
      try {
        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
      } catch {
        // AudioContext already created for this element
        return;
      }
    };

    const draw = () => {
      if (!canvas || !analyser) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const c = canvas.getContext('2d');
      if (!c) return;
      c.scale(dpr, dpr);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      c.clearRect(0, 0, w, h);

      const barCount = 48;
      const barWidth = (w / barCount) * 0.7;
      const gap = (w / barCount) * 0.3;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const barHeight = value * h * 0.9 + 2;
        const x = i * (barWidth + gap);
        const y = h - barHeight;

        // Gradient from primary to accent based on frequency
        const ratio = i / barCount;
        const r = Math.round(86 + ratio * (179 - 86));
        const g = Math.round(210 + ratio * (136 - 210));
        const b = Math.round(255 + ratio * (255 - 255));

        c.fillStyle = `rgba(${r},${g},${b},${0.4 + value * 0.6})`;
        c.beginPath();
        c.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        c.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    setup();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
    };
  }, [audioRef, playing]);

  if (!playing) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="h-20 flex items-end justify-center gap-[3px] opacity-30">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-[var(--lk-primary)]/20"
              style={{ height: `${Math.max(4, Math.sin(i * 0.3) * 16 + 16)}px` }}
            />
          ))}
        </div>
        <p className="text-center text-[10px] text-[var(--lk-text-muted)] mt-2">
          Audio visualizer — press play to activate
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <canvas
        ref={canvasRef}
        className="visualizer-canvas w-full h-20"
        aria-label="Audio frequency visualizer"
      />
    </div>
  );
}
