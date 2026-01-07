'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Phone
} from 'lucide-react';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasPassword, setHasPassword] = useState(true); // false for OAuth users

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      
      if (data.user) {
        setProfileData({
          name: data.user.name || '',
          phone: data.user.phone || ''
        });
        setEmail(data.user.email || '');
        setUsername(data.user.username || '');
        // Check if user logged in via OAuth (no password)
        // We'll detect this when they try to change password
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validateProfile = () => {
    if (!profileData.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (profileData.name.trim().length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }
    // Validate số điện thoại nếu có nhập
    if (profileData.phone) {
      const cleanPhone = profileData.phone.replace(/[\s\-\.]/g, '');
      const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
      if (!vietnamPhoneRegex.test(cleanPhone)) {
        setError('Số điện thoại không hợp lệ (VD: 0901234567)');
        return false;
      }
    }
    return true;
  };

  const validatePassword = () => {
    if (!passwordData.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    if (!passwordData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Chuẩn hóa số điện thoại trước khi gửi
      const dataToSend = {
        ...profileData,
        phone: profileData.phone ? profileData.phone.replace(/[\s\-\.]/g, '') : ''
      };

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: profileData.name
        }
      });

      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('Google')) {
          setHasPassword(false);
        }
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setSuccess('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-violet-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-violet-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Chỉnh sửa hồ sơ</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-md p-1.5 mb-6 flex gap-1">
          <button
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={18} className="inline-block mr-2" />
            Hồ sơ
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Lock size={18} className="inline-block mr-2" />
            Mật khẩu
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-green-600" />
            </div>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Form - Chỉ cho phép sửa họ tên */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 space-y-5">
              {/* Full Name - Có thể chỉnh sửa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline-block mr-2 text-violet-500" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:outline-none transition-colors text-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  🏅 Họ và tên sẽ hiển thị trên chứng chỉ khi bạn đạt được
                </p>
              </div>

              {/* Phone - Có thể chỉnh sửa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline-block mr-2 text-violet-500" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="0901234567"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:outline-none transition-colors text-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Số điện thoại Việt Nam (VD: 0901234567)
                </p>
              </div>

              {/* Username - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AtSign size={16} className="inline-block mr-2 text-gray-400" />
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Tên đăng nhập không thể thay đổi
                </p>
              </div>

              {/* Email - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline-block mr-2 text-gray-400" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Email không thể thay đổi
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang lưu...
                  </span>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {!hasPassword ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Tài khoản Google
                </h3>
                <p className="text-gray-500 text-sm">
                  Bạn đang đăng nhập bằng Google nên không có mật khẩu để thay đổi.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPasswords.current ? (
                          <EyeOff size={18} className="text-gray-400" />
                        ) : (
                          <Eye size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPasswords.new ? (
                          <EyeOff size={18} className="text-gray-400" />
                        ) : (
                          <Eye size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                passwordData.newPassword.length >= level * 3
                                  ? passwordData.newPassword.length >= 12
                                    ? 'bg-green-500'
                                    : passwordData.newPassword.length >= 9
                                    ? 'bg-yellow-500'
                                    : passwordData.newPassword.length >= 6
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {passwordData.newPassword.length < 6
                            ? 'Quá ngắn'
                            : passwordData.newPassword.length < 9
                            ? 'Trung bình'
                            : passwordData.newPassword.length < 12
                            ? 'Tốt'
                            : 'Rất mạnh'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-colors ${
                          passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword
                            ? 'border-red-300 focus:border-red-400'
                            : passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword
                            ? 'border-green-300 focus:border-green-400'
                            : 'border-gray-200 focus:border-violet-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={18} className="text-gray-400" />
                        ) : (
                          <Eye size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                      <p className="text-xs text-red-500 mt-1.5">Mật khẩu không khớp</p>
                    )}
                    {passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword && (
                      <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
                        <Check size={12} /> Mật khẩu khớp
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xử lý...
                      </span>
                    ) : (
                      'Đổi mật khẩu'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Back to Profile link */}
        <div className="mt-6 text-center">
          <Link
            href="/profile"
            className="text-violet-600 hover:text-violet-700 font-medium text-sm"
          >
            ← Quay lại trang hồ sơ
          </Link>
        </div>
      </main>
    </div>
  );
}
