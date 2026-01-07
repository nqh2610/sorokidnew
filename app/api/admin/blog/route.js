/**
 * API Admin Blog - Lấy danh sách tất cả bài viết (cả draft và published)
 * GET /api/admin/blog
 * Query params:
 * - status: 'all' | 'draft' | 'published'
 * - category: string (slug)
 * - sortBy: 'createdAt' | 'publishedAt' | 'title'
 * - sortOrder: 'asc' | 'desc'
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const CATEGORIES_FILE = path.join(process.cwd(), 'content', 'blog', 'categories.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Kiểm tra ảnh có tồn tại trong thư mục public không
function checkImageExists(imagePath) {
  if (!imagePath) return false;
  // imagePath có dạng "/blog/ten-anh.jpg"
  const fullPath = path.join(PUBLIC_DIR, imagePath);
  return fs.existsSync(fullPath);
}

export async function GET(request) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');
    const imageFilter = searchParams.get('imageFilter'); // 'all' | 'missing' | 'valid'

    // Đọc categories
    let categories = [];
    try {
      const catData = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      categories = JSON.parse(catData).categories;
    } catch (e) {
      console.error('Error reading categories:', e);
    }

    // Đọc tất cả posts
    if (!fs.existsSync(BLOG_CONTENT_DIR)) {
      return NextResponse.json({ posts: [], categories, stats: { total: 0, draft: 0, published: 0 } });
    }

    const files = fs.readdirSync(BLOG_CONTENT_DIR);
    
    let posts = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf-8');
          const post = JSON.parse(data);
          // Không trả về content đầy đủ để giảm payload
          const { content, faq, cta, ...postWithoutContent } = post;

          // Kiểm tra trạng thái ảnh
          let imageStatus = 'valid';
          if (!postWithoutContent.image) {
            imageStatus = 'missing'; // Không có ảnh
          } else if (!checkImageExists(postWithoutContent.image)) {
            imageStatus = 'broken'; // Có đường dẫn nhưng file không tồn tại
          }

          return { ...postWithoutContent, imageStatus };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    // Tính stats
    const stats = {
      total: posts.length,
      draft: posts.filter(p => p.status === 'draft').length,
      published: posts.filter(p => p.status === 'published').length,
      missingImages: posts.filter(p => p.imageStatus === 'missing' || p.imageStatus === 'broken').length,
    };

    // Filter theo status
    if (status !== 'all') {
      posts = posts.filter(p => p.status === status);
    }

    // Filter theo category
    if (category) {
      posts = posts.filter(p => p.category === category);
    }

    // Search theo title
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(p =>
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter theo trạng thái ảnh
    if (imageFilter === 'missing') {
      posts = posts.filter(p => p.imageStatus === 'missing' || p.imageStatus === 'broken');
    } else if (imageFilter === 'valid') {
      posts = posts.filter(p => p.imageStatus === 'valid');
    }

    // Sort
    posts.sort((a, b) => {
      let aVal, bVal;
      
      // Sắp xếp theo Category + Order (cho publish theo thứ tự)
      if (sortBy === 'categoryOrder') {
        const aCatOrder = a.categoryOrder || 99;
        const bCatOrder = b.categoryOrder || 99;
        if (aCatOrder !== bCatOrder) {
          return sortOrder === 'asc' ? aCatOrder - bCatOrder : bCatOrder - aCatOrder;
        }
        // Cùng category thì sắp theo order
        const aOrder = a.order || 99;
        const bOrder = b.order || 99;
        return sortOrder === 'asc' ? aOrder - bOrder : bOrder - aOrder;
      }
      
      if (sortBy === 'title') {
        aVal = a.title || '';
        bVal = b.title || '';
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'vi')
          : bVal.localeCompare(aVal, 'vi');
      }
      
      if (sortBy === 'publishedAt') {
        aVal = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        bVal = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      } else {
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return NextResponse.json({ posts, categories, stats });
  } catch (error) {
    console.error('Admin blog API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
