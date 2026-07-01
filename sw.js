const CACHE_NAME = 'ninja-saga-v1';

// قائمة بجميع ملفات اللعبة والمكتبات الخارجية المطلوبة للعمل أوفلاين
const ASSETS = [
  './index.html',
  './phone-auth.html',
  './admin.html',
  './bot.js',
  './icon.png',
  './cover.jpg',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// تثبيت ملف الـ Service Worker وحفظ الملفات في الـ Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 تم حفظ ملفات نينجا ساجا أوفلاين بنجاح!');
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
