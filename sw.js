const CACHE_NAME = 'operator';

// قائمة بجميع ملفات اللعبة والمكتبات الخارجية المطلوبة للعمل أوفلاين
const ASSETS = [
const ASSETS = [
  '/THE-LAST-OPERATO-R-/index.html',
  '/THE-LAST-OPERATO-R-/manifest.json',
  '/THE-LAST-OPERATO-R-/icon.png',
  '/THE-LAST-OPERATO-R-/sw.js'
'
]

// تثبيت ملف الـ Service Worker وحفظ الملفات في الـ Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 تم حفظ ملفات Operator أوفلاين بنجاح!');
      return cache.addAll(ASSETS);
    })
  );
});

// استدعاء الملفات المحفوظة عند تصفح اللعبة أوفلاين
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // إرجاع الملف المحفوظ إذا وجد، وإلا جلبه من السيرفر
      return response || fetch(e.request).catch(() => {
        // حماية إضافية في حال عدم توفر الإنترنت تماماً لصفحات معينة
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
