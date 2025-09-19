const CACHE_NAME = 'my-website-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/image.png'
  // დაამატეთ ყველა ფაილი, რომლის დამახსოვრებაც გსურთ
];

// Service Worker-ის ინსტალაციისას
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ქსელის მოთხოვნების დასაჭერად
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // თუ მოთხოვნა ქეშშია, აბრუნებს ქეშირებულ ვერსიას
        if (response) {
          return response;
        }

        // თუ არა, აგზავნის მოთხოვნას ქსელში
        return fetch(event.request);
      })
  );
});