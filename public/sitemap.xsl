<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap - SoroKid</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            background: white;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
          }
          .header h1 {
            color: #1a1a2e;
            font-size: 2.5rem;
            margin-bottom: 10px;
          }
          .header h1 span {
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .header p {
            color: #666;
            font-size: 1.1rem;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 20px;
            flex-wrap: wrap;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
          }
          .stat-label {
            color: #888;
            font-size: 0.9rem;
          }
          .table-container {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
          }
          th:first-child {
            border-radius: 0;
          }
          th:last-child {
            border-radius: 0;
          }
          td {
            padding: 14px 20px;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
          }
          tr:hover {
            background: #f8f9ff;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .url-cell {
            max-width: 500px;
          }
          .url-cell a {
            color: #667eea;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.2s;
          }
          .url-cell a:hover {
            color: #764ba2;
            text-decoration: underline;
          }
          .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }
          .priority-high {
            background: #e8f5e9;
            color: #2e7d32;
          }
          .priority-medium {
            background: #fff3e0;
            color: #ef6c00;
          }
          .priority-low {
            background: #fce4ec;
            color: #c2185b;
          }
          .freq {
            display: inline-block;
            padding: 4px 10px;
            background: #f0f0f0;
            border-radius: 6px;
            font-size: 0.85rem;
            color: #666;
          }
          .date {
            color: #888;
            font-size: 0.9rem;
          }
          .lang-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-right: 8px;
          }
          .lang-vi {
            background: #ffebee;
            color: #c62828;
          }
          .lang-en {
            background: #e3f2fd;
            color: #1565c0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            color: white;
          }
          .footer a {
            color: white;
            text-decoration: none;
            font-weight: 600;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          @media (max-width: 768px) {
            .header h1 {
              font-size: 1.8rem;
            }
            .stats {
              gap: 20px;
            }
            th, td {
              padding: 12px 10px;
              font-size: 0.9rem;
            }
            .url-cell {
              max-width: 200px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗺️ <span>SoroKid</span> Sitemap</h1>
            <p>Bản đồ trang web - Tối ưu SEO cho Google, Bing và AI Search</p>
            <div class="stats">
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
                <div class="stat-label">Tổng số trang</div>
              </div>
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc, '/en/')])"/></div>
                <div class="stat-label">Trang tiếng Anh</div>
              </div>
              <div class="stat">
                <div class="stat-number"><xsl:value-of select="count(sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/en/'))])"/></div>
                <div class="stat-label">Trang tiếng Việt</div>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>URL</th>
                  <th>Cập nhật</th>
                  <th>Tần suất</th>
                  <th>Ưu tiên</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <xsl:sort select="sitemap:priority" order="descending"/>
                  <tr>
                    <td><xsl:value-of select="position()"/></td>
                    <td class="url-cell">
                      <xsl:choose>
                        <xsl:when test="contains(sitemap:loc, '/en/')">
                          <span class="lang-badge lang-en">EN</span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="lang-badge lang-vi">VI</span>
                        </xsl:otherwise>
                      </xsl:choose>
                      <a href="{sitemap:loc}" target="_blank">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td class="date">
                      <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                    </td>
                    <td>
                      <span class="freq"><xsl:value-of select="sitemap:changefreq"/></span>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="sitemap:priority &gt;= 0.8">
                          <span class="priority priority-high"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:when>
                        <xsl:when test="sitemap:priority &gt;= 0.5">
                          <span class="priority priority-medium"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="priority priority-low"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>© 2026 <a href="https://sorokid.com">SoroKid</a> - Học Soroban thông minh cùng bé</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
