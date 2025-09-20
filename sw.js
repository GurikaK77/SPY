const CACHE_NAME = 'my-website-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
   
];

// --- Install Event: ქეშირება ფაილების ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// --- Activate Event: ძველი ქეშების წაშლა ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// --- Fetch Event: ონლაინ თუ არა -> ქეში ---
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ქსელიდან წარმატებით მოვიდა → ქეშში ჩავამატოთ
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // თუ ვერ ჩატვირთა (ოფლაინ ხარ) → ქეშიდან მოიტანს
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
      })
  );
});
