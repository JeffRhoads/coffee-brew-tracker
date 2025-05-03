self.addEventListener('install', event => {
  event.waitUntil(
      caches.open('coffee-brew-tracker-v2').then(cache => {
          return cache.addAll([
              '/index.html',
              '/manifest.json',
              '/icon.png',
              'https://cdn.tailwindcss.com',
              'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js',
              'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js',
              'https://cdn.jsdelivr.net/npm/@babel/standalone@7.22.5/babel.min.js',
              'https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js',
              'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth-compat.js',
              'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore-compat.js'
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