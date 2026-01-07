'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Simple Toast Component
function Toast({ type, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} border rounded-xl p-4 shadow-xl max-w-sm animate-pulse`}>
      <div className="flex items-center gap-3">
        <span className="flex-1 text-white">{message}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>
    </div>
  );
}

// Format date theo tiếng Việt
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
  });
}

// Status Badge Component
function StatusBadge({ status }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      Draft
    </span>
  );
}

// Stats Card
function StatsCard({ label, value, color = 'purple', onClick, active }) {
  const colors = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
  };

  const baseClass = `bg-gradient-to-br ${colors[color]} border rounded-xl p-4`;
  const clickableClass = onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : '';
  const activeClass = active ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-purple-500' : '';

  return (
    <div
      className={`${baseClass} ${clickableClass} ${activeClass}`}
      onClick={onClick}
    >
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`text-sm ${colors[color].split(' ').pop()}`}>{label}</div>
    </div>
  );
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, published: 0, missingImages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState(null); // For error modal

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [imageFilter, setImageFilter] = useState(''); // '' | 'missing' | 'valid'
  const [sortBy, setSortBy] = useState('categoryOrder');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);
      if (imageFilter) params.append('imageFilter', imageFilter);

      const res = await fetch(`/api/admin/blog?${params}`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPosts(data.posts || []);
      setCategories(data.categories || []);
      setStats(data.stats || { total: 0, draft: 0, published: 0, missingImages: 0 });
    } catch (error) {
      console.error('Error fetching posts:', error);
      setToast({ type: 'error', message: 'Không thể tải danh sách bài viết' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, sortBy, sortOrder, search, imageFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Publish post
  const handlePublish = async (slug) => {
    try {
      setActionLoading(slug);
      const res = await fetch('/api/admin/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setToast({ type: 'success', message: `Đã publish bài viết "${data.post.title}"` });
      fetchPosts();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể publish bài viết' });
    } finally {
      setActionLoading(null);
    }
  };

  // Unpublish post
  const handleUnpublish = async (slug) => {
    try {
      setActionLoading(slug);
      const res = await fetch('/api/admin/blog/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setToast({ type: 'success', message: `Đã unpublish bài viết "${data.post.title}"` });
      fetchPosts();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể unpublish bài viết' });
    } finally {
      setActionLoading(null);
    }
  };

  // Get category name
  const getCategoryName = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug || '—';
  };

  // Pagination logic
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, search, imageFilter]);

  // Upload JSON post
  const handleUploadPost = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';
    setUploadErrors(null);

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/blog/upload-post', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        // Show error modal with details if there are multiple errors
        if (data.errors && data.errors.length > 0) {
          setUploadErrors({
            title: data.error,
            errors: data.errors,
            hint: data.hint
          });
        } else {
          setToast({ type: 'error', message: data.error });
        }
        return;
      }

      setToast({ 
        type: 'success', 
        message: `✅ Upload thành công: "${data.post.title}" (Draft)` 
      });
      fetchPosts();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Lỗi upload file' });
    } finally {
      setUploadLoading(false);
    }
  };

  // Copy errors to clipboard
  const copyErrorsToClipboard = () => {
    if (uploadErrors?.errors) {
      const text = uploadErrors.errors.join('\n');
      navigator.clipboard.writeText(text);
      setToast({ type: 'success', message: 'Đã copy danh sách lỗi!' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Error Modal */}
      {uploadErrors && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{uploadErrors.title}</h3>
                  <p className="text-sm text-red-400">{uploadErrors.hint}</p>
                </div>
              </div>
              <button 
                onClick={() => setUploadErrors(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Error List */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm">
                {uploadErrors.errors.map((error, i) => (
                  <div key={i} className="py-1.5 border-b border-slate-700 last:border-0">
                    <span className="text-slate-300">{error}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-slate-700 px-6 py-4 flex justify-between items-center bg-slate-800/50">
              <span className="text-sm text-slate-400">
                Tổng cộng: {uploadErrors.errors.length} lỗi
              </span>
              <div className="flex gap-3">
                <button
                  onClick={copyErrorsToClipboard}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy danh sách lỗi
                </button>
                <button
                  onClick={() => setUploadErrors(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Quản lý Blog</h1>
          <p className="text-slate-400">Quản lý bài viết, public/unpublish và kiểm soát SEO</p>
        </div>
        
        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="upload-json"
            accept=".json"
            onChange={handleUploadPost}
            className="hidden"
            disabled={uploadLoading}
          />
          <label
            htmlFor="upload-json"
            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-medium transition-all cursor-pointer shadow-lg shadow-purple-500/25 ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploadLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang upload...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload bài viết
              </>
            )}
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Tổng bài viết" value={stats.total} color="purple" />
        <StatsCard label="Đã xuất bản" value={stats.published} color="emerald" />
        <StatsCard label="Bản nháp" value={stats.draft} color="amber" />
        <StatsCard
          label="Thiếu ảnh"
          value={stats.missingImages}
          color="red"
          onClick={() => setImageFilter(imageFilter === 'missing' ? '' : 'missing')}
          active={imageFilter === 'missing'}
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="categoryOrder-asc">📁 Category + Thứ tự</option>
            <option value="createdAt-desc">Mới tạo nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="publishedAt-desc">Mới xuất bản</option>
            <option value="title-asc">Tên A-Z</option>
            <option value="title-desc">Tên Z-A</option>
          </select>
        </div>
      </div>

      {/* Filter Notice */}
      {imageFilter === 'missing' && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="text-red-400 font-medium">Đang hiển thị bài viết thiếu ảnh</span>
              <span className="text-slate-400 text-sm ml-2">({posts.length} bài)</span>
            </div>
          </div>
          <button
            onClick={() => setImageFilter('')}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Xem tất cả
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Đang tải...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400">Không có bài viết nào</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-700">
              {currentPosts.map(post => (
                <div key={post.slug} className="p-4">
                  <Link href={`/admin/blog/${post.slug}`} className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 relative">
                      {post.image && post.imageStatus === 'valid' ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Image status warning badge */}
                      {(post.imageStatus === 'missing' || post.imageStatus === 'broken') && (
                        <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" title={post.imageStatus === 'broken' ? 'Ảnh bị lỗi' : 'Thiếu ảnh'}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{post.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <StatusBadge status={post.status} />
                        <span className="text-slate-500">{getCategoryName(post.category)}</span>
                      </div>
                    </div>
                  </Link>
                  {/* Mobile Actions */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500 mr-auto">{formatDate(post.createdAt)}</span>
                    {post.status === 'draft' ? (
                      <button
                        onClick={() => handlePublish(post.slug)}
                        disabled={actionLoading === post.slug}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === post.slug ? '...' : 'Publish'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(post.slug)}
                        disabled={actionLoading === post.slug}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === post.slug ? '...' : 'Unpublish'}
                      </button>
                    )}
                    {post.status === 'published' && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Xem
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left px-4 py-4 text-sm font-medium text-slate-400 w-20">Ảnh</th>
                    <th className="text-left px-4 py-4 text-sm font-medium text-slate-400">Bài viết</th>
                    <th className="text-left px-4 py-4 text-sm font-medium text-slate-400">Danh mục</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Trạng thái</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Ngày tạo</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {currentPosts.map(post => (
                    <tr key={post.slug} className="hover:bg-slate-700/30 transition-colors">
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 relative">
                          {post.image && post.imageStatus === 'valid' ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {/* Image status warning badge */}
                          {(post.imageStatus === 'missing' || post.imageStatus === 'broken') && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg" title={post.imageStatus === 'broken' ? 'Ảnh bị lỗi' : 'Thiếu ảnh'}>
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="px-4 py-4 max-w-md">
                        <Link 
                          href={`/admin/blog/${post.slug}`}
                          className="block group"
                        >
                          <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">
                            {post.description}
                          </p>
                        </Link>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-300">
                          {getCategoryName(post.category)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={post.status} />
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-slate-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Preview */}
                        <Link
                          href={`/admin/blog/${post.slug}`}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        {/* Publish / Unpublish */}
                        {post.status === 'draft' ? (
                          <button
                            onClick={() => handlePublish(post.slug)}
                            disabled={actionLoading === post.slug}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Xuất bản"
                          >
                            {actionLoading === post.slug ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublish(post.slug)}
                            disabled={actionLoading === post.slug}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Gỡ xuất bản"
                          >
                            {actionLoading === post.slug ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            )}
                          </button>
                        )}

                        {/* View on site (only published) */}
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                            title="Xem trên website"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Pagination */}
        {!loading && posts.length > postsPerPage && (
          <div className="border-t border-slate-700 px-4 sm:px-6 py-4">
            {/* Mobile Pagination */}
            <div className="flex sm:hidden items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                ← Trước
              </button>
              <span className="text-sm text-slate-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Sau →
              </button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, posts.length)} / {posts.length} bài viết
              </div>
              <div className="flex items-center gap-2">
                {/* Previous */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, current, and adjacent pages
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, arr) => (
                    <span key={page} className="flex items-center">
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-2 text-slate-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Info */}
      <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Thông tin SEO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-4">
            <span className="text-emerald-400">✓</span>
            <div>
              <div className="text-white font-medium">Bài Published</div>
              <div className="text-slate-400">Google được index • Hiển thị trong sitemap</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-4">
            <span className="text-amber-400">✗</span>
            <div>
              <div className="text-white font-medium">Bài Draft</div>
              <div className="text-slate-400">Google KHÔNG index • Ẩn khỏi sitemap và blog</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
