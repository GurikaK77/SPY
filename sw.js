// *** 1. ქეშის ვერსია და ფაილების სია ***
// !!! გაზარდეთ ეს ნომერი ყოველ ჯერზე, როცა კოდს შეცვლით (მაგ., v5 -> v6) !!!
const CACHE_NAME = 'spy-cache-v5'; 
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  // თუ იყენებთ, დაამატეთ ხმის ფაილის ლინკიც
  'https://www.soundjay.com/buttons/sounds/beep-07.mp3' 
];

// --- Install Event: ქეშის შექმნა და ფაილების შენახვა ---
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

// --- Activate Event: ძველი ქეშების გასუფთავება (უზრუნველყოფს განახლებას!) ---
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // თუ ქეშის სახელი არ არის თეთრ სიაში (ანუ ძველი ვერსიაა), წაშალე
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});


// --- Fetch Event: ქსელიდან თუ არა -> ქეშიდან ---
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 1. თუ ქეშშია, დააბრუნე ქეშიდან
        if (response) {
          return response;
        }

        // 2. თუ ქეშში არ არის, სცადე ქსელიდან ჩამოტვირთვა
        return fetch(event.request)
          .then(fetchResponse => {
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // ვალიდური პასუხი ქეშში შეინახე
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });

            return fetchResponse;
          })
          .catch(() => {
            // 3. თუ ქსელიდან ჩამოტვირთვა ვერ მოხერხდა (ოფლაინ ხართ),
            // დააბრუნე ქეშიდან index.html
            return caches.match('/index.html');
          });
      })
  );
});