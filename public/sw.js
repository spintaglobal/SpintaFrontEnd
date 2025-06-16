// Service Worker for Cambridge Test Platform
// Provides offline capability, caching, and background sync

const CACHE_NAME = 'cambridge-test-v1.2.0';
const RUNTIME_CACHE = 'cambridge-runtime-v1.2.0';
const CDN_CACHE = 'cambridge-cdn-v1.2.0';
const API_CACHE = 'cambridge-api-v1.2.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets
];

// CDN assets to cache
const CDN_ASSETS = [
  'https://cdn.cambridge-test.com/fonts/',
  'https://cdn.cambridge-test.com/images/',
  'https://cdn.cambridge-test.com/audio/',
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/passages/',
  '/api/questions/',
  '/api/test-structure',
  '/api/user-progress'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.warn('Failed to cache some static assets:', error);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== CDN_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip requests from browser extensions
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstSafe(request, CACHE_NAME));
  } else if (isCDNAsset(request)) {
    event.respondWith(staleWhileRevalidateSafe(request, CDN_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstSafe(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationHandler(request));
  } else {
    event.respondWith(staleWhileRevalidateSafe(request, RUNTIME_CACHE));
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'answer-sync') {
    event.waitUntil(syncAnswers());
  } else if (event.tag === 'progress-sync') {
    event.waitUntil(syncProgress());
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_PASSAGES':
      event.waitUntil(cachePassages(payload.passageIds));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCaches());
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(getCacheStatus().then((status) => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
      }));
      break;
  }
});

// Caching strategies with improved error handling

// Cache First - for static assets (with safety checks)
async function cacheFirstSafe(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && networkResponse.status < 400) {
      // Only cache successful responses
      try {
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache response:', request.url, cacheError);
        // Continue without caching
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Cache first failed for:', request.url, error);
    // Return a basic fetch as fallback
    return fetch(request);
  }
}

// Network First - for API requests (with safety checks)
async function networkFirstSafe(request, cacheName, timeout = 3000) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      // Try network with timeout
      const networkPromise = fetch(request);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), timeout);
      });
      
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      
      if (networkResponse.ok && networkResponse.status < 400) {
        // Update cache with fresh data
        try {
          await cache.put(request, networkResponse.clone());
        } catch (cacheError) {
          console.warn('Failed to cache API response:', request.url, cacheError);
        }
        
        // If this is user data, clear background sync queue
        if (isUserDataRequest(request)) {
          clearSyncQueue(request);
        }
      }
      
      return networkResponse;
    } catch (error) {
      console.warn('Network first fallback to cache for:', request.url, error);
      
      // Fallback to cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline page for navigation requests
      if (isNavigationRequest(request)) {
        return getOfflinePage();
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Network first completely failed for:', request.url, error);
    return new Response('Service temporarily unavailable', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Stale While Revalidate - for CDN assets and runtime cache (with safety checks)
async function staleWhileRevalidateSafe(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Fetch fresh version in background (with error handling)
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok && networkResponse.status < 400) {
        try {
          cache.put(request, networkResponse.clone());
        } catch (cacheError) {
          console.warn('Failed to cache during stale-while-revalidate:', request.url, cacheError);
        }
      }
      return networkResponse;
    }).catch((error) => {
      console.warn('Stale while revalidate fetch failed:', request.url, error);
      return null;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
      // Start background fetch but don't wait for it
      fetchPromise;
      return cachedResponse;
    }
    
    // Otherwise wait for network
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // If all fails, return a basic error response
    return new Response('Resource temporarily unavailable', { 
      status: 503, 
      statusText: 'Service Temporarily Unavailable' 
    });
  } catch (error) {
    console.error('Stale while revalidate completely failed for:', request.url, error);
    return new Response('Resource unavailable', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Navigation handler with offline fallback
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.warn('Navigation request failed, serving offline page:', error);
    return getOfflinePage();
  }
}

// Utility functions

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/static/') || 
         url.pathname.includes('.js') || 
         url.pathname.includes('.css') || 
         url.pathname.includes('.ico');
}

function isCDNAsset(request) {
  const url = new URL(request.url);
  return CDN_ASSETS.some(cdn => url.href.startsWith(cdn)) ||
         url.hostname.includes('cdn.');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return CACHEABLE_APIS.some(api => url.pathname.startsWith(api));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function isUserDataRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/api/answers') || 
         url.pathname.includes('/api/progress') ||
         url.pathname.includes('/api/user');
}

// Background sync functions

async function syncAnswers() {
  try {
    const syncData = await getStoredSyncData('answers');
    
    for (const item of syncData) {
      try {
        const response = await fetch('/api/answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removeSyncData('answers', item.id);
          console.log('Successfully synced answer data:', item.id);
        }
      } catch (error) {
        console.error('Failed to sync answer:', item.id, error);
      }
    }
  } catch (error) {
    console.error('Answer sync failed:', error);
    throw error;
  }
}

async function syncProgress() {
  try {
    const syncData = await getStoredSyncData('progress');
    
    for (const item of syncData) {
      try {
        const response = await fetch('/api/progress', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removeSyncData('progress', item.id);
          console.log('Successfully synced progress data:', item.id);
        }
      } catch (error) {
        console.error('Failed to sync progress:', item.id, error);
      }
    }
  } catch (error) {
    console.error('Progress sync failed:', error);
    throw error;
  }
}

// IndexedDB operations for sync queue

async function getStoredSyncData(type) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CambridgeTestSync', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([type], 'readonly');
      const store = transaction.objectStore(type);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('answers')) {
        db.createObjectStore('answers', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function removeSyncData(type, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CambridgeTestSync', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function clearSyncQueue(request) {
  // Clear related items from sync queue when successfully synced
  const url = new URL(request.url);
  if (url.pathname.includes('/api/answers')) {
    // Clear answer sync queue
    const syncData = await getStoredSyncData('answers');
    for (const item of syncData) {
      await removeSyncData('answers', item.id);
    }
  }
}

// Passage pre-caching
async function cachePassages(passageIds) {
  const cache = await caches.open(CDN_CACHE);
  
  for (const passageId of passageIds) {
    try {
      const metaUrl = `https://cdn.cambridge-test.com/passages/${passageId}/meta.json`;
      const textUrl = `https://cdn.cambridge-test.com/passages/${passageId}/text.json`;
      
      await Promise.all([
        cache.add(metaUrl),
        cache.add(textUrl)
      ]);
      
      console.log('Cached passage:', passageId);
    } catch (error) {
      console.warn('Failed to cache passage:', passageId, error);
    }
  }
}

// Cache management
async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('All caches cleared');
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = {
      size: keys.length,
      items: keys.map(key => key.url)
    };
  }
  
  return status;
}

// Offline page
async function getOfflinePage() {
  const cache = await caches.open(CACHE_NAME);
  const offlinePage = await cache.match('/offline.html');
  
  if (offlinePage) {
    return offlinePage;
  }
  
  // Fallback offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cambridge Test - Offline</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: system-ui, sans-serif;
          background: linear-gradient(135deg, #1e3a8a, #7c3aed);
          color: white;
          margin: 0;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 500px;
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; line-height: 1.6; opacity: 0.9; }
        .status {
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📡 You're Offline</h1>
        <p>
          Don't worry! Your progress is saved locally and will sync 
          automatically when you're back online.
        </p>
        <div class="status">
          <p>
            🔄 Background sync is active<br>
            💾 Your data is safe
          </p>
        </div>
      </div>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html'
    }
  });
}

console.log('Cambridge Test Service Worker loaded successfully'); 