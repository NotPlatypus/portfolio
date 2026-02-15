// Service Worker - PWA Caching Strategy
const CACHE_NAME = 'portfolio-v1.1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.min.css',
  '/script.min.js',
  '/Pictures/lubbock.webp',
  '/Pictures/portfolio.webp',
  '/Pictures/swimming.svg',
  '/Pictures/tennis.svg',
  '/Pictures/tv.svg',
  '/Pictures/controller.svg',
  '/Pictures/music.svg',
  '/Pictures/table_tennis.svg',
  '/favicon/favicon.ico',
  '/favicon/favicon-16x16.png',
  '/favicon/favicon-32x32.png',
  '/favicon/android-chrome-192x192.png'
];

// Install - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Fetch - cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).then((response) => {
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});
