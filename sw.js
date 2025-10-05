// sw.js - განახლებული ვერსია
const CACHE_NAME = 'spy-cache-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // თუ გაქვთ ხმის ფაილი, დაამატეთ:
  // 'https://www.soundjay.com/buttons/sounds/beep-07.mp3'
];

// --- Install Event ---
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache resources:', err);
      })
  );
});

// --- Activate Event ---
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// --- Fetch Event: Stale-While-Revalidate სტრატეგია ---
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        
        // დაუბრუნე ქეშირებული ვერსია დაუყოვნებლივ
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // ქსელიდან ახალი ვერსია ჩაანაცვლებს ქეშს
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // თუ ქსელი ვერ მუშაობს, დააბრუნე ქეში
          return cachedResponse;
        });

        // დააბრუნე ქეშირებული ან ქსელური პასუხი
        return cachedResponse || fetchPromise;
      });
    })
  );
});