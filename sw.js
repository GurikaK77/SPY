const CACHE_NAME = 'spy-fast-v2'; // სახელი შევცვალე, რომ განახლდეს
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', 
  '/script.js',
  '/manifest.json',
  // გარე რესურსების დამატება აუცილებელია აიფონისთვის:
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvC3mnXkzAiNW0DlOvHPt8luqNI9c010FotA&s',
  'https://www.soundjay.com/buttons/sounds/beep-07.mp3'
];

// 1. ინსტალაცია: ყველაფრის ჩაწერა
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Cache Opening & Preloading...');
      // სათითაოდ ვამატებთ, რომ ერთმა ერორმა სხვებს ხელი არ შეუშალოს
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.log('[SW] ვერ ჩაიწერა (არაუშავს):', url);
        }
      }
    })
  );
});

// 2. აქტივაცია: ძველების წაშლა
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

// 3. FETCH სტრატეგია: Stale-While-Revalidate (მომენტალური გახსნა)
self.addEventListener('fetch', e => {
  // მხოლოდ GET მოთხოვნებზე
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(e.request).then(cachedResponse => {
        // 1. ვიწყებთ ინტერნეტიდან წამოღებას (განახლებისთვის)
        const fetchPromise = fetch(e.request)
          .then(networkResponse => {
            // თუ წარმატებით წამოვიდა, ვაახლებთ ქეშს მომავალი შესვლისთვის
            if(networkResponse && networkResponse.status === 200) {
               cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
             // ინტერნეტი არ არის? არაუშავს.
             console.log('Offline fetch failed, using cache only');
          });

        // 2. თუ ქეშში უკვე გვაქვს ფაილი, ეგრევე ვაბრუნებთ (სწრაფი ჩატვირთვა!)
        // და არ ველოდებით ინტერნეტს. ინტერნეტი მხოლოდ ფონზე განაახლებს ქეშს.
        return cachedResponse || fetchPromise;
      });
    })
  );
});
