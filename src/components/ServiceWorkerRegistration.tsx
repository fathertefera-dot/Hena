'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope)

            // Force the browser to check for a new sw.js right away
            // instead of waiting up to 24h (the default HTTP cache
            // behavior for service worker files). Combined with
            // skipWaiting() + clients.claim() in sw.js, this means
            // anyone with the OLD (caching) service worker installed
            // gets the new (network-only-for-pages) one on their very
            // next visit instead of continuing to see stale pages.
            registration.update()

            // If a new SW takes over (activates) while this tab is
            // open, reload once so the tab is served by the new
            // worker immediately rather than keeping the old one
            // until the user manually refreshes.
            let reloaded = false
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              if (reloaded) return
              reloaded = true
              window.location.reload()
            })
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error)
          })
      })
    }
  }, [])

  return null
}
