'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo size="md" showText={false} />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              SoroKid
            </span>
          </Link>
          <div className="text-center mb-5">
            <h1 className="text-xl font-bold text-gray-800">Quên mật khẩu</h1>
            <p className="text-gray-500 text-sm mt-1">
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Đã gửi email!</h2>
              <p className="text-gray-600 mb-6">
                Nếu email <span className="font-medium">{email}</span> tồn tại trong hệ thống, 
                bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Không nhận được? Kiểm tra thư mục Spam hoặc thử lại sau 15 phút.
              </p>
              <Link 
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi link đặt lại mật khẩu'
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-100">
                <Link 
                  href="/login" 
                  className="text-violet-600 hover:text-pink-500 font-medium text-sm"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-4">
          © {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban
        </p>
      </div>
    </div>
  );
}
