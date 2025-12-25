/**
 * API Admin Blog - Lấy chi tiết bài viết (bao gồm content)
 * GET /api/admin/blog/[slug]
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');

export async function GET(request, { params }) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const post = JSON.parse(data);

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Get post API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
