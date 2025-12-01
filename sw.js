const CACHE_NAME = 'spy-game-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // ყურადღება: დარწმუნდით, რომ ეს ფაილების სახელები ზუსტად ემთხვევა თქვენს პროექტს!
  '/style.css', 
  '/script.js',
  '/manifest.json'
];

// 1. ინსტალაცია (უსაფრთხო მეთოდი - სათითაოდ ცდის ფაილებს)
self.addEventListener('install', e => {
  self.skipWaiting(); // აიძულებს ახალ ვერსიას მალევე ჩაენაცვლოს
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] SPY: ქეშის გახსნა...');
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log('[SW] ჩაიწერა:', url);
        } catch (error) {
          console.error('[SW] ❌ შეცდომა! ეს ფაილი ვერ მოიძებნა:', url);
        }
      }
    })
  );
});

// 2. აქტივაცია და გასუფთავება
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. წამოღება (Network First -> Cache Fallback)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // ინტერნეტი არის: ვაბრუნებთ პასუხს და ვაახლებთ ქეშს
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        return response;
      })
      .catch(() => {
        // ინტერნეტი არ არის: ვიღებთ ქეშიდან
        return caches.match(e.request);
      })
  );
});
