// 资源加载检测脚本
(function() {
  // 检查本地存储，判断今日是否已隐藏提示
  function shouldShowNotification() {
    const lastHiddenDate = localStorage.getItem('blockerNotificationHidden');
    if (!lastHiddenDate) return true;
    
    const today = new Date().toDateString();
    const lastHidden = new Date(lastHiddenDate).toDateString();
    return today !== lastHidden;
  }
  
  // 标记今日不再显示
  function setDoNotShowToday() {
    localStorage.setItem('blockerNotificationHidden', new Date().toISOString());
  }
  
  // 检查特定资源是否加载失败
  function checkResourceLoading() {
    // 只有在今日未隐藏提示的情况下才显示
    if (!shouldShowNotification()) return;
    
    // 检查busuanzi统计脚本是否加载失败
    const checkBusuanzi = function() {
      if (typeof window.busuanzi === 'undefined' && 
          typeof window.busuanzi_cn === 'undefined') {
        showNotification();
        return;
      }
    };
    
    // 检查广告拦截器特征
    const adBlockTest = document.createElement('div');
    adBlockTest.className = 'adsbox';
    adBlockTest.style = 'position: absolute; top: -1px; left: -1px; width: 1px; height: 1px; z-index: -1000;';
    document.body.appendChild(adBlockTest);
    
    setTimeout(function() {
      const adBlockDetected = (
        window.adblock === true ||
        window.adblockPlus === true ||
        window.__adblockplus === true ||
        adBlockTest.offsetHeight === 0
      );
      
      document.body.removeChild(adBlockTest);
      
      if (adBlockDetected) {
        showNotification();
      }
    }, 1000);
    
    // 2秒后再次检查busuanzi
    setTimeout(checkBusuanzi, 2000);
  }
  
  // 显示通知提示框
  function showNotification() {
    // 创建提示框
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      color: #721c24;
      padding: 15px 20px;
      border: 1px solid #f5c6cb;
      border-radius: 5px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: start;">
        <div style="margin-right: 10px; color: #721c24; font-size: 20px;">⚠️</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 5px;">检测到内容被拦截</div>
          <div style="font-size: 14px; margin-bottom: 10px;">本站部分功能可能受广告拦截器或隐私插件影响，请考虑关闭相关插件以获得最佳体验。</div>
          <div style="display: flex; gap: 8px;">
            <button id="notShowTodayBtn" style="
              background: #721c24;
              color: white;
              border: none;
              border-radius: 3px;
              padding: 4px 8px;
              font-size: 12px;
              cursor: pointer;
            ">今日不再显示</button>
          </div>
        </div>
      </div>
    `;
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 10px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #721c24;
      line-height: 1;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = function() {
      document.body.removeChild(notification);
    };
    notification.appendChild(closeBtn);
    
    document.body.appendChild(notification);
    
    // 添加'今日不再显示'按钮事件
    const notShowTodayBtn = document.getElementById('notShowTodayBtn');
    if (notShowTodayBtn) {
      notShowTodayBtn.onclick = function() {
        setDoNotShowToday();
        document.body.removeChild(notification);
      };
    }
  }
  
  // 监听DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkResourceLoading);
  } else {
    checkResourceLoading();
  }
})();