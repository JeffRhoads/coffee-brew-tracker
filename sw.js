self.addEventListener('install', event => {
  event.waitUntil(
      caches.open('coffee-brew-tracker-v3').then(cache => {
          return cache.addAll([
              '/index.html',
              '/manifest.json',
              '/icon.png',
              '/output.css'
          ]);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request).then(response => {
          return response || fetch(event.request);
      })
  );
});