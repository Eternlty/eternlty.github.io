// 简单的 PWA Service Worker - 优化缓存策略版本
const CACHE_NAME = 'eternity-blog-cache-v2';
// 只缓存确实存在的核心资源
const CORE_CACHE_URLS = [
  '/',
  '/manifest.json'
];

// 可选缓存资源（如果存在则缓存，不存在也不报错）
const OPTIONAL_CACHE_URLS = [
  '/css/index.css',
  '/js/main.js',
  '/offline/'
];

// 安全的添加缓存函数
async function addToCache(cache, urls) {
  const results = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        console.log('✅ 已缓存:', url);
        results.push({ url, success: true });
      } else {
        console.warn('⚠️ 资源不可用:', url, response.status);
        results.push({ url, success: false, error: `HTTP ${response.status}` });
      }
    } catch (error) {
      console.warn('❌ 缓存失败:', url, error.message);
      results.push({ url, success: false, error: error.message });
    }
  }
  
  return results;
}

// 安装事件
self.addEventListener('install', event => {
  console.log('📋 Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('📋 缓存已打开');
        
        // 先缓存核心资源
        console.log('📋 开始缓存核心资源...');
        const coreResults = await addToCache(cache, CORE_CACHE_URLS);
        
        // 再缓存可选资源
        console.log('📋 开始缓存可选资源...');
        const optionalResults = await addToCache(cache, OPTIONAL_CACHE_URLS);
        
        // 统计缓存结果
        const totalUrls = CORE_CACHE_URLS.length + OPTIONAL_CACHE_URLS.length;
        const successCount = [...coreResults, ...optionalResults].filter(r => r.success).length;
        
        console.log(`✅ 缓存初始化完成: ${successCount}/${totalUrls} 个资源成功缓存`);
        
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ 缓存初始化失败:', error);
        // 即使缓存失败也要继续安装
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  console.log('📋 Service Worker 激活中...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('📋 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker 已激活');
        return self.clients.claim();
      })
  );
});

// 请求拦截事件
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到，返回缓存的版本
        if (response) {
          console.log('从缓存返回:', event.request.url);
          return response;
        }

        // 否则从网络获取
        return fetch(event.request)
          .then(response => {
            // 检查是否是有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为它是一个流
            const responseToCache = response.clone();

            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                // 只缓存HTML、CSS、JS和图片文件
                if (event.request.url.match(/\.(html|css|js|png|jpg|jpeg|gif|webp|svg|ico)$/)) {
                  console.log('缓存新资源:', event.request.url);
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // 网络失败时，如果是导航请求，返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('/offline/');
            }
          });
      })
  );
});

console.log('✅ Service Worker 已加载');