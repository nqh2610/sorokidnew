/**
 * API Admin Blog - Upload/Replace Image
 * POST /api/admin/blog/upload-image
 * 
 * Thay thế ảnh bài viết mà không đổi tên file
 * Ghi đè ảnh cũ để tránh ảnh rác
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const BLOG_IMAGES_DIR = path.join(process.cwd(), 'public', 'blog');

export async function POST(request) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const slug = formData.get('slug');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Đọc post hiện tại
    const postFilePath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);
    if (!fs.existsSync(postFilePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = JSON.parse(fs.readFileSync(postFilePath, 'utf-8'));
    
    // Lấy tên file ảnh hiện tại từ post (nếu có)
    let imageName;
    if (postData.image) {
      // Extract filename from path like "/blog/image-name.jpg"
      imageName = postData.image.split('/').pop();
    } else {
      // Tạo tên file mới dựa trên slug
      const ext = file.name.split('.').pop().toLowerCase();
      imageName = `${slug}.${ext}`;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, WEBP allowed' 
      }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum 2MB allowed' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    if (!fs.existsSync(BLOG_IMAGES_DIR)) {
      fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
    }

    // Write file (overwrites existing)
    const imageFilePath = path.join(BLOG_IMAGES_DIR, imageName);
    fs.writeFileSync(imageFilePath, buffer);

    // Update post with image path if not already set
    const imagePath = `/blog/${imageName}`;
    if (postData.image !== imagePath) {
      postData.image = imagePath;
      fs.writeFileSync(postFilePath, JSON.stringify(postData, null, 2), 'utf-8');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Đã thay ảnh thành công',
      image: imagePath
    });

  } catch (error) {
    console.error('Upload image API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
