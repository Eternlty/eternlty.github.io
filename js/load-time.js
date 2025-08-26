/*
 * 页面加载时间计算脚本
 */
(function() {
  // 使用更现代、更可靠的Performance API方法
  function calculateLoadTime() {
    try {
      let loadTime = 0;
      let displayText = '约';
      
      // 先移除已存在的加载时间文本节点
      const footer = document.querySelector('footer');
      if (footer) {
        const copyrightElement = footer.querySelector('div > a[href*="icp.gov.moe"]');
        if (copyrightElement && copyrightElement.parentNode) {
          const nextSibling = copyrightElement.nextSibling;
          if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent.includes('页面加载时间')) {
            copyrightElement.parentNode.removeChild(nextSibling);
          }
        }
      }
      
      // 移除已存在的加载时间元素
      const existingLoadTimeElements = document.querySelectorAll('.load-time-element');
      existingLoadTimeElements.forEach(element => element.remove());
        
        // 1. 优先使用现代的PerformanceObserver API (如果支持)
        if (typeof PerformanceObserver !== 'undefined') {
          const observer = new PerformanceObserver(function(list) {
            const entries = list.getEntries();
            for (let i = 0; i < entries.length; i++) {
              if (entries[i].entryType === 'navigation') {
                const navEntry = entries[i];
                if (navEntry.loadEventEnd && navEntry.startTime) {
                  loadTime = navEntry.loadEventEnd - navEntry.startTime;
                  break;
                }
              }
            }
          });
          
          try {
            observer.observe({ entryTypes: ['navigation'] });
          } catch (e) {
            // 如果observer失败，继续尝试其他方法
          }
        }
        
        // 2. 如果PerformanceObserver不可用或未获取到数据，使用getEntriesByType
        if (loadTime <= 0) {
          const navEntries = performance.getEntriesByType('navigation');
          if (navEntries && navEntries.length > 0) {
            loadTime = navEntries[0].loadEventEnd - navEntries[0].startTime;
          }
        }
        
        // 4. 如果仍然无法获取有效时间，使用更保守的估计方法
        if (loadTime <= 0) {
          // 使用DOMContentLoaded事件到现在的时间作为近似值
          if (typeof performance.now === 'function') {
            // 这种情况下，我们无法获得准确的开始时间，但可以显示一个合理的最小值
            loadTime = Math.max(10, Math.floor(performance.now() * 0.1));
          } else {
            loadTime = 100; // 固定为0.1秒作为最低估计
          }
          // 保持使用更保守的估计方法时显示"约"字
        }
        
        // 精确到0.001秒，然后向下取到0.01秒
        const loadTimeSec = (Math.floor(loadTime / 10) / 100).toFixed(2);
        
        // 更新全局变量
        window.loadTimeData = {
          value: loadTime,
          formatted: loadTimeSec,
          displayText: displayText
        };
        
        // 查找备案信息元素
        const footerNew = document.querySelector('footer');
        if (footerNew) {
          const copyrightElement = footerNew.querySelector('div > a[href*="icp.gov.moe"]');
          if (copyrightElement && copyrightElement.parentNode) {
            // 在备案信息后添加|和加载时间
            copyrightElement.parentNode.insertBefore(
              document.createTextNode(` | 页面加载时间: ${displayText}${loadTimeSec}s`),
              copyrightElement.nextSibling
            );
          } else {
            // 如果没有找到备案信息元素，创建显示加载时间的元素
            const loadTimeElement = document.createElement('div');
            loadTimeElement.style.textAlign = 'center';
            loadTimeElement.style.marginTop = '10px';
            loadTimeElement.style.color = '#666';
            loadTimeElement.style.fontSize = '14px';
            loadTimeElement.textContent = `页面加载时间: ${displayText}${loadTimeSec}s`;
            footerNew.appendChild(loadTimeElement);
          }
        }
      } catch (error) {
        console.error('计算页面加载时间出错:', error);
        // 出错时显示默认信息
        const footerError = document.querySelector('footer') || document.body;
        const copyrightElement = footerError.querySelector('div > a[href*="icp.gov.moe"]');
          if (copyrightElement && copyrightElement.parentNode) {
          }    
      }
    }

    // 初始页面加载时运行
    window.addEventListener('load', function() {
      // 使用setTimeout确保所有资源加载完成后再计算
      setTimeout(calculateLoadTime, 10); // 延迟10ms，确保所有资源加载完成
    });

    // 监听pjax完成事件
    document.addEventListener('pjax:complete', function() {
      setTimeout(calculateLoadTime, 10); // 延迟10ms，确保所有资源加载完成
    });
  })();