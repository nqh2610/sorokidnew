/**
 * API Admin Blog - Unpublish bài viết
 * POST /api/admin/blog/unpublish
 * Body: { slug: string, lang?: 'vi' | 'en' }
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const BLOG_CONTENT_EN_DIR = path.join(process.cwd(), 'content', 'blog', 'posts', 'en');

export async function POST(request) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, lang = 'vi' } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Chọn thư mục dựa theo ngôn ngữ
    const contentDir = lang === 'en' ? BLOG_CONTENT_EN_DIR : BLOG_CONTENT_DIR;
    const filePath = path.join(contentDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Đọc và cập nhật post
    const data = fs.readFileSync(filePath, 'utf-8');
    const post = JSON.parse(data);

    // Cập nhật status và clear publishedAt
    post.status = 'draft';
    post.publishedAt = null;

    // Ghi lại file
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Post unpublished successfully',
      post: {
        slug: post.slug,
        title: post.title,
        status: post.status,
        publishedAt: post.publishedAt,
        lang,
      }
    });
  } catch (error) {
    console.error('Unpublish API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
