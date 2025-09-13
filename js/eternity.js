// 随机跳转到文章功能
function toRandomPost() {
    // 显示通知
    showNotification('🎲 正在为您寻找随机文章...');
    
    // 获取所有文章的链接
    const postLinks = [];
    const postElements = document.querySelectorAll('a[href*="/posts/"]');
    
    // 筛选出有效的文章链接
    postElements.forEach(element => {
        const href = element.getAttribute('href');
        if (href && href.includes('/posts/') && !href.endsWith('/posts/') && !href.includes('#')) {
            postLinks.push(href);
        }
    });
    
    console.log('找到的文章链接:', postLinks);
    
    // 如果有文章链接，随机选择一个并跳转
    if (postLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * postLinks.length);
        const randomPostUrl = postLinks[randomIndex];
        console.log('随机选择的文章:', randomPostUrl);
        showNotification(`🎯 即将跳转到: ${randomPostUrl}`);
        window.location.href = randomPostUrl;
    } else {
        // 如果没有找到文章链接，跳转到文章列表页
        console.log('未找到文章链接，跳转到归档页');
        showNotification('❌ 未找到文章链接，跳转到归档页面');
        window.location.ref = '/archives/';
    }
}

/**
 * 清理所有缓存的函数
 * 包括浏览器缓存、Service Worker缓存、localStorage等
 */
function clearAllCaches() {
    // 显示加载提示
    const loadingMsg = '📋 正在清理所有缓存...';
    console.log(loadingMsg);
    
    // 使用更安全的通知方式
    showNotification(loadingMsg);
    
    Promise.all([
        // 1. 清理 Service Worker 缓存
        clearServiceWorkerCaches(),
        // 2. 清理浏览器本地存储
        clearLocalStorage(),
        // 3. 清理 Session Storage
        clearSessionStorage(),
        // 4. 清理 IndexedDB
        clearIndexedDB()
    ]).then(() => {
        const successMsg = '✅ 所有缓存已清理完成，即将刷新页面...';
        console.log(successMsg);
        
        showNotification(successMsg);
        
        // 延迟1秒后强制刷新页面
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }).catch(error => {
        console.error('清理缓存时出错:', error);
        const errorMsg = '⚠️ 缓存清理完成（部分可能失败），即将刷新页面...';
        
        showNotification(errorMsg);
        
        // 即使出错也要刷新页面
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    });
}

/**
 * 安全的通知显示函数
 */
function showNotification(message) {
    // 尝试优先使用 Butterfly 主题的通知系统
    if (typeof btf !== 'undefined' && btf.snackbarShow && typeof GLOBAL_CONFIG !== 'undefined' && GLOBAL_CONFIG.Snackbar) {
        try {
            btf.snackbarShow(message);
            return;
        } catch (error) {
            console.warn('使用 Butterfly 通知系统失败:', error);
        }
    }
    
    // Fallback 1: 尝试使用原生 snackbar 函数
    if (typeof snackbarShow === 'function') {
        try {
            snackbarShow(message);
            return;
        } catch (error) {
            console.warn('使用原生 snackbar 失败:', error);
        }
    }
    
    // Fallback 2: 创建自定义通知
    createCustomNotification(message);
}

/**
 * 创建自定义通知
 */
function createCustomNotification(message) {
    try {
        // 移除之前的通知
        const existingNotification = document.getElementById('custom-cache-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.id = 'custom-cache-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        // 添加动画样式
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInFromRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutToRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutToRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
        
    } catch (error) {
        console.warn('创建自定义通知失败:', error);
        // 最后的 fallback
        alert(message);
    }
}

/**
 * 清理 Service Worker 缓存
 */
async function clearServiceWorkerCaches() {
    if ('serviceWorker' in navigator) {
        try {
            // 获取所有注册的 Service Worker
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            // 注销所有 Service Worker
            for (let registration of registrations) {
                await registration.unregister();
                console.log('📋 Service Worker 已注销:', registration.scope);
            }
            
            // 清理所有缓存
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (let cacheName of cacheNames) {
                    await caches.delete(cacheName);
                    console.log('📋 已清理缓存:', cacheName);
                }
            }
            
            console.log('✅ Service Worker 缓存清理完成');
        } catch (error) {
            console.error('清理 Service Worker 缓存失败:', error);
            throw error;
        }
    }
}

/**
 * 清理 localStorage
 */
function clearLocalStorage() {
    try {
        const itemCount = localStorage.length;
        localStorage.clear();
        console.log(`✅ 已清理 localStorage （${itemCount} 项）`);
    } catch (error) {
        console.error('清理 localStorage 失败:', error);
        throw error;
    }
}

/**
 * 清理 sessionStorage
 */
function clearSessionStorage() {
    try {
        const itemCount = sessionStorage.length;
        sessionStorage.clear();
        console.log(`✅ 已清理 sessionStorage （${itemCount} 项）`);
    } catch (error) {
        console.error('清理 sessionStorage 失败:', error);
        throw error;
    }
}

/**
 * 清理 IndexedDB
 */
async function clearIndexedDB() {
    if ('indexedDB' in window) {
        try {
            // 注意：这里只能清理已知的数据库，因为没有 API 可以列出所有数据库
            // 常见的缓存数据库名称
            const commonDBNames = [
                'workbox-precache',
                'workbox-runtime',
                'workbox-strategies',
                'keyval-store'
            ];
            
            for (let dbName of commonDBNames) {
                try {
                    await deleteDatabase(dbName);
                    console.log(`✅ 已清理 IndexedDB: ${dbName}`);
                } catch (error) {
                    // 忽略不存在的数据库
                    console.log(`⚠️ IndexedDB ${dbName} 不存在或清理失败`);
                }
            }
        } catch (error) {
            console.error('清理 IndexedDB 失败:', error);
            throw error;
        }
    }
}

/**
 * 删除 IndexedDB 数据库
 */
function deleteDatabase(dbName) {
    return new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onsuccess = () => resolve();
        deleteReq.onerror = () => reject(deleteReq.error);
        deleteReq.onblocked = () => {
            console.warn(`数据库 ${dbName} 删除被阻塞`);
            // 等待一段时间后重试
            setTimeout(() => resolve(), 1000);
        };
    });
}