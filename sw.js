const CACHE_NAME = 'my-website-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // დაამატეთ ყველა სხვა ფაილი, რომელიც თქვენს საიტს სჭირდება,
  // მაგალითად: '/styles.css', '/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to pre-cache files:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // თუ მოთხოვნა ქეშშია, დააბრუნე ქეშირებული ვერსია
        if (response) {
          return response;
        }

        // თუ არა, სცადე მისი მიღება ქსელიდან
        return fetch(event.request)
          .catch(() => {
            // თუ ქსელური მოთხოვნა ვერ შესრულდა (რადგან ოფლაინ ხართ),
            // დააბრუნე ქეშირებული 'index.html' გვერდი
            return caches.match('/index.html');
          });
      })
  );
});