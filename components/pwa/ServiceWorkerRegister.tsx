'use client';
import { useEffect, useState } from 'react';

// Registers the service worker and manages the PWA install prompt
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[SW] registered:', reg.scope);
        }
      })
      .catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SW] registration failed:', err);
        }
      });
  }, []);

  return null;
}

// ── Install prompt banner ─────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [prompt, setPrompt]       = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS]         = useState(false);
  const [showBanner, setShow]     = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Already dismissed this session
    if (sessionStorage.getItem('pwa-dismissed')) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after 3s on landing screen
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') dismiss();
  }

  if (!showBanner || dismissed) return null;

  return (
    <div className="pwa-banner" role="banner" aria-label="Install app">
      <div className="pwa-banner-icon">🚀</div>
      <div className="pwa-banner-content">
        <div className="pwa-banner-title">Install AI Kids Academy</div>
        {isIOS ? (
          <div className="pwa-banner-sub">
            Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to install
          </div>
        ) : (
          <div className="pwa-banner-sub">Add to your home screen for the best experience</div>
        )}
      </div>
      <div className="pwa-banner-actions">
        {!isIOS && prompt && (
          <button className="pwa-install-btn" onClick={install}>Install</button>
        )}
        <button className="pwa-dismiss-btn" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}
