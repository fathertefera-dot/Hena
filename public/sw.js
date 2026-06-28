// public/sw.js
const CACHE_NAME = 'iku-sweet-cake-v2';

// Static pages only — API/Supabase requests are excluded
const STATIC_URLS = ['/', '/products'];

// ============================
// INSTALL — cache static pages
// ============================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS))
  );
  // New SW takes control immediately without waiting for old one
  self.skipWaiting();
});

// ============================
// ACTIVATE — clean up old caches
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ============================
// FETCH — smart caching strategy
// ============================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache: POST requests, Supabase API, auth calls
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // For static pages: cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          // Only cache valid responses
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
      );
    })
  );
});
