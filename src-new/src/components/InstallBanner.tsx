import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    try {
      if (sessionStorage.getItem('lk-pwa-dismissed')) {
        setDismissed(true);
        return;
      }
    } catch {}

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery.matches) {
      setDismissed(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
    setDismissed(true);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setDismissed(true);
    try {
      sessionStorage.setItem('lk-pwa-dismissed', '1');
    } catch {}
  }, []);

  if (!showBanner || dismissed) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📲</span>
          <div>
            <p className="text-sm font-medium text-white">Install Lekkerkuier</p>
            <p className="text-xs text-white/60">Add to your home screen for instant access — no app store needed.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-4 py-2 rounded-full bg-[var(--lk-primary)] text-[var(--lk-bg)] text-sm font-bold hover:bg-[var(--lk-accent)] transition-colors shadow-lg shadow-[var(--lk-primary)]/25"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 rounded-full text-white/40 hover:text-white/80 transition-colors text-sm"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
