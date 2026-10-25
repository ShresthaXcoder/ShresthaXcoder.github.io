// Shrestha portfolio — service worker
// Keeps the app shell so the page opens offline and can be installed.

var CACHE_NAME = 'shrestha-portfolio-v21';

var CORE_FILES = [
  './',
  './index.html',
  './game/',
  './game/index.html',
  './game/game.css',
  './game/game.js',
  './logo-art.png',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-180.png',
  './icon-512.png'
];

// Hosts whose files are worth keeping a copy of.
var CDN_HOSTS = [
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      var jobs = [];
      for (var i = 0; i < names.length; i = i + 1) {
        if (names[i] !== CACHE_NAME) {
          jobs.push(caches.delete(names[i]));
        }
      }
      return Promise.all(jobs);
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isCdnRequest(url) {
  for (var i = 0; i < CDN_HOSTS.length; i = i + 1) {
    if (url.hostname.indexOf(CDN_HOSTS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  // Page loads: try the network, fall back to the cached page when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  var url = new URL(request.url);

  // Files from this site are always taken from the network first, so an update
  // can never be hidden behind an old cached copy. The cache is the fallback
  // for when the phone is offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          if (hit) {
            return hit;
          }
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Fonts and three.js barely change, so they stay cache first for speed.
  var cacheable = isCdnRequest(url);

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) {
        return hit;
      }
      return fetch(request).then(function (response) {
        if (response && (response.status === 200 || response.status === 0) && cacheable) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
