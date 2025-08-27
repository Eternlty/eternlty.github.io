<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Eternltyの订阅源</title>
        <style>
          :root {
            --bg-color: #f8fafc;
            --text-color: #1e293b;
            --card-bg: rgba(255, 255, 255, 0.8);
            --border-color: #e2e8f0;
            --accent-color: #4f46e5;
            --muted-color: #64748b;
            --overlay: rgba(255, 255, 255, 0.5);
            --header-text-light: #1f2937;
            --header-muted-light: #6b7280;
            --subscribe-bg-light: #f3f4f6;
            --header-text-dark: #f3f4f6;
            --header-muted-dark: #9ca3af;
            --subscribe-bg-dark: #1f2937;
            --header-text: var(--header-text-light);
            --header-muted: var(--header-muted-light);
            --subscribe-bg: var(--subscribe-bg-light);
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: #0f172a;
              --text-color: #f8fafc;
              --card-bg: rgba(30, 41, 59, 0.8);
              --border-color: #334155;
              --accent-color: #818cf8;
              --muted-color: #94a3b8;
              --overlay: rgba(15, 23, 42, 0.5);
              --header-text: var(--header-text-dark);
              --header-muted: var(--header-muted-dark);
              --subscribe-bg: var(--subscribe-bg-dark);
            }
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: var(--text-color);
            background-color: var(--bg-color);
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
          }
          
          a {
            color: var(--accent-color);
            text-decoration: none;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          
          .header {
            padding: 2rem 0;
            color: var(--header-text);
            text-align: left;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header-top {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px dashed var(--header-text);
          }
          
          .header-avatar svg {
            flex-shrink: 0;
            color: var(--header-text);
          }
          
          .header-title {
            font-size: 1.75rem;
            font-weight: 700;
          }
          
          .header-description-cn, .header-description-en {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--header-text);
            line-height: 1.6;
          }
          
          .header-subscribe {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--subscribe-bg);
            border-radius: 0.5rem;
            border-left: 4px solid var(--header-text);
            font-size: 0.95rem;
            color: var(--header-muted);
          }
          
          .header-subscribe a {
            color: var(--header-text);
            font-weight: bold;
            text-decoration: underline;
            transition: color 0.3s ease;
          }
          
          .header-subscribe a:hover {
            color: rgb(9, 147, 197);
          }
          
          .article-list {
            display: grid;
            gap: 1.5rem;
          }
          
          .article-card {
            background-color: var(--card-bg);
            backdrop-filter: blur(5px);
            border-radius: 0.8rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .article-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .article-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .article-meta {
            display: flex;
            gap: 1rem;
            color: var(--muted-color);
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
          
          .article-summary {
            margin-bottom: 1rem;
            color: var(--text-color);
          }
          
          .article-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
          }
          
          .tag {
            background-color: var(--border-color);
            color: var(--text-color);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
          }
          
          .footer {
            margin-top: 3rem;
            padding: 2rem 1rem;
            text-align: center;
            color: var(--muted-color);
            font-size: 1.0rem;
            transition: color 0.2s ease-in-out;
          }
          
          .footer-line {
            margin: 0.5rem 0;
          }
          
          .footer-line a, .footer-line span {
            color: var(--muted-color, #6b7280);
            text-decoration: none;
            margin: 0 0.5rem;
            transition: color 0.3s ease;
          }
          
          .footer-line a:hover {
            color: rgb(50, 124, 189);
          }
          
          .footer-line span {
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <div class="header-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
                  <circle cx="6" cy="18" r="2"></circle>
                  <path d="M4 4a16 16 0 0 1 16 16"></path>
                  <path d="M4 11a9 9 0 0 1 9 9"></path>
                </svg>
              </div>
              <h1 class="header-title">Eternltyの订阅源</h1>
            </div>
            <p class="header-description-cn">Eternlty的个人博客，分享技术、生活、思考</p>
            <p class="header-description-en">Eternlty's Personal Blog, Sharing technology, life, thinking</p>
            <div class="header-subscribe">
              不要诧异于异常精美的页面，你可以直接使用 RSS 阅读器比如： <strong>Feedly</strong>、<strong>Inoreader</strong>、<strong>Newsblur</strong>、<strong>Follow</strong>、<strong>RSS Reader</strong> 等工具，来订阅这个 RSS 源链接。
            </div>
          </div>
          
          <div class="article-list">
            <xsl:for-each select="atom:feed/atom:entry" xmlns:atom="http://www.w3.org/2005/Atom">
              <div class="article-card">
                <h2 class="article-title">
                  <a><xsl:attribute name="href"><xsl:value-of select="atom:link/@href"/></xsl:attribute><xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:value-of select="atom:title"/>
                  </a>
                </h2>
                <div class="article-meta">
                  <span><xsl:value-of select="atom:published"/></span>
                  <span><xsl:value-of select="atom:author/atom:name"/></span>
                </div>
                <div class="article-summary">
                  <xsl:value-of select="atom:summary"/>
                </div>
                <div class="article-tags">
                  <xsl:for-each select="atom:category">
                    <span class="tag"><xsl:value-of select="@term"/></span>
                  </xsl:for-each>
                </div>
              </div>
            </xsl:for-each>
          </div>
          
          <div class="footer">
            <div class="footer-line">
              <a href="https://blog.liushen.fun/atom.xml" target="_blank">参考自@清羽飞扬</a>
              <span>|</span>
              <a href="https://github.com/willow-god/hexo-pretty-feed" target="_blank">项目地址</a>
              <span>|</span>
              <a href="https://opensource.org/licenses/MIT" target="_blank">MIT License</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>