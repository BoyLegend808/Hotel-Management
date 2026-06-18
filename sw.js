/**
 * Service Worker for Offline Support and Caching
 * Provides offline functionality and improves performance through caching
 */

const CACHE_NAME = 'evergreen-v1';
const RUNTIME_CACHE = 'evergreen-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/pages/public/home/',
  '/css/main.css',
  '/css/fonts.css',
  '/css/ui-utils.css',
  '/js/app.js',
  '/js/performance-utils.js',
  '/js/page-init.js',
  '/js/ui-utils.js',
  '/js/public.js',
  '/js/navbar.js',
  '/logo.png'
];

// Assets that should always be fetched from network
const NETWORK_ONLY = [
  '/api/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(asset => new Request(asset, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response before caching
          const responseToCache = response.clone();
          
          // Cache successful API responses
          if (response.ok) {
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Try to serve from cache if network fails
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving API from cache:', event.request.url);
                return cachedResponse;
              }
              // Return offline fallback for API requests
              return new Response(
                JSON.stringify({ success: false, message: 'Offline - no cached data available' }),
                { headers: { 'Content-Type': 'application/json' } }
              );
            });
        })
    );
    return;
  }
  
  // Static assets - cache first, network fallback
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache and fetch update in background
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            });
            return cachedResponse;
          }
          
          // Not in cache, fetch from network
          return fetch(event.request)
            .then((networkResponse) => {
              if (!networkResponse.ok) {
                throw new Error('Network response not ok');
              }
              
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
              return networkResponse;
            })
            .catch(() => {
              // Return offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Dynamic content - network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (!networkResponse.ok) {
          throw new Error('Network response not ok');
        }
        
        // Cache successful responses
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return networkResponse;
      })
      .catch(() => {
        // Try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving from cache:', event.request.url);
              return cachedResponse;
            }
            // Return offline page
            return caches.match('/offline.html');
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncOfflineForms());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Evergreen Estates', options)
  );
});

// Sync offline forms
function syncOfflineForms() {
  return caches.open(RUNTIME_CACHE)
    .then((cache) => {
      return cache.keys()
        .then((keys) => {
          const formKeys = keys.filter(key => 
            key.url.includes('/api/') && key.method === 'POST'
          );
          
          return Promise.all(
            formKeys.map(key => {
              return cache.match(key).then(response => response.json());
            })
          );
        });
    })
    .then((offlineForms) => {
      // Process offline forms
      offlineForms.forEach(formData => {
        // Send to server
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      });
    });
}

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.action === 'clearCache') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});