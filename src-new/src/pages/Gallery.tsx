import { useState, useCallback, useEffect } from 'react';

interface GalleryImage {
  alt: string;
  category: 'events' | 'studio' | 'community' | 'art';
  date: string;
}

const IMAGES: GalleryImage[] = [
  { alt: 'Psytrance festival main stage at night', category: 'events', date: '2026-06-15' },
  { alt: 'DJ Solaris mixing in the studio', category: 'studio', date: '2026-07-01' },
  { alt: 'Outdoor psytrance gathering sunset', category: 'community', date: '2026-05-20' },
  { alt: 'Album cover art — geometric patterns', category: 'art', date: '2026-04-10' },
  { alt: 'Live broadcast setup with equipment', category: 'studio', date: '2026-06-28' },
  { alt: 'Community dance circle at event', category: 'community', date: '2026-05-22' },
  { alt: 'Bass Cathedral performing live', category: 'events', date: '2026-06-18' },
  { alt: 'Neon mandala projection art', category: 'art', date: '2026-07-05' },
  { alt: 'Studio monitors and mixing desk', category: 'studio', date: '2026-06-30' },
  { alt: 'Full moon gathering crowd shot', category: 'community', date: '2026-04-15' },
  { alt: 'DJ Luna at warehouse party', category: 'events', date: '2026-07-10' },
  { alt: 'Fractal artwork — deep psychedelic', category: 'art', date: '2026-07-08' },
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'events', label: '🎪 Events' },
  { key: 'studio', label: '🎛 Studio' },
  { key: 'community', label: '💃 Community' },
  { key: 'art', label: '🎨 Art' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

function Lightbox({ image, onClose, onPrev, onNext, hasPrev, hasNext }: {
  image: GalleryImage;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={onClose}
        className="lightbox-close"
        aria-label="Close lightbox"
      >
        ✕
      </button>

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="lightbox-nav lightbox-prev"
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-image-placeholder">
          <div className="lightbox-placeholder-inner">
            <span className="text-6xl mb-4">
              {image.category === 'events' ? '🎪' : image.category === 'studio' ? '🎛' : image.category === 'community' ? '💃' : '🎨'}
            </span>
            <p className="text-lg text-white/80">{image.alt}</p>
            <p className="text-sm text-white/40 mt-2">{image.date}</p>
            <span className="text-xs text-white/20 mt-4">{image.category}</span>
          </div>
        </div>
      </div>

      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="lightbox-nav lightbox-next"
          aria-label="Next image"
        >
          ›
        </button>
      )}
    </div>
  );
}

export function Gallery() {
  const [filter, setFilter] = useState<CategoryKey>('all');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = filter === 'all'
    ? IMAGES
    : IMAGES.filter((img) => img.category === filter);

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevImage = useCallback(() => {
    setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);
  const nextImage = useCallback(() => {
    setLightboxIdx((i: number | null) => {
      if (i === null) return i;
      const max = filter === 'all' ? IMAGES.length : IMAGES.filter((img) => img.category === filter).length;
      return i < max - 1 ? i + 1 : i;
    });
  }, [filter]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-lg text-4xl md:text-5xl mb-4">
            <span className="text-[var(--lk-primary)]">Gallery</span>
          </h1>
          <p className="text-[var(--lk-text-muted)] max-w-xl mx-auto text-lg">
            Moments from our events, behind the scenes in the studio, and artwork from our community.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? 'bg-[var(--lk-primary)] text-white shadow-lg shadow-[var(--lk-primary)]/25'
                  : 'bg-white/5 text-[var(--lk-text-muted)] hover:bg-white/10 hover:text-[var(--lk-text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((img, i) => (
            <button
              key={`${img.alt}-${i}`}
              onClick={() => openLightbox(i)}
              className="gallery-card group"
              aria-label={`View: ${img.alt}`}
            >
              <div className="gallery-image-placeholder">
                <span className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
                  {img.category === 'events' ? '🎪' : img.category === 'studio' ? '🎛' : img.category === 'community' ? '💃' : '🎨'}
                </span>
              </div>
              <div className="gallery-card-info">
                <p className="text-sm font-medium text-white/90 line-clamp-2 group-hover:text-[var(--lk-primary)] transition-colors">
                  {img.alt}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[var(--lk-text-muted)] capitalize">{img.category}</span>
                  <span className="text-xs text-white/25">{img.date}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--lk-text-muted)] text-lg">No images found in this category.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-[var(--lk-primary)] hover:text-[var(--lk-accent)] transition-colors text-sm"
            >
              Show all images →
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <Lightbox
          image={filtered[lightboxIdx]}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          hasPrev={lightboxIdx > 0}
          hasNext={lightboxIdx < filtered.length - 1}
        />
      )}


    </div>
  );
}
