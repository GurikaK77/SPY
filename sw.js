const CACHE_NAME = 'my-website-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // დაამატეთ ნებისმიერი სხვა ლოკალური ფაილი, რომელიც თქვენს ვებგვერდზეა
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // თუ მოთხოვნა ქეშშია, დააბრუნე ქეშირებული ვერსია.
        if (response) {
          return response;
        }

        // თუ არა, სცადე მისი ჩამოტვირთვა ქსელიდან.
        return fetch(event.request)
          .then(networkResponse => {
            // თუ ჩამოტვირთვა წარმატებით დასრულდა, შეინახე ახალი ქეში.
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // თუ ქსელის მოთხოვნა ვერ შესრულდა (რადგან ინტერნეტი არ არის),
            // დააბრუნე "ოფლაინ" გვერდი.
            return new Response("<h1>თქვენ ოფლაინ ხართ.</h1><p>გთხოვთ, შეამოწმეთ თქვენი ინტერნეტ კავშირი.</p>", {
              headers: { 'Content-Type': 'text/html' }
            });
          });
      })
  );
});