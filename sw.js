// sw.js - Updated with cache versioning
const CACHE_VERSION = 'v11.0.4';
const CACHE_NAME = `rlc-bingo-${CACHE_VERSION}`;

const urlsToCache = [
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-50.png',
  '/assets/icons/icon-512.png',
  '/index.html',
  '/sw.js',
  '/css/style.css',
  '/css/print.css',
  '/css/wizard.css',
  '/css/dark-mode.css',
  '/js/app.js',
  '/js/calculations.js',
  '/js/camera.js',
  '/js/config.js',
  '/js/offline.js',
  '/js/sync.js',
  '/js/wizard.js',
  '/lib/localforage.min.js',
  '/lib/pdfmake.min.js',
  '/lib/vfs_fonts.min.js'
];

self.addEventListener('install', event => {
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete all caches that don't match current version
          if (cacheName.startsWith('rlc-bingo-') && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Always fetch index.html fresh to check for updates
        if (event.request.url.includes('index.html') || 
            event.request.url.endsWith('/')) {
          return fetch(event.request);
        }
        
        // Return cached version or fetch new
        return response || fetch(event.request);
      })
  );
});
