/**
 * API Admin Blog - Lấy danh sách tất cả bài viết (cả draft và published)
 * GET /api/admin/blog
 * Query params:
 * - status: 'all' | 'draft' | 'published' | 'scheduled'
 * - category: string (slug)
 * - sortBy: 'createdAt' | 'publishedAt' | 'title'
 * - sortOrder: 'asc' | 'desc'
 * - lang: 'vi' | 'en' (default: 'vi')
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const BLOG_CONTENT_EN_DIR = path.join(process.cwd(), 'content', 'blog', 'posts', 'en');
const CATEGORIES_FILE = path.join(process.cwd(), 'content', 'blog', 'categories.json');
const CATEGORIES_EN_FILE = path.join(process.cwd(), 'content', 'blog', 'categories.en.json');
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
    const lang = searchParams.get('lang') || 'vi'; // 'vi' | 'en'

    // Chọn đúng thư mục và file categories theo ngôn ngữ
    const contentDir = lang === 'en' ? BLOG_CONTENT_EN_DIR : BLOG_CONTENT_DIR;
    const categoriesFile = lang === 'en' ? CATEGORIES_EN_FILE : CATEGORIES_FILE;

    // Đọc categories
    let categories = [];
    try {
      const catData = fs.readFileSync(categoriesFile, 'utf-8');
      categories = JSON.parse(catData).categories;
    } catch (e) {
      console.error('Error reading categories:', e);
    }

    // Đọc tất cả posts
    if (!fs.existsSync(contentDir)) {
      return NextResponse.json({ posts: [], categories, stats: { total: 0, draft: 0, published: 0, scheduled: 0 } });
    }

    const files = fs.readdirSync(contentDir);
    const now = new Date();
    
    let posts = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(contentDir, file), 'utf-8');
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

          // Xác định trạng thái thực (published, draft, scheduled)
          let displayStatus = postWithoutContent.status || 'draft';
          if (displayStatus === 'scheduled' || (postWithoutContent.publishedAt && new Date(postWithoutContent.publishedAt) > now)) {
            displayStatus = 'scheduled';
          }
          
          return { 
            ...postWithoutContent, 
            imageStatus, 
            displayStatus,
            lang 
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    // Tính stats - dựa theo displayStatus (bao gồm scheduled)
    const stats = {
      total: posts.length,
      draft: posts.filter(p => p.displayStatus === 'draft').length,
      published: posts.filter(p => p.displayStatus === 'published').length,
      scheduled: posts.filter(p => p.displayStatus === 'scheduled').length,
      missingImages: posts.filter(p => p.imageStatus === 'missing' || p.imageStatus === 'broken').length,
    };

    // Filter theo status (dùng displayStatus cho scheduled)
    if (status !== 'all') {
      if (status === 'scheduled') {
        posts = posts.filter(p => p.displayStatus === 'scheduled');
      } else {
        posts = posts.filter(p => p.displayStatus === status);
      }
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
