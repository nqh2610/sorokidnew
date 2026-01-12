'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { User, Mail, Lock, UserCircle, Eye, EyeOff, Sparkles, Award, Phone } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center p-3 sm:p-4 py-8 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-violet-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400 rounded-full opacity-30 animate-bounce" style={{ animationDuration: '3.5s' }}></div>
      
      {/* Google Loading Overlay */}
      {googleLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-white text-xl font-bold mb-2">Đang kết nối với Google...</h2>
            <p className="text-white/80 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      )}

      {/* Soroban beads decoration */}
      <div className="absolute top-10 right-1/4 flex gap-2 opacity-30">
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
      </div>
      <div className="absolute bottom-10 left-1/4 flex gap-2 opacity-30">
        <div className="w-4 h-4 bg-violet-300 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-white/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <Link href="/" className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 cursor-pointer">
              <div className="transform hover:scale-110 transition-transform duration-300">
                <Logo size="lg" showText={false} />
              </div>
              <span className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                SoroKid
              </span>
            </Link>
            <p className="text-gray-600 flex items-center justify-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base">
              <span className="text-xl">🎮</span> 
              <span className="font-medium">Học toán tính nhanh vui như chơi Game!</span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 rounded-full">
              <Sparkles size={18} className="text-violet-600" />
              <span className="text-violet-700 font-semibold">Đăng ký tài khoản</span>
            </div>
          </div>

          {/* Google Register Button - ĐƯA LÊN TRÊN */}
          <button
            type="button"
            onClick={() => {
              setGoogleLoading(true);
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            disabled={loading || googleLoading}
            className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-base shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transform hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
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
          <div className="my-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">hoặc đăng ký bằng email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                <User size={18} className="text-violet-600" />
                Họ tên
              </label>
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                <Award size={14} />
                <span>Họ tên sẽ được đưa vào chứng chỉ</span>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                  errors.name 
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.name}
                </p>
              )}
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                <UserCircle size={18} className="text-violet-600" />
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                  errors.username 
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                }`}
                placeholder="nguyenvana"
              />
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                <Mail size={18} className="text-violet-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                <Phone size={18} className="text-violet-600" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                  errors.phone
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                }`}
                placeholder="0901234567"
              />
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.phone}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                <Lock size={18} className="text-violet-600" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-2">
                <Lock size={18} className="text-violet-600" />
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all bg-gray-50 focus:bg-white ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group mt-6"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    🚀 Đăng ký ngay
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link 
                href="/login" 
                className="text-violet-600 font-bold hover:text-pink-500 transition-colors"
              >
                Đăng nhập ✨
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-center mt-6 text-white/70 text-sm">
          <p>© {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
        </div>
      </div>
    </div>
  );
}
