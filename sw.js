// Basit servis çalışanı: uygulama kabuğunu (açılış ekranı, simgeler) önbelleğe alır.
// Portalın kendisi (Google Apps Script) her zaman internetten canlı yüklenir; öğrenci ve gözlem verileri asla önbelleğe alınmaz.
const CACHE = 'yasam-kabuk-v1';
const KABUK = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // Google'a giden istekler karışmaz
  e.respondWith(fetch(req).then(res => {
    const kopya = res.clone();
    caches.open(CACHE).then(c => c.put(req, kopya));
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
