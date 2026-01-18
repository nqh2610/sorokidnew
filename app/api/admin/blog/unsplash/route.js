/**
 * API Admin Blog - Unsplash Integration
 * GET /api/admin/blog/unsplash?query=...&page=1 - Search ảnh
 * POST /api/admin/blog/unsplash - Download ảnh về server
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Unsplash API - Bạn cần đăng ký tại https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

/**
 * Search ảnh từ Unsplash
 */
export async function GET(request) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kiểm tra API key
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
      console.log('UNSPLASH_ACCESS_KEY not configured:', UNSPLASH_ACCESS_KEY);
      return NextResponse.json({ 
        error: 'Cần cấu hình UNSPLASH_ACCESS_KEY trong .env',
        needsConfig: true 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'children learning';
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '12';
    const orientation = searchParams.get('orientation') || 'landscape'; // landscape, portrait, squarish

    // Thêm keyword liên quan đến giáo dục trẻ em
    const enhancedQuery = `${query} children education`;

    console.log('Searching Unsplash with key:', UNSPLASH_ACCESS_KEY?.substring(0, 10) + '...');

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(enhancedQuery)}&page=${page}&per_page=${perPage}&orientation=${orientation}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Unsplash API error:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json({ 
          error: 'Unsplash API key không hợp lệ. Vui lòng cấu hình UNSPLASH_ACCESS_KEY trong .env',
          needsConfig: true 
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: 'Không thể kết nối Unsplash API' 
      }, { status: 500 });
    }

    const data = await response.json();

    // Format response
    const photos = data.results.map(photo => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      description: photo.description || photo.alt_description,
      urls: {
        thumb: photo.urls.thumb,     // 200px
        small: photo.urls.small,     // 400px
        regular: photo.urls.regular, // 1080px
        full: photo.urls.full,       // Original
      },
      user: {
        name: photo.user.name,
        username: photo.user.username,
        link: photo.user.links.html,
      },
      downloadLink: photo.links.download_location, // Để trigger download count cho Unsplash
    }));

    return NextResponse.json({
      photos,
      total: data.total,
      totalPages: data.total_pages,
      page: parseInt(page),
    });
  } catch (error) {
    console.error('Unsplash search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Download ảnh từ Unsplash về server
 */
export async function POST(request) {
  try {
    // Kiểm tra quyền admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photoId, imageUrl, downloadLink, slug, altText } = await request.json();

    if (!imageUrl || !slug) {
      return NextResponse.json({ error: 'Missing imageUrl or slug' }, { status: 400 });
    }

    // Tạo tên file từ slug
    const fileName = `${slug}.jpg`;
    const publicDir = path.join(process.cwd(), 'public', 'blog');
    const filePath = path.join(publicDir, fileName);

    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Trigger download count cho Unsplash (bắt buộc theo API guidelines)
    if (downloadLink) {
      try {
        await fetch(downloadLink, {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        });
      } catch (e) {
        console.log('Could not trigger Unsplash download count');
      }
    }

    // Download ảnh
    await downloadImage(imageUrl, filePath);

    // Trả về đường dẫn public
    const publicPath = `/blog/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Ảnh đã được tải về thành công',
      image: {
        path: publicPath,
        altText: altText || slug.replace(/-/g, ' '),
        photoId,
      },
    });
  } catch (error) {
    console.error('Unsplash download error:', error);
    return NextResponse.json({ error: 'Không thể tải ảnh về server' }, { status: 500 });
  }
}

/**
 * Helper: Download image từ URL về file
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Handle redirect
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete file on error
      reject(err);
    });
  });
}
