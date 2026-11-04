const VER = 'profit-v1';
const CORE = ['./', 'index.html', 'css/style.css', 'js/app.js', 'js/calc.js', 'data/exercises.json', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  // Archivos propios: red primero (para recibir actualizaciones), caché si no hay red
  if (same) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VER).then(c => c.put(req, cp)); return r; }).catch(() => caches.match(req).then(m => m || caches.match('index.html'))));
    return;
  }
  // Imágenes de ejercicios: caché primero, se guardan al verlas
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VER + '-img').then(c => c.put(req, cp)); } return r; }).catch(() => m)));
});
