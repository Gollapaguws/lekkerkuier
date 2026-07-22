import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="h-full flex items-center justify-center overflow-hidden relative">
      {/* Animated background bars */}
      <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-[0.06] pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-3 bg-[var(--lk-primary)] rounded-t"
            style={{
              height: `${20 + Math.sin(i * 0.4) * 40 + ((i * 13) % 35)}%`,
              animation: `bar-bounce ${1.5 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-slide">
        <p className="text-8xl md:text-9xl heading text-gradient mb-4">404</p>
        <h1 className="heading-sm text-2xl md:text-3xl mb-3">
          Lost in the <span className="text-[var(--lk-primary)]">Frequency</span>
        </h1>
        <p className="text-[var(--lk-text-muted)] max-w-md mx-auto mb-8 text-sm leading-relaxed">
          This frequency doesn't exist on our dial. The signal you're looking for has drifted into the void. Let's get you back to the broadcast.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-glow px-6 py-3 text-sm">
            🏠 Back to Home
          </Link>
          <Link to="/schedule" className="btn-outline px-6 py-3 text-sm">
            📅 View Schedule
          </Link>
          <Link to="/chat" className="btn-outline px-6 py-3 text-sm">
            💬 Join Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
