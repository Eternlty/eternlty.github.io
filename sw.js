// Service Worker for Eternlty's Blog PWA
const CACHE_NAME = 'eternlty-blog-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// 需要立即缓存的核心资源
const CORE_FILES = [
  '/',
  '/offline.html',
  '/css/index.css',
  '/css/var.css', 
  '/js/main.js',
  '/js/utils.js',
  '/manifest.json'
];

// 需要缓存的资源类型
const CACHE_PATTERNS = [
  /\.(?:js|css|html|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/,
  /^https:\/\/cdn\./,
  /^https:\/\/fonts\./
];

// 忽略缓存的资源
const IGNORE_PATTERNS = [
  /\/api\//,
  /\/admin/,
  /\?.*nocache/,
  /\/wp-admin/,
  /\/wp-login/
];

// Service Worker 安装事件
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching core files');
        return cache.addAll(CORE_FILES.map(url => new Request(url, {
          cache: 'reload'
        })));
      })
      .then(() => {
        console.log('[SW] Core files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache core files:', error);
      })
  );
});

// Service Worker 激活事件
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Cache cleanup completed');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 忽略非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 忽略不需要缓存的资源
  if (IGNORE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return;
  }
  
  // 检查是否应该缓存此资源
  const shouldCache = CACHE_PATTERNS.some(pattern => pattern.test(request.url));
  
  if (shouldCache) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.origin === location.origin) {
    // 对于同源的 HTML 页面使用网络优先策略
    if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirstStrategy(request));
    }
  }
});

// 缓存优先策略（适用于静态资源）
function cacheFirstStrategy(request) {
  return caches.open(CACHE_NAME)
    .then(cache => {
      return cache.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW] Cache hit:', request.url);
            // 后台更新缓存
            cache.add(request.clone()).catch(error => {
              console.warn('[SW] Background update failed:', error);
            });
            return cachedResponse;
          }
          
          // 缓存未命中，从网络获取
          console.log('[SW] Cache miss, fetching:', request.url);
          return fetch(request)
            .then(response => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(error => {
              console.error('[SW] Fetch failed:', error);
              throw error;
            });
        });
    });
}

// 网络优先策略（适用于 HTML 页面）
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch(error => {
      console.log('[SW] Network failed, trying cache:', request.url);
      return caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 如果缓存中也没有，返回离线页面
          return caches.match(OFFLINE_PAGE);
        });
    });
}

// 处理后台同步
self.addEventListener('sync', event => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 这里可以添加后台同步逻辑
      Promise.resolve()
    );
  }
});

// 处理推送消息
self.addEventListener('push', event => {
  console.log('[SW] Push event received');
  
  const options = {
    body: event.data ? event.data.text() : '您有新的消息',
    icon: '/img/pwa/icon-192x192.png',
    badge: '/img/pwa/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看',
        icon: '/img/pwa/icon-96x96.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/img/pwa/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Eternlty\'s Blog', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded successfully');