/**
 * 🤖 ROBOTS.TXT
 * 
 * Hướng dẫn các search engine và AI bots crawl trang web
 * Tối ưu cho: Google, Bing, ChatGPT, Claude, Perplexity
 */

export default function robots() {
  return {
    rules: [
      // Rule cho tất cả bot (mặc định)
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/edit-profile/',
          '/practice/',
          '/compete/',
          '/certificate/',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
      // Rule riêng cho Googlebot
      {
        userAgent: 'Googlebot',
        allow: '/',
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
        allow: '/',
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
          '/tool/',
          '/blog/',
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
          '/tool/',
          '/blog/',
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
          '/tool/',
          '/blog/',
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
          '/tool/',
          '/blog/',
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
          '/tool/',
          '/blog/',
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
          '/tool/',
          '/blog/',
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
          '/tool/',
          '/blog/',
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
