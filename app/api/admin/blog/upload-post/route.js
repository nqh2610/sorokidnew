import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Không có file được upload' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'Chỉ chấp nhận file JSON' }, { status: 400 });
    }

    // Read file content
    const content = await file.text();
    let postData;
    
    try {
      postData = JSON.parse(content);
    } catch (e) {
      return NextResponse.json({ error: 'File JSON không hợp lệ. Kiểm tra lại cú pháp.' }, { status: 400 });
    }

    // Validate required fields
    const requiredFields = ['title', 'slug'];
    for (const field of requiredFields) {
      if (!postData[field]) {
        return NextResponse.json({ 
          error: `Thiếu trường bắt buộc: ${field}` 
        }, { status: 400 });
      }
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(postData.slug)) {
      return NextResponse.json({ 
        error: 'Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang.' 
      }, { status: 400 });
    }

    // Check if post already exists
    const postsDir = path.join(process.cwd(), 'content', 'blog', 'posts');
    const filePath = path.join(postsDir, `${postData.slug}.json`);
    
    try {
      await fs.access(filePath);
      return NextResponse.json({ 
        error: `Bài viết với slug "${postData.slug}" đã tồn tại. Đổi slug hoặc xóa bài cũ.` 
      }, { status: 400 });
    } catch {
      // File doesn't exist, good to proceed
    }

    // Force published to false (draft) for new uploads
    postData.published = false;
    
    // Set timestamps
    const now = new Date().toISOString().split('T')[0];
    if (!postData.createdAt) {
      postData.createdAt = now;
    }
    postData.updatedAt = now;
    
    // Remove publishedAt if exists (since it's draft)
    delete postData.publishedAt;

    // Ensure posts directory exists
    await fs.mkdir(postsDir, { recursive: true });

    // Write the file
    await fs.writeFile(filePath, JSON.stringify(postData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Upload thành công! Bài viết đang ở trạng thái Draft.',
      post: {
        title: postData.title,
        slug: postData.slug,
        category: postData.category || 'Chưa phân loại',
        published: false,
        createdAt: postData.createdAt,
      }
    });

  } catch (error) {
    console.error('Upload post error:', error);
    return NextResponse.json({ 
      error: 'Lỗi server khi upload bài viết' 
    }, { status: 500 });
  }
}
