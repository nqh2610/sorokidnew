/**
 * API Admin Blog - Publish bài viết
 * POST /api/admin/blog/publish
 * Body: { slug: string }
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');

export async function POST(request) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Đọc và cập nhật post
    const data = fs.readFileSync(filePath, 'utf-8');
    const post = JSON.parse(data);

    // Cập nhật status và publishedAt
    post.status = 'published';
    post.publishedAt = new Date().toISOString();

    // Ghi lại file
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Post published successfully',
      post: {
        slug: post.slug,
        title: post.title,
        status: post.status,
        publishedAt: post.publishedAt,
      }
    });
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
