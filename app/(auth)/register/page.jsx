'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, UserCircle, Eye, EyeOff, Sparkles, Award } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import Logo from '@/components/Logo/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
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
        } else if (data.error?.includes('email')) {
          friendlyError = 'Email không hợp lệ!';
        } else if (data.error?.includes('password')) {
          friendlyError = 'Mật khẩu không hợp lệ!';
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
          <div className="mt-6 text-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent"></div>
            </div>
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
          <p>© 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
        </div>
      </div>
    </div>
  );
}
