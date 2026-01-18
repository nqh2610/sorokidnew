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
      // Parse JSON error with line/column info
      const errorMsg = e.message;
      const posMatch = errorMsg.match(/position (\d+)/);
      let errorDetail = `Lỗi cú pháp JSON: ${errorMsg}`;
      
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const lines = content.substring(0, pos).split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length + 1;
        errorDetail = `Lỗi cú pháp JSON tại dòng ${lineNum}, cột ${colNum}: ${errorMsg}`;
      }
      
      return NextResponse.json({ 
        error: errorDetail,
        errors: [errorDetail],
        hint: 'Kiểm tra: dấu phẩy thừa, ngoặc thiếu, dấu nháy kép không đóng'
      }, { status: 400 });
    }

    // Comprehensive validation - collect all errors
    const errors = [];
    
    // Required fields validation
    const requiredFields = [
      { field: 'title', label: 'Tiêu đề (title)' },
      { field: 'slug', label: 'Đường dẫn URL (slug)' },
    ];
    
    for (const { field, label } of requiredFields) {
      if (!postData[field]) {
        errors.push(`❌ Thiếu trường bắt buộc: ${label}`);
      } else if (typeof postData[field] !== 'string') {
        errors.push(`❌ ${label} phải là chuỗi văn bản`);
      } else if (postData[field].trim() === '') {
        errors.push(`❌ ${label} không được để trống`);
      }
    }

    // Validate slug format
    if (postData.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(postData.slug)) {
        errors.push(`❌ Slug "${postData.slug}" không hợp lệ. Chỉ dùng: chữ thường (a-z), số (0-9), dấu gạch ngang (-)`);
      }
      if (postData.slug.startsWith('-') || postData.slug.endsWith('-')) {
        errors.push(`❌ Slug không được bắt đầu hoặc kết thúc bằng dấu gạch ngang`);
      }
      if (postData.slug.includes('--')) {
        errors.push(`❌ Slug không được có 2 dấu gạch ngang liên tiếp`);
      }
    }

    // Validate meta
    if (postData.meta) {
      if (typeof postData.meta !== 'object' || Array.isArray(postData.meta)) {
        errors.push(`❌ Trường "meta" phải là object`);
      } else {
        if (postData.meta.title && typeof postData.meta.title !== 'string') {
          errors.push(`❌ meta.title phải là chuỗi`);
        }
        if (postData.meta.description && typeof postData.meta.description !== 'string') {
          errors.push(`❌ meta.description phải là chuỗi`);
        }
        if (postData.meta.keywords && !Array.isArray(postData.meta.keywords)) {
          errors.push(`❌ meta.keywords phải là mảng: ["từ khóa 1", "từ khóa 2"]`);
        }
      }
    }

    // Validate content structure
    if (postData.content) {
      if (typeof postData.content !== 'object' || Array.isArray(postData.content)) {
        errors.push(`❌ Trường "content" phải là object`);
      } else {
        if (postData.content.intro && typeof postData.content.intro !== 'string') {
          errors.push(`❌ content.intro phải là chuỗi văn bản`);
        }
        if (postData.content.sections) {
          if (!Array.isArray(postData.content.sections)) {
            errors.push(`❌ content.sections phải là mảng`);
          } else {
            postData.content.sections.forEach((section, i) => {
              if (!section.type) {
                errors.push(`❌ Section ${i + 1}: Thiếu trường "type"`);
              } else if (!['heading', 'paragraph', 'list', 'callout', 'table'].includes(section.type)) {
                errors.push(`❌ Section ${i + 1}: type "${section.type}" không hợp lệ. Chỉ chấp nhận: heading, paragraph, list, callout, table`);
              }
              
              if (section.type === 'heading' && !section.text) {
                errors.push(`❌ Section ${i + 1} (heading): Thiếu trường "text"`);
              }
              if (section.type === 'paragraph' && !section.text) {
                errors.push(`❌ Section ${i + 1} (paragraph): Thiếu trường "text"`);
              }
              if (section.type === 'list' && !Array.isArray(section.items)) {
                errors.push(`❌ Section ${i + 1} (list): Thiếu hoặc sai định dạng "items" (phải là mảng)`);
              }
              if (section.type === 'callout' && !section.text) {
                errors.push(`❌ Section ${i + 1} (callout): Thiếu trường "text"`);
              }
            });
          }
        }
      }
    }

    // Validate FAQ
    if (postData.faq) {
      if (!Array.isArray(postData.faq)) {
        errors.push(`❌ Trường "faq" phải là mảng`);
      } else {
        postData.faq.forEach((item, i) => {
          if (!item.question) {
            errors.push(`❌ FAQ ${i + 1}: Thiếu trường "question"`);
          }
          if (!item.answer) {
            errors.push(`❌ FAQ ${i + 1}: Thiếu trường "answer"`);
          }
        });
      }
    }

    // Validate image path
    if (postData.image) {
      if (typeof postData.image !== 'string') {
        errors.push(`❌ Trường "image" phải là chuỗi đường dẫn`);
      } else if (!postData.image.startsWith('/blog/')) {
        errors.push(`⚠️ Đường dẫn ảnh nên bắt đầu bằng "/blog/" (hiện tại: "${postData.image}")`);
      }
    }

    // Validate category
    if (postData.category && typeof postData.category !== 'string') {
      errors.push(`❌ Trường "category" phải là chuỗi`);
    }

    // Return all errors if any
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: `Tìm thấy ${errors.length} lỗi trong file JSON`,
        errors: errors,
        hint: 'Copy danh sách lỗi bên dưới để sửa file'
      }, { status: 400 });
    }

    // Check if post already exists - lấy lang từ formData
    const lang = formData.get('lang') || 'vi';
    const postsDir = lang === 'en' 
      ? path.join(process.cwd(), 'content', 'blog', 'posts', 'en')
      : path.join(process.cwd(), 'content', 'blog', 'posts');
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
    postData.status = 'draft';
    
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
      message: `Upload thành công! Bài viết ${lang === 'en' ? '(English)' : '(Tiếng Việt)'} đang ở trạng thái Draft.`,
      post: {
        title: postData.title,
        slug: postData.slug,
        category: postData.category || 'Chưa phân loại',
        published: false,
        createdAt: postData.createdAt,
        lang,
      }
    });

  } catch (error) {
    console.error('Upload post error:', error);
    return NextResponse.json({ 
      error: 'Lỗi server khi upload bài viết' 
    }, { status: 500 });
  }
}
