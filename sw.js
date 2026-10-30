// The name of our cache
const CACHE = "static-v6";

// static files til offline brug
const FILES = [
  "./",
  "./index.html",
  "./assets/css/site.css",
  "./assets/js/site.js",
  "./assets/js/components/overview.js",
  "./assets/js/components/rightnow.js",
  "./assets/js/components/history.js",
  "./assets/js/components/loadprices.js",
  "./assets/js/components/settings.js",
  "./assets/img/appIcons/mainIcon.svg",
  "./assets/img/gyattmanden.jpg",
  "./assets/img/miscICONS/gear-solid-full.svg",
  "./manifest.json",
];

// 1. INSTALL: gem filerne i cache
self.addEventListener("install", (event) => {
  console.log("Service worker: install");

  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: serviceworker aktiveres og den er klar til brug  husk at lukke åbne tabs i browseren for at aktivere den nye service worker
self.addEventListener("activate", (event) => {
  console.log("Service worker: activate");
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE)
        .map((cacheName) => caches.delete(cacheName))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH: to caching strategier
//    - dog.ceo (api + billeder): NETWORK FIRST -> ny hund når vi er online, sidste hund når vi er offline
//    - alt andet (statiske filer): CACHE FIRST
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("elprisenligenu.dk")) {
    event.respondWith(networkFirst(event.request));
    console.log("Service worker: network first", event.request.url);
  } else {
    event.respondWith(cacheFirst(event.request));
    console.log("Service worker: network first", event.request.url);
  }
});

// CACHE FIRST: kig i cachen først, ellers hent fra netværket
function cacheFirst(request) {
  return caches.match(request).then((response) => {
    if (response) {
      return response;
    } else {
      return fetch(request);
    }
  });
}

// NETWORK FIRST: hent fra netværket først, ellers brug cachen
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// 4. PUSH: der kommer en besked -> vis en notifikation
self.addEventListener("push", (event) => {
  console.log("Service worker: push");
  const text = event.data ? event.data.text() : "Ny hund klar!";

  event.waitUntil(
    self.registration.showNotification("My dog", {
      body: text,
      icon: "./assets/img/dog.png",
    })
  );
});
