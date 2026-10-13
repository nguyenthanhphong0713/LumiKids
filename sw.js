// LumiKids Service Worker - Version 2.0.0
const VERSION = 'v2.0.0';
const CACHE_NAME = `lumikids-${VERSION}`;
const ASSETS_TO_CACHE = [
  './',
  `./index.html?v=${VERSION}`,
  `./manifest.json?v=${VERSION}`,
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon.svg'
];

// Install Event - Pre-cache new assets and immediately activate
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force active immediately without waiting for browser restart
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Instantly purge all older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all open pages immediately
    })
  );
});

// Fetch Event - Network-first for HTML & dynamic requests, cache-fallback for offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  // For HTML documents and navigation: Always fetch fresh network data first to avoid stale cache
  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html') || requestUrl.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match(`./index.html?v=${VERSION}`) || caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // For static assets (images, fonts, scripts): Cache-first with network background revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
