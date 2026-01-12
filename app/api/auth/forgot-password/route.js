import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';
import crypto from 'crypto';

// Rate limit: max 3 requests per email per 15 minutes
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

function checkRateLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const record = rateLimitMap.get(key);
  
  if (!record) {
    rateLimitMap.set(key, { count: 1, firstRequest: now });
    return true;
  }
  
  // Reset if window expired
  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, firstRequest: now });
    return true;
  }
  
  // Check limit
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(request) {
  try {
    // Check if email service is configured
    if (!isEmailConfigured()) {
      console.error('[ForgotPassword] Email service not configured');
      return NextResponse.json(
        { error: 'Dịch vụ email chưa được cấu hình. Vui lòng liên hệ admin.' },
        { status: 503 }
      );
    }

    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Vui lòng nhập email' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Rate limit check
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true }
    });

    // IMPORTANT: Always return success to prevent email enumeration
    // Even if user doesn't exist, we return success message
    if (!user) {
      console.log('[ForgotPassword] Email not found:', normalizedEmail);
      // Don't reveal that email doesn't exist
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.'
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any existing tokens for this email
    await prisma.passwordReset.updateMany({
      where: { 
        email: normalizedEmail,
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: { used: true }
    });

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt
      }
    });

    // Build reset link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    const emailResult = await sendPasswordResetEmail(
      normalizedEmail,
      resetLink,
      user.name
    );

    if (!emailResult.success) {
      console.error('[ForgotPassword] Failed to send email:', emailResult.error);
      return NextResponse.json(
        { error: 'Không thể gửi email. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    console.log('[ForgotPassword] Reset email sent to:', normalizedEmail);
    
    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.'
    });

  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
