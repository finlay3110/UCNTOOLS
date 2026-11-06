/* UCN Mission Companion — Service Worker
   =========================================================================
   IMPORTANT FOR FUTURE UPDATES: bump CACHE_VERSION below every time index.html
   (or any cached asset) changes and gets redeployed. This is what forces
   everyone's cached copy to be replaced with the new one — if you forget to
   bump it, people who already have the app installed/cached may keep seeing
   the old version indefinitely, since the whole point of a service worker is
   to keep working without re-fetching from the network.
   ========================================================================= */
const CACHE_VERSION = 'ucn-mission-companion-v18';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      // Use {cache:'reload'} to force a real network fetch for each asset, bypassing the
      // browser's own HTTP cache — otherwise cache.addAll()'s default fetch could be satisfied
      // by an already-stale HTTP-cached response, defeating the whole point of bumping
      // CACHE_VERSION on a new deploy.
      return Promise.all(CORE_ASSETS.map(function(url){
        return fetch(url, {cache:'reload'}).then(function(response){
          return cache.put(url, response);
        });
      }));
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    // Only this app's old caches: the other UCN tools share this origin and its cache storage.
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key.indexOf('ucn-mission-companion-') === 0 && key !== CACHE_VERSION; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

/* Stale-while-revalidate: serve the cached copy immediately (fast, and works
   fully offline), while simultaneously fetching a fresh copy in the
   background to update the cache for next time. If there's no cached copy
   yet (first ever load) and the network fails, the request just fails
   normally — there's nothing to fall back to. */
self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  if(!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      var revalidateRequest = new Request(event.request.url, {cache:'no-cache'});
      var networkFetch = fetch(revalidateRequest).then(function(response){
        if(response && response.status === 200){
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function(cache){
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function(){
        return cached;
      });
      return cached || networkFetch;
    })
  );
});
