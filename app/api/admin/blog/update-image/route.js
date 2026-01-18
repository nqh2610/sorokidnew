/**
 * API Admin Blog - Update post image
 * POST /api/admin/blog/update-image
 * Body: { slug: string, image: string, imageAlt?: string, lang?: 'vi' | 'en' }
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

    const { slug, image, imageAlt, lang = 'vi' } = await request.json();

    if (!slug || !image) {
      return NextResponse.json({ error: 'Missing slug or image' }, { status: 400 });
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

    // Cập nhật image và imageAlt
    post.image = image;
    if (imageAlt) {
      post.imageAlt = imageAlt;
    }
    post.updatedAt = new Date().toISOString().split('T')[0];

    // Ghi lại file
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật ảnh cho bài viết',
      post: {
        slug: post.slug,
        title: post.title,
        image: post.image,
        imageAlt: post.imageAlt,
      },
    });
  } catch (error) {
    console.error('Update image API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
