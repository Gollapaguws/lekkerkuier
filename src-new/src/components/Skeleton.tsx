interface SkeletonProps {
  rows?: number;
  variant?: 'card' | 'list' | 'grid';
  className?: string;
}

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 rounded ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function Skeleton({ rows = 5, variant = 'list', className = '' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="glass-card p-5 flex items-start gap-4" style={{ animationDelay: `${i * 80}ms` }}>
            <Shimmer className="w-14 h-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
              <Shimmer className="h-3 w-2/3" />
            </div>
            <div className="flex-shrink-0 space-y-2">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3" style={{ animationDelay: `${i * 60}ms` }}>
            <Shimmer className="w-full aspect-video rounded-lg" />
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4" style={{ animationDelay: `${i * 50}ms` }}>
          <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="h-3.5 w-2/3" />
            <Shimmer className="h-3 w-1/3" />
          </div>
          <Shimmer className="h-3 w-10 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="text-center mb-10">
          <Shimmer className="h-10 w-64 mx-auto mb-4 rounded" />
          <Shimmer className="h-5 w-96 mx-auto rounded" />
        </div>
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton rows={6} variant="list" />
      </div>
    </div>
  );
}
