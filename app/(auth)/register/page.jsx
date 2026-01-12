'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { User, Mail, Lock, UserCircle, Eye, EyeOff, Award, Phone } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import Logo from '@/components/Logo/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ chứa chữ, số và gạch dưới';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate số điện thoại Việt Nam
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      // Chuẩn hóa số điện thoại (loại bỏ khoảng trắng, dấu gạch)
      const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');
      // Regex cho số điện thoại Việt Nam:
      // - Bắt đầu bằng 0 hoặc +84 hoặc 84
      // - Tiếp theo là các đầu số hợp lệ (3, 5, 7, 8, 9)
      // - Tổng cộng 10 số (nếu bắt đầu bằng 0) hoặc 11-12 số (nếu có +84/84)
      const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
      if (!vietnamPhoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    setLoading(true);

    try {
      // Chuẩn hóa số điện thoại trước khi gửi
      const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: cleanPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Chuyển thông báo lỗi thành thân thiện với người dùng
        let friendlyError = 'Đăng ký thất bại. Vui lòng thử lại!';
        if (data.error === 'Email already exists') {
          friendlyError = 'Email này đã được sử dụng!';
          setErrors(prev => ({ ...prev, email: 'Email này đã được sử dụng' }));
        } else if (data.error === 'Username already exists') {
          friendlyError = 'Tên đăng nhập này đã được sử dụng!';
          setErrors(prev => ({ ...prev, username: 'Tên đăng nhập này đã được sử dụng' }));
        } else if (data.error === 'Phone already exists') {
          friendlyError = 'Số điện thoại này đã được sử dụng!';
          setErrors(prev => ({ ...prev, phone: 'Số điện thoại này đã được sử dụng' }));
        } else if (data.error?.includes('email')) {
          friendlyError = 'Email không hợp lệ!';
        } else if (data.error?.includes('password')) {
          friendlyError = 'Mật khẩu không hợp lệ!';
        } else if (data.error?.includes('phone')) {
          friendlyError = 'Số điện thoại không hợp lệ!';
        }
        toast.error(friendlyError);
        return;
      }

      toast.success('Đăng ký thành công! 🎉');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center p-4 py-6">
      {/* Google Loading Overlay */}
      {googleLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
            <h2 className="text-white text-lg font-bold mb-1">Đang kết nối với Google...</h2>
            <p className="text-white/80 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo size="md" showText={false} />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              SoroKid
            </span>
          </Link>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={() => {
              setGoogleLoading(true);
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            disabled={loading || googleLoading}
            className="w-full py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                <span>Đang chuyển hướng...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng ký nhanh với Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-3 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs">hoặc</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Họ tên */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <User size={15} className="text-violet-500" />
                Họ tên
                <span className="text-xs text-amber-600 ml-1">(hiển trên chứng chỉ)</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.name 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <UserCircle size={15} className="text-violet-500" />
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.username 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder="nguyenvana"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Mail size={15} className="text-violet-500" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Phone size={15} className="text-violet-500" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                  errors.phone
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-violet-500'
                }`}
                placeholder="0901234567"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Lock size={15} className="text-violet-500" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-violet-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm flex items-center gap-1.5">
                <Lock size={15} className="text-violet-500" />
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border-2 rounded-lg focus:outline-none transition-all text-sm ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-violet-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang đăng ký...
                </span>
              ) : (
                '🚀 Đăng ký ngay'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-violet-600 font-semibold hover:text-pink-500">
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center mt-4 text-white/70 text-xs">
          © {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban
        </p>
      </div>
    </div>
  );
}
