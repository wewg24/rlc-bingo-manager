// =====================================
// sw.js - SIMPLIFIED SERVICE WORKER
// No more version complications
// =====================================

const CACHE_NAME = 'rlc-bingo-cache-v1';

const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './css/wizard.css', 
    './css/dark-mode.css',
    './js/config.js',
    './js/app.js',
    './js/calculations.js',
    './js/wizard.js',
    './js/offline.js',
    './js/sync.js',
    './manifest.json'
];

self.addEventListener('install', event => {
  // Take control immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Clean up any old caches
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
  // Take control of all pages
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network first, fall back to cache for offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we got a good response, update the cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});
