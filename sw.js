/* ======================================================================
   AHW QUIZVERSE - (c) 2026 AHW Quizverse / All VU Students.
   All rights reserved. This code, design and the MCQ database are the
   property of AHW Quizverse. Copying, re-publishing or reselling without
   written permission is prohibited. Developed for VU students' benefit.
   ====================================================================== */
/* AHW Quizverse service worker — offline-first so students can practice
   with zero internet. Core shell is pre-cached; everything else is cached
   on first use. Bump CACHE version to force a refresh. */
const CACHE = "ahw-quizverse-v1";
const CORE = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "data/mcqs.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "og-banner.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match("index.html"));   // offline fallback
    })
  );
});
