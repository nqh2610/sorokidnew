/**
 * ============================================================================
 * SOROKID EMAIL SERVICE - Sử dụng Resend API (không cần SDK)
 * ============================================================================
 * 
 * Resend free tier: 3000 emails/month
 * Setup: 
 *   1. Đăng ký tại https://resend.com
 *   2. Tạo API key
 *   3. Thêm RESEND_API_KEY vào .env
 *   4. (Optional) Verify domain để tăng deliverability
 * 
 * Nếu chưa verify domain, dùng: onboarding@resend.dev làm from
 */

// Email sender mặc định
// Nếu đã verify domain: 'Sorokid <noreply@sorokid.com>'
// Nếu chưa verify: 'Sorokid <onboarding@resend.dev>'
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Sorokid <onboarding@resend.dev>';

/**
 * Gửi email qua Resend API (dùng fetch, không cần SDK)
 */
async function sendEmail({ from, to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY chưa được cấu hình');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || DEFAULT_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email] Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('[Email] Network error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email reset mật khẩu
 * @param {string} to - Email người nhận
 * @param {string} resetLink - Link reset password
 * @param {string} name - Tên người dùng (optional)
 */
export async function sendPasswordResetEmail(to, resetLink, name = '') {
  const displayName = name || 'bạn';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu - SoroKid</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #EEF2FF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #EEF2FF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(99, 102, 241, 0.15);">
          
          <!-- Header với Logo Text -->
          <tr>
            <td style="background: linear-gradient(135deg, #4F7FFF 0%, #8B5CF6 50%, #EC4899 100%); padding: 36px 30px; text-align: center;">
              <!-- Logo Text -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 16px; padding: 14px 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
                    <span style="font-size: 32px; font-weight: 800; color: #4F7FFF;">Soro</span><span style="font-size: 32px; font-weight: 800; color: #EC4899;">Kid</span>
                  </td>
                </tr>
              </table>
              <p style="color: rgba(255,255,255,0.95); margin: 16px 0 0 0; font-size: 15px; font-weight: 500;">
                🧒 Học toán tư duy cùng bàn tính Soroban
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 36px;">
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 50%; line-height: 64px; font-size: 32px; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);">🔐</span>
              </div>
              
              <h2 style="color: #1F2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 700; text-align: center;">
                Xin chào ${displayName}! 👋
              </h2>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0; text-align: center;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color: #6366F1;">Sorokid</strong> của bạn.
              </p>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin: 0 0 28px 0; text-align: center;">
                Nhấn vào nút bên dưới để tạo mật khẩu mới:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); 
                              color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 50px; 
                              font-size: 16px; font-weight: 700; letter-spacing: 0.3px;
                              box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);">
                      🔑 Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning box -->
              <div style="margin-top: 28px; padding: 16px 20px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; border-left: 4px solid #F59E0B;">
                <p style="color: #92400E; font-size: 14px; line-height: 1.5; margin: 0;">
                  ⏰ Link này sẽ hết hạn sau <strong>1 giờ</strong>
                </p>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
              </p>
              
              <!-- Fallback link -->
              <div style="margin-top: 28px; padding: 16px 20px; background-color: #F3F4F6; border-radius: 12px;">
                <p style="color: #6B7280; font-size: 13px; margin: 0 0 8px 0;">
                  📎 Nếu nút không hoạt động, copy link sau:
                </p>
                <p style="color: #6366F1; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace;">
                  ${resetLink}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 28px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <!-- Social/Brand -->
              <p style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                🧮 <span style="color: #4F7FFF;">Soro</span><span style="color: #EC4899;">Kid</span> <span style="color: #6B7280;">- Học toán tư duy cùng bàn tính Soroban</span>
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 12px 0;">
                Rèn luyện trí não, phát triển tư duy toán học cho bé
              </p>
              <p style="color: #D1D5DB; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} <span style="color: #4F7FFF;">Soro</span><span style="color: #EC4899;">Kid</span>. Email tự động - vui lòng không trả lời.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Xin chào ${displayName}!

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Sorokid của bạn.

Nhấn vào link sau để tạo mật khẩu mới:
${resetLink}

Link này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

---
SoroKid - Học toán tư duy cùng bàn tính Soroban
  `.trim();

  const result = await sendEmail({
    to,
    subject: '🔐 Đặt lại mật khẩu Sorokid',
    html,
    text,
  });

  if (result.success) {
    console.log('[Email] Password reset email sent:', result.id);
  }
  
  return result;
}

/**
 * Kiểm tra Resend API key đã được cấu hình chưa
 */
export function isEmailConfigured() {
  return !!process.env.RESEND_API_KEY;
}

// ============================================================================
// RESET TOKEN HELPERS
// ============================================================================

/**
 * Generate reset token (32 chars alphanumeric)
 */
export function generateResetToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * Tạo resetToken với expiry (1 giờ)
 * Format lưu DB: token:expiryTimestamp
 * @returns {{ token: string, dbValue: string }}
 */
export function createResetTokenWithExpiry() {
  const token = generateResetToken();
  const expiry = Date.now() + 60 * 60 * 1000; // 1 giờ
  return {
    token,
    dbValue: `${token}:${expiry}`,
  };
}

/**
 * Parse và validate resetToken từ DB
 * @param {string | null} dbValue - Giá trị từ DB (format: token:expiry)
 * @returns {{ valid: boolean, token?: string, expiry?: number, expired?: boolean }}
 */
export function parseResetToken(dbValue) {
  if (!dbValue) return { valid: false };
  
  const [token, expiryStr] = dbValue.split(':');
  const expiry = parseInt(expiryStr, 10);
  
  if (!token || !expiry || isNaN(expiry)) {
    return { valid: false };
  }
  
  if (Date.now() > expiry) {
    return { valid: false, expired: true };
  }
  
  return { valid: true, token, expiry };
}
