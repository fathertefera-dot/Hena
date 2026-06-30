// public/sw.js
//
// IMPORTANT: this Service Worker must NEVER cache HTML pages
// (navigation requests). Caching "/" or "/products" meant that
// once a page was cached, the browser kept showing that exact
// snapshot forever — even after Next.js had fresh data on the
// server and even after a hard refresh — because the old fetch
// handler matched the Cache before ever checking the network.
// That is what made admin settings changes (payment methods,
// business info, etc.) invisible until incognito mode.
//
// Strategy now:
//   - Navigation requests (the actual page HTML)        -> network ONLY, never cached
//   - Supabase / our own /api/* requests                -> network ONLY, never cached
//   - Next.js static build assets (/_next/static/, etc.) -> cache-first (safe: filenames are content-hashed)
//   - Everything else (RSC payload fetches, etc.)        -> network ONLY

const CACHE_NAME = 'iku-sweet-cake-v3' // bumped so every previously-installed
                                        // SW deletes its old cache (which may
                                        // contain stale "/" / "/products" HTML)

const STATIC_ASSET_PATTERNS = [
  /^\/_next\/static\//,
  /^\/_next\/image/,
  /\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|woff2?|ttf)$/,
]

function isStaticAsset(pathname) {
  return STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(pathname))
}

// ============================
// INSTALL — no precaching of HTML
// ============================
self.addEventListener('install', () => {
  self.skipWaiting()
})

// ============================
// ACTIVATE — delete every old cache (including old HTML snapshots)
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
  )
  self.clients.claim()
})

// ============================
// FETCH
// ============================
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept non-GET requests (server actions, mutations, etc.)
  if (request.method !== 'GET') {
    return
  }

  // Never cache the HTML document itself — always go to the network so
  // admin changes (settings, products, banners, orders) show up immediately.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request))
    return
  }

  // Never cache Supabase requests or our own API routes.
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Cache-first ONLY for content-hashed static build assets — safe because
  // their filename changes whenever their content changes.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Everything else (RSC payload fetches, JSON, fonts not matched above,
  // etc.) — go straight to the network so data is always fresh.
  event.respondWith(fetch(request))
})
