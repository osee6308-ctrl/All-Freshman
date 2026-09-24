const CACHE_VERSION = 'v14-2026-09-23';
const CACHE_NAME = 'freshman-hub-' + CACHE_VERSION;
const CACHE_URLS = ['./','./index.html','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.all(CACHE_URLS.map(url => cache.add(url).catch(err => console.log('Skip:', url, err))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (url.endsWith('content.json')) { event.respondWith(fetch(event.request, { cache: 'no-store' }).then(response => { const clone = response.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, clone)); return response; }).catch(() => caches.match(event.request))); return; }
  if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request).then(response => { const clone = response.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, clone)); return response; }).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))); return; }
  event.respondWith(caches.match(event.request).then(cached => { if (cached) return cached; return fetch(event.request).then(response => { if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) { const clone = response.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, clone)); } return response; }).catch(() => new Response('Offline', { status: 503 })); }));
});
