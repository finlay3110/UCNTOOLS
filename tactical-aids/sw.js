// Service worker for offline use in the field.
//
// Strategy differs by what is being fetched:
//   manifest.json — network first, so a newly deployed PDF shows up straight
//                   away, with the cached copy as the offline fallback.
//   PDFs / shell  — cache first, since a given file at a given path does not
//                   change; new ones arrive under new names.
//
// Bump CACHE_VERSION to force clients onto a fresh cache.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `tactical-aids-${CACHE_VERSION}`;

const SHELL = ['./', 'index.html', 'app.webmanifest', 'icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Only this app's old caches: the other UCN tools share this origin and its cache storage.
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('tactical-aids-') && k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Opaque cross-origin responses (fonts) still cache usefully.
  if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === location.origin && url.pathname.endsWith('/manifest.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request).catch(() => caches.match('index.html')));
});
