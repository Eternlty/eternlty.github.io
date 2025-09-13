/*
 * 页面加载时间计算脚本
 */
(function() {
  // 存储固定的加载时间，避免重复计算
  let calculatedLoadTime = null;
  
  // 使用更现代、更可靠的Performance API方法
  function calculateLoadTime() {
    try {
      // 如果已经计算过，直接使用缓存的值
      if (calculatedLoadTime !== null) {
        displayLoadTime(calculatedLoadTime);
        return;
      }
      
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
        
        // 1. 优先使用navigation timing API获取准确的加载时间
        if (performance.timing && performance.timing.loadEventEnd && performance.timing.navigationStart) {
          loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          displayText = ''; // 准确时间，不显示"约"
        }
        // 2. 如果timing API不可用，使用现代的PerformanceObserver API
        else if (typeof PerformanceObserver !== 'undefined') {
          const observer = new PerformanceObserver(function(list) {
            const entries = list.getEntries();
            for (let i = 0; i < entries.length; i++) {
              if (entries[i].entryType === 'navigation') {
                const navEntry = entries[i];
                if (navEntry.loadEventEnd && navEntry.startTime) {
                  loadTime = navEntry.loadEventEnd - navEntry.startTime;
                  displayText = ''; // 准确时间，不显示"约"
                  break;
                }
              }
            }
          });
          
          try {
            observer.observe({ entryTypes: ['navigation'] });
          } catch (e) {
            // 如果observer失败，继续尝试其他方法
            console.warn('PerformanceObserver 初始化失败:', e);
          }
        }
        // 3. 使用getEntriesByType作为备选方案
        else {
          const navEntries = performance.getEntriesByType('navigation');
          if (navEntries && navEntries.length > 0) {
            loadTime = navEntries[0].loadEventEnd - navEntries[0].startTime;
            displayText = ''; // 准确时间，不显示"约"
          }
        }
        
        // 4. 如果仍然无法获取有效时间，使用估计方法
        if (loadTime <= 0) {
          // 使用一个合理的默认值
          loadTime = 150; // 0.15秒作为默认估计
          displayText = '约'; // 估计时间，显示"约"
        }
        
        // 确保时间为正数且合理
        if (loadTime < 0 || loadTime > 30000) { // 超过30秒认为不合理
          loadTime = 150;
          displayText = '约';
        }
        
        // 缓存计算结果，避免重复计算
        calculatedLoadTime = {
          value: loadTime,
          displayText: displayText
        };
        
        displayLoadTime(calculatedLoadTime);
      } catch (error) {
        console.error('计算页面加载时间出错:', error);
        // 出错时使用默认值
        calculatedLoadTime = {
          value: 150,
          displayText: '约'
        };
        displayLoadTime(calculatedLoadTime);
      }
    }
    
    // 显示加载时间的函数
    function displayLoadTime(timeData) {
      try {
        // 精确到0.001秒
        const loadTimeSec = (timeData.value / 1000).toFixed(3);
        
        // 更新全局变量
        window.loadTimeData = {
          value: timeData.value,
          formatted: loadTimeSec,
          displayText: timeData.displayText
        };
        
        // 查找备案信息元素
        const footerNew = document.querySelector('footer');
        if (footerNew) {
          const copyrightElement = footerNew.querySelector('div > a[href*="icp.gov.moe"]');
          if (copyrightElement && copyrightElement.parentNode) {
            // 在备案信息后添加|和加载时间
            copyrightElement.parentNode.insertBefore(
              document.createTextNode(` | 页面加载时间: ${timeData.displayText}${loadTimeSec}s`),
              copyrightElement.nextSibling
            );
          } else {
            // 如果没有找到备案信息元素，创建显示加载时间的元素
            const loadTimeElement = document.createElement('div');
            loadTimeElement.className = 'load-time-element';
            loadTimeElement.style.textAlign = 'center';
            loadTimeElement.style.marginTop = '10px';
            loadTimeElement.style.color = '#666';
            loadTimeElement.style.fontSize = '14px';
            loadTimeElement.textContent = `页面加载时间: ${timeData.displayText}${loadTimeSec}s`;
            footerNew.appendChild(loadTimeElement);
          }
        }
      } catch (error) {
        console.error('显示加载时间出错:', error);
      }
    }

    // 初始页面加载时运行
    window.addEventListener('load', function() {
      // 使用setTimeout确保所有资源加载完成后再计算
      setTimeout(calculateLoadTime, 100); // 延迟100ms，确保所有资源加载完成
    });

    // 监听pjax完成事件
    document.addEventListener('pjax:complete', function() {
      // pjax跳转后重置缓存，重新计算
      calculatedLoadTime = null;
      setTimeout(calculateLoadTime, 100);
    });
  })();