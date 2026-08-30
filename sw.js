/* AHW Quizverse service worker v4 - (c) 2026 AHW Quizverse / All VU Students.
   - NETWORK-FIRST (fresh code, offline fallback)
   - /__save__/name.cpp route: serves editor code with Content-Disposition
     attachment so EVERY browser saves the file with the .cpp name
   Bump CACHE name to force-invalidate old clients. */
const CACHE = "ahw-quizverse-v4";
const CORE = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/compiler.js",
  "data/mcqs.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "og-banner.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  const url = new URL(req.url);
  if (url.pathname.includes("__save__/")) { e.respondWith(caches.match(req).then(hit => hit || new Response("not found", {status:404}))); return; }
  /* network-first: fresh when online, cache when offline */
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req).then(hit => hit || caches.match("index.html"))
    )
  );
});
