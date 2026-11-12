// LumiKids Service Worker - Version 2.6.2
const VERSION = 'v2.6.2';
const CACHE_NAME = `lumikids-${VERSION}`;
const ASSETS_TO_CACHE = [
  './',
  `./index.html?v=${VERSION}`,
  `./manifest.json?v=${VERSION}`,
  `./css/base.css?v=${VERSION}`,
  `./css/layout.css?v=${VERSION}`,
  `./css/components.css?v=${VERSION}`,
  `./css/views/learn.css?v=${VERSION}`,
  `./css/views/bubbles.css?v=${VERSION}`,
  `./css/views/words.css?v=${VERSION}`,
  `./css/views/numbers.css?v=${VERSION}`,
  `./css/views/chests.css?v=${VERSION}`,
  `./js/app.js?v=${VERSION}`,
  `./js/core/eventBus.js?v=${VERSION}`,
  `./js/core/state.js?v=${VERSION}`,
  `./js/core/audio.js?v=${VERSION}`,
  `./js/data/curriculum.data.js?v=${VERSION}`,
  `./js/data/bubbles.data.js?v=${VERSION}`,
  `./js/data/numbers.data.js?v=${VERSION}`,
  `./js/modules/learn.module.js?v=${VERSION}`,
  `./js/modules/bubbles.module.js?v=${VERSION}`,
  `./js/modules/words.module.js?v=${VERSION}`,
  `./js/modules/numbers.module.js?v=${VERSION}`,
  `./js/modules/chest.module.js?v=${VERSION}`,
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon.svg'
];

// Install Event - Pre-cache new assets and immediately activate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Instantly purge all older cache versions and claim clients
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
      return self.clients.claim();
    })
  );
});

// Message Listener for manual cache clear and update triggers
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data.action === 'clearCache') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});

// Fetch Event - Network-First for HTML, Scripts & Styles (Zero Stale JS Bug)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  // 1. Navigation & HTML: Always Network-First with cache fallback
  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html') || requestUrl.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(`./index.html?v=${VERSION}`) || caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // 2. JavaScript, CSS, JSON: Network-First to guarantee latest code updates
  if (
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.json') ||
    event.request.destination === 'script' ||
    event.request.destination === 'style'
  ) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match(event.request, { ignoreSearch: true });
      })
    );
    return;
  }

  // 3. Static Media (Images, Fonts, Audio): Cache-First with network fallback
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
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
