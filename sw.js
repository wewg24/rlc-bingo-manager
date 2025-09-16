const CACHE_NAME = 'rlc-bingo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/wizard.css',
  '/css/dark-mode.css',
  '/js/config.js',
  '/js/app.js',
  '/js/wizard.js',
  '/js/calculations.js',
  '/js/offline.js',
  '/js/sync.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
