/**
 * 🤖 ROBOTS.TXT - ĐA NGÔN NGỮ
 * 
 * Hướng dẫn các search engine và AI bots crawl trang web
 * Tối ưu cho: Google, Bing, ChatGPT, Claude, Perplexity
 * 
 * 🌍 Hỗ trợ đa ngôn ngữ:
 * - Tiếng Việt: /, /blog/, /tool/, /pricing
 * - Tiếng Anh: /en/, /en/blog/, /en/tool/, /en/pricing
 */

export default function robots() {
  return {
    rules: [
      // Rule cho tất cả bot (mặc định)
      {
        userAgent: '*',
        allow: [
          '/',
          '/en/',          // 🌍 Trang chủ tiếng Anh
          '/blog/',
          '/en/blog/',     // 🌍 Blog tiếng Anh
          '/tool/',
          '/en/tool/',     // 🌍 Tool tiếng Anh
          '/pricing',
          '/en/pricing',   // 🌍 Pricing tiếng Anh
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/edit-profile/',
          '/learn/',       // Cần login
          '/practice/',    // Cần login
          '/compete/',     // Cần login
          '/adventure/',   // Cần login
          '/certificate/', // Cần login
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
      // Rule riêng cho Googlebot
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/en/',
          '/blog/',
          '/en/blog/',
          '/tool/',
          '/en/tool/',
          '/pricing',
          '/en/pricing',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/edit-profile/',
        ],
      },
      // Rule cho Bingbot
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/en/',
          '/blog/',
          '/en/blog/',
          '/tool/',
          '/en/tool/',
          '/pricing',
          '/en/pricing',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
        ],
      },
      // Rule cho GPTBot (ChatGPT)
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/practice/',
          '/compete/',
        ],
      },
      // Rule cho ChatGPT-User
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
      // Rule cho CCBot (Common Crawl - nhiều AI dùng)
      {
        userAgent: 'CCBot',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
      // Rule cho Anthropic (Claude)
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
      // Rule cho Google-Extended (Bard/Gemini training)
      {
        userAgent: 'Google-Extended',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
      // Rule cho PerplexityBot
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/',
          '/en/',
          '/tool/',
          '/en/tool/',
          '/blog/',
          '/en/blog/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: 'https://sorokid.com/sitemap.xml',
    host: 'https://sorokid.com',
  };
}
