// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 检查Fancybox是否已加载
  if (window.Fancybox && !window.fancyboxLightLoaded) {
    // 移除原有的绑定
    document.querySelectorAll('[data-fancybox]').forEach(el => {
      el.removeAttribute('data-fancybox');
      el.setAttribute('data-fancybox-light', '');
    });

    // 重新绑定Fancybox并应用浅色主题
    Fancybox.bind('[data-fancybox-light]', {
      theme: 'light',
      Toolbar: {
        display: {
          left: ['counter'],
          middle: [
            'zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'flipX', 'flipY', 'reset'
          ],
          right: ['autoplay', 'thumbs', 'close']
        }
      },
      Zoomable: {
        Panzoom: {
          maxScale: 4
        }
      }
    });

    window.fancyboxLightLoaded = true;
  }
});

// 移除重复的DOMContentLoaded事件监听器

// 简化主题管理器，仅保留浅色模式
const ThemeManager = {
  // 始终返回浅色模式
  getActiveTheme: function() {
    return 'light';
  },

  // 应用浅色主题样式
  applyThemeToFancybox: function() {
    const container = document.querySelector('.fancybox-container');
    const backdrop = document.querySelector('.fancybox__backdrop');
    const caption = document.querySelector('.fancybox__caption');

    if (container) {
      container.setAttribute('data-theme', 'light');
    }

    // 仅应用浅色模式背景
    if (backdrop) {
      backdrop.style.background = 'rgba(255, 255, 255, 0.9)';
    }

    // 浅色模式文字颜色
    if (caption) {
      caption.style.color = '#000000';
    }
  }
};

// 初始化Fancybox - 移除主题相关事件监听
window.fancyboxRun = function() {
  if (!window.Fancybox) return;

  // 销毁旧实例
  if (window.fancyboxInstance) {
    window.fancyboxInstance.destroy();
  }

  // 仅为文章内容图片添加Fancybox属性
  document.querySelectorAll('.post-content img, .article-img img').forEach(img => {
    if (!img.hasAttribute('data-fancybox') && img.src && img.src.trim() !== '') {
      img.setAttribute('data-fancybox', 'gallery');
      const caption = img.alt || img.src.split('/').pop().split('?')[0];
      img.setAttribute('data-caption', caption);
    }
  });

  // 创建Fancybox实例（仅浅色模式）
  window.fancyboxInstance = Fancybox.bind('[data-fancybox="gallery"]', {
    toolbar: {
      items: ["download", "close"]
    },
    caption: {
      show: true
    },
    // 简化事件处理，仅初始化时应用一次样式
    on: {
      init: () => ThemeManager.applyThemeToFancybox()
    },
    Carousel: {
      perPage: 1
    }
  });

  console.log('Fancybox已初始化（仅浅色模式）');
};

// 页面加载完成后初始化
window.addEventListener('load', () => {
  window.fancyboxRun();
});