/**
 * 📄 PAGINATION COMPONENT
 * 
 * Component phân trang cho blog
 * - Server-side pagination (SEO friendly)
 * - Responsive design
 * - Hiển thị số trang thông minh
 */

import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';

/**
 * Tạo array số trang để hiển thị
 * Hiển thị tối đa 5 số, với ... ở giữa nếu cần
 */
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Luôn hiển thị trang đầu, cuối, và 3 trang xung quanh trang hiện tại
  const pages = new Set([1, totalPages]);
  
  // Thêm trang hiện tại và 1 trang trước/sau
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.add(i);
  }
  
  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  
  // Thêm dấu ... nếu có gap
  const result = [];
  for (let i = 0; i < sortedPages.length; i++) {
    if (i > 0 && sortedPages[i] - sortedPages[i - 1] > 1) {
      result.push('...');
    }
    result.push(sortedPages[i]);
  }
  
  return result;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  basePath = '/blog',
  queryParams = {} 
}) {
  if (totalPages <= 1) return null;
  
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  
  // Build URL với query params
  const buildUrl = (page) => {
    const params = new URLSearchParams(queryParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };
  
  return (
    <nav 
      className="flex items-center justify-center gap-1 sm:gap-2 mt-10 pt-8 border-t border-gray-200"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <LocalizedLink
          href={buildUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-violet-600 transition-colors"
          aria-label="Trang trước"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Trước</span>
        </LocalizedLink>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Trước</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span 
                key={`ellipsis-${index}`} 
                className="px-2 py-2 text-sm text-gray-500"
              >
                ...
              </span>
            );
          }
          
          const isCurrentPage = page === currentPage;
          
          return isCurrentPage ? (
            <span
              key={page}
              className="px-3.5 py-2 text-sm font-bold text-white bg-violet-600 rounded-lg"
              aria-current="page"
            >
              {page}
            </span>
          ) : (
            <LocalizedLink
              key={page}
              href={buildUrl(page)}
              className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-violet-600 hover:border-violet-300 transition-colors"
            >
              {page}
            </LocalizedLink>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <LocalizedLink
          href={buildUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-violet-600 transition-colors"
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </LocalizedLink>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
          <span className="hidden sm:inline">Sau</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
