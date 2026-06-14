// AI Kids Academy — Service Worker
// Caches static shell for offline; never caches private child data or API responses

const CACHE_NAME = 'aka-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon.svg',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API routes: network only (never cache private data)
// - Auth routes: network only
// - Static assets: cache-first with network fallback
// - Navigation: network-first with offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER cache API routes, auth routes, or Supabase/Stripe calls
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('openrouter.ai')
  ) {
    return; // Let browser handle normally — no caching
  }

  // Static assets (fonts, images, manifest): cache-first
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.svg'
  ) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/offline') || caches.match('/')
      )
    );
  }
});
