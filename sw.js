const CACHE_NAME = 'spy-game-dynamic'; // სახელი სულ ეს დარჩება
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap'
];

// --- Install Event ---
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// --- Activate Event ---
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
  self.clients.claim();
});

// --- Fetch Event: NETWORK FIRST (ჯერ ინტერნეტი, მერე ქეში) ---
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 1. თუ ინტერნეტი გვაქვს:
        // ვამოწმებთ, ვალიდურია თუ არა პასუხი
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // ვაახლებთ ქეშს ახალი ვერსიით მომავლისთვის
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        // ვაბრუნებთ ახალ ვერსიას
        return networkResponse;
      })
      .catch(() => {
        // 2. თუ ინტერნეტი არ გვაქვს (ოფლაინ):
        // ვაბრუნებთ ქეშირებულ ვერსიას
        return caches.match(event.request);
      })
  );
});
