// --- Fetch Event: ქსელიდან თუ არა -> ქეშიდან ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // თუ ქეშშია, დააბრუნე ქეშიდან
        if (response) {
          return response;
        }

        // თუ ქეშში არ არის, სცადე ქსელიდან ჩამოტვირთვა
        return fetch(event.request)
          .then(fetchResponse => {
            // შეამოწმეთ, არის თუ არა პასუხი ვალიდური
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
            // თუ ქსელიდან ჩამოტვირთვა ვერ მოხერხდა (მაგალითად, ოფლაინ ხართ),
            // დააბრუნე ქეშიდან index.html
            return caches.match('/index.html');
          });
      })
  );
});