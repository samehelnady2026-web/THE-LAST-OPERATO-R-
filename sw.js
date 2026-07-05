const CACHE_NAME = 'operator';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png'
];

// التثبيت
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

// استرجاع البيانات (Offline Mode)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
