'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminToast } from '@/components/Admin';

// Format date
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Status Badge
function StatusBadge({ status }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
      Draft
    </span>
  );
}

// Info Card
function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        {icon}
        {label}
      </div>
      <div className="text-white font-medium">{value || '—'}</div>
    </div>
  );
}

export default function AdminBlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch post
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/blog/${params.slug}`);
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setPost(data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
        setToast({ type: 'error', message: 'Không thể tải bài viết' });
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  // Publish post
  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: post.slug }),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPost({ ...post, status: 'published', publishedAt: data.post.publishedAt });
      setToast({ type: 'success', message: 'Đã xuất bản bài viết' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể xuất bản' });
    } finally {
      setActionLoading(false);
    }
  };

  // Unpublish post
  const handleUnpublish = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/blog/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: post.slug }),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPost({ ...post, status: 'draft', publishedAt: null });
      setToast({ type: 'success', message: 'Đã gỡ xuất bản bài viết' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể gỡ xuất bản' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400 mb-4">Không tìm thấy bài viết</p>
          <Link href="/admin/blog" className="text-purple-400 hover:text-purple-300">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <AdminToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Back link */}
      <Link 
        href="/admin/blog" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại danh sách
      </Link>

      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={post.status} />
              {post.status === 'published' && (
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  Xem trên website
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{post.title}</h1>
            <p className="text-slate-400">{post.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {post.status === 'draft' ? (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Xuất bản
              </button>
            ) : (
              <button
                onClick={handleUnpublish}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
                Gỡ xuất bản
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <InfoCard
          label="Danh mục"
          value={post.category}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
        />
        <InfoCard
          label="Ngày tạo"
          value={formatDate(post.createdAt)}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <InfoCard
          label="Ngày xuất bản"
          value={formatDate(post.publishedAt)}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <InfoCard
          label="Thời gian đọc"
          value={post.readingTime ? `${post.readingTime} phút` : '—'}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
      </div>

      {/* SEO Info */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Thông tin SEO
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title (SEO)</label>
            <div className="bg-slate-700/50 rounded-lg p-3 text-white">
              {post.title}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {post.title?.length || 0}/60 ký tự
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description (SEO)</label>
            <div className="bg-slate-700/50 rounded-lg p-3 text-white">
              {post.description}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {post.description?.length || 0}/160 ký tự
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Keywords</label>
            <div className="flex flex-wrap gap-2">
              {post.keywords?.length > 0 ? (
                post.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">Chưa có keywords</span>
              )}
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">URL Slug</label>
            <div className="bg-slate-700/50 rounded-lg p-3 text-slate-300 font-mono text-sm">
              /blog/{post.slug}
            </div>
          </div>

          {/* Image */}
          {post.image && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Featured Image</label>
              <div className="bg-slate-700/50 rounded-lg p-2">
                <img src={post.image} alt={post.title} className="w-full max-w-md rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Nội dung bài viết
        </h2>

        {/* Intro */}
        {post.content?.intro && (
          <div className="mb-6">
            <h3 className="text-sm text-slate-400 mb-2">Giới thiệu</h3>
            <p className="text-slate-300 bg-slate-700/30 rounded-lg p-4">
              {post.content.intro}
            </p>
          </div>
        )}

        {/* Sections */}
        {post.content?.sections?.length > 0 && (
          <div>
            <h3 className="text-sm text-slate-400 mb-2">Các phần ({post.content.sections.length})</h3>
            <div className="space-y-2">
              {post.content.sections.map((section, i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-white font-medium">
                    {i + 1}. {section.heading}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {post.faq?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm text-slate-400 mb-2">FAQ ({post.faq.length} câu hỏi)</h3>
            <div className="space-y-2">
              {post.faq.map((item, i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="text-white font-medium">{item.question}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
