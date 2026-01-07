import { NextResponse } from 'next/server';

/**
 * API nhận tin nhắn liên hệ từ widget chat
 * Log để admin xem sau (có thể mở rộng lưu DB hoặc gửi email)
 */
export async function POST(request) {
  try {
    const { name, phone, message } = await request.json();
    
    // Validate
    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }
    
    // Log tin nhắn (sau này có thể lưu DB hoặc gửi email)
    // Contact: name, phone, message - timestamp: new Date().toISOString()
    
    // TODO: Có thể thêm:
    // - Lưu vào database (cần thêm model ContactMessage)
    // - Gửi email notification cho admin
    // - Gửi Telegram notification
    
    return NextResponse.json({ 
      success: true,
      message: 'Đã gửi tin nhắn thành công!'
    });
    
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
