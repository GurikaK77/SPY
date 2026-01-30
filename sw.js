const CACHE_NAME = 'spy-full-v4';
const urlsToCache = [
  './',
  './index.html',
  './style.css', 
  './script.js',
  './data.js',
  './game.js',
  './state.js',
  './ui.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvC3mnXkzAiNW0DlOvHPt8luqNI9c010FotA&s',
  'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkles-300.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {}
      }
    })
  );
});

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

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(e.request).then(cachedResponse => {
        const fetchPromise = fetch(e.request)
          .then(networkResponse => {
            if(networkResponse && networkResponse.status === 200) {
               cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {});
        return cachedResponse || fetchPromise;
      });
    })
  );
});
