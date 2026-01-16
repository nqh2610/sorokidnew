/**
 * 🗂️ NAMESPACE SCHEMA CONFIG
 * 
 * Định nghĩa mapping giữa routes và namespaces
 * Dùng cho lazy loading dictionary theo route
 * 
 * @version 1.0.0
 */

/**
 * Danh sách tất cả namespaces
 */
export const NAMESPACES = [
  'common',
  'home', 
  'seo',
  'auth',
  'dashboard',
  'learn',
  'lesson-content',
  'practice',
  'compete',
  'adventure',
  'certificate',
  'pricing',
  'tools',
  'profile',
  'admin',
  'components'
];

/**
 * Mapping route → namespaces cần load
 * Chỉ load các namespace cần thiết cho mỗi route
 */
export const ROUTE_NAMESPACES = {
  // Public pages
  '/': ['common', 'home', 'seo', 'components'],
  '/pricing': ['common', 'pricing', 'seo', 'components'],
  '/blog': ['common', 'components', 'seo'],
  
  // Tools
  '/tool': ['common', 'tools', 'seo', 'components'],
  '/tool/xuc-xac': ['common', 'tools'],
  '/tool/chia-nhom-boc-tham': ['common', 'tools'],
  '/tool/ai-la-trieu-phu': ['common', 'tools'],
  '/tool/vong-quay-may-man': ['common', 'tools'],
  '/tool/chiec-non-ky-dieu': ['common', 'tools'],
  '/tool/o-chu': ['common', 'tools'],
  '/tool/lat-hinh': ['common', 'tools'],
  '/tool/dua-thu': ['common', 'tools'],
  
  // Auth pages
  '/login': ['common', 'auth', 'components'],
  '/register': ['common', 'auth', 'components'],
  '/forgot-password': ['common', 'auth'],
  
  // Protected pages (cần login)
  '/dashboard': ['common', 'dashboard', 'components'],
  '/learn': ['common', 'learn', 'lesson-content', 'components'],
  '/practice': ['common', 'practice', 'components'],
  '/compete': ['common', 'compete', 'components'],
  '/adventure': ['common', 'adventure', 'components'],
  '/certificate': ['common', 'certificate', 'components'],
  '/profile': ['common', 'profile', 'components'],
  '/leaderboard': ['common', 'profile', 'components'],
  '/edit-profile': ['common', 'profile', 'components'],
  
  // Admin
  '/admin': ['common', 'admin', 'components'],
};

/**
 * Default namespaces khi không match route nào
 */
export const DEFAULT_NAMESPACES = ['common', 'components'];

/**
 * Lấy danh sách namespaces cho một route
 * @param {string} pathname - URL pathname
 * @returns {string[]} - Danh sách namespaces
 */
export function getNamespacesForRoute(pathname) {
  // Exact match first
  if (ROUTE_NAMESPACES[pathname]) {
    return ROUTE_NAMESPACES[pathname];
  }
  
  // Prefix match (e.g., /learn/1/1 → /learn)
  for (const [route, namespaces] of Object.entries(ROUTE_NAMESPACES)) {
    if (pathname.startsWith(route + '/') || pathname === route) {
      return namespaces;
    }
  }
  
  // Default
  return DEFAULT_NAMESPACES;
}

/**
 * Kiểm tra một namespace có trong route không
 * @param {string} pathname - URL pathname
 * @param {string} namespace - Namespace name
 * @returns {boolean}
 */
export function routeHasNamespace(pathname, namespace) {
  const namespaces = getNamespacesForRoute(pathname);
  return namespaces.includes(namespace);
}
