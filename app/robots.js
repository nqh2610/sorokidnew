/**
 * 🤖 ROBOTS.TXT
 * 
 * Hướng dẫn các search engine crawl trang web
 */

export default function robots() {
  return {
    rules: [
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
    ],
    sitemap: 'https://sorokid.com/sitemap.xml',
  };
}
