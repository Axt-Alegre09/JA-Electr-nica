const CACHE_NAME = 'ja-electronica-v1';

// Recursos críticos para cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/logo.png'
];

// Instalación - Cachea recursos
self.addEventListener('install', (event) => {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache abierto');
        return cache.addAll(urlsToCache).catch((err) => {
          console.error('SW: Error al cachear:', err);
          // Continuar aunque fallen algunos recursos
        });
      })
  );
  self.skipWaiting(); // Activa inmediatamente
});

// Activación - Limpia caches viejos
self.addEventListener('activate', (event) => {
  console.log('SW: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch - Estrategia: Network First, fallback Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es buena, clonar y guardar
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si es navegación y no hay en cache, devolver index
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});