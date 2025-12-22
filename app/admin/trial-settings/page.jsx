'use client';

import { useState, useEffect } from 'react';

const TIER_OPTIONS = [
  { value: 'basic', label: 'Cơ Bản', icon: '⭐', color: 'text-blue-600' },
  { value: 'advanced', label: 'Nâng Cao', icon: '💎', color: 'text-purple-600' }
];

const TRIAL_DAYS_OPTIONS = [3, 5, 7, 10, 14, 21, 30];

export default function TrialSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    isEnabled: true,
    trialDays: 7,
    trialTier: 'advanced'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'users'
  
  // Trial users state
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({ active: 0, expired: 0, total: 0 });
  const [userFilter, setUserFilter] = useState('all');
  const [usersLoading, setUsersLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchTrialStats(); // Fetch stats ngay khi load
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchTrialUsers();
    }
  }, [activeTab, userFilter, pagination.page, searchQuery]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/trial-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Không thể tải cài đặt' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrialStats = async () => {
    try {
      const res = await fetch('/api/admin/trial-users?status=all&page=1&limit=1');
      if (res.ok) {
        const data = await res.json();
        setUserStats(data.stats || { active: 0, expired: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching trial stats:', error);
    }
  };

  const fetchTrialUsers = async () => {
    setUsersLoading(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/admin/trial-users?status=${userFilter}&page=${pagination.page}&limit=${pagination.limit}${searchParam}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUserStats(data.stats || { active: 0, expired: 0, total: 0 });
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching trial users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/trial-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Đã lưu cài đặt thành công!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu' });
    } finally {
      setIsSaving(false);
    }
  };

  const getTierInfo = (tierValue) => {
    return TIER_OPTIONS.find(t => t.value === tierValue) || TIER_OPTIONS[1];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Cài đặt Trial</h1>
          <p className="text-gray-600 mt-1">Quản lý chương trình dùng thử cho học sinh mới</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          settings.isEnabled 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {settings.isEnabled ? '🟢 Đang hoạt động' : '⚫ Đã tắt'}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚙️ Cài đặt
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Danh sách Trial ({userStats.active} đang dùng)
          </button>
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Settings Form */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Cấu hình Trial</h2>
            
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Kích hoạt Trial</p>
                <p className="text-sm text-gray-500">User mới đăng ký sẽ được dùng thử</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, isEnabled: !s.isEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.isEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Trial Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số ngày dùng thử
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TRIAL_DAYS_OPTIONS.map(days => (
                  <button
                    key={days}
                    onClick={() => setSettings(s => ({ ...s, trialDays: days }))}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.trialDays === days
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                User mới sẽ được dùng thử trong {settings.trialDays} ngày kể từ khi đăng ký
              </p>
            </div>

            {/* Trial Tier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gói được dùng thử
              </label>
              <div className="space-y-2">
                {TIER_OPTIONS.map(tier => (
                  <button
                    key={tier.value}
                    onClick={() => setSettings(s => ({ ...s, trialTier: tier.value }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      settings.trialTier === tier.value
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{tier.icon}</span>
                    <span className={`font-medium ${settings.trialTier === tier.value ? 'text-purple-700' : 'text-gray-700'}`}>
                      {tier.label}
                    </span>
                    {settings.trialTier === tier.value && (
                      <span className="ml-auto text-purple-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Đang lưu...' : '💾 Lưu cài đặt'}
            </button>
          </div>

          {/* Right: Preview & Stats */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">👀 Xem trước</h3>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4 space-y-2">
                <p className="text-sm opacity-90">Khi user mới đăng ký sẽ thấy:</p>
                <div className="bg-white text-gray-800 rounded-lg p-3">
                  <p className="font-medium flex items-center gap-2">
                    <span>🎁</span>
                    <span>Chào mừng bạn!</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Bạn được dùng thử gói <strong className={getTierInfo(settings.trialTier).color}>{getTierInfo(settings.trialTier).label}</strong> miễn phí trong <strong>{settings.trialDays} ngày</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Thống kê nhanh</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                  <p className="text-sm text-gray-600">Đang trial</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{userStats.expired}</p>
                  <p className="text-sm text-gray-600">Đã hết hạn</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{userStats.total}</p>
                  <p className="text-sm text-gray-600">Tổng cộng</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                💡 Để cấp/gia hạn trial cho user cụ thể, vào trang <a href="/admin/users" className="text-purple-600 hover:underline">Quản lý người dùng</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Search and Filter */}
          <div className="p-4 border-b space-y-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm theo tên, email hoặc username..."
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Tìm kiếm
              </button>
            </form>
            
            {/* Filter and Stats */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['all', 'active', 'expired'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => {
                      setUserFilter(filter);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userFilter === filter
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? 'Tất cả' : filter === 'active' ? '🟢 Đang trial' : '🔴 Hết hạn'}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Tổng: <span className="font-semibold">{pagination.total}</span> users
                {searchQuery && <span className="text-purple-600"> (đang lọc theo: "{searchQuery}")</span>}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Không có user nào
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đăng ký</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hết hạn trial</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Còn lại</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                            {user.name?.charAt(0) || user.username?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || user.username}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.trialExpiresAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${user.daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {user.daysRemaining > 0 ? `${user.daysRemaining} ngày` : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? '🟢 Đang trial' : '🔴 Hết hạn'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="p-4 border-t flex flex-wrap items-center justify-between gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hiển thị:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                  className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">/ trang</span>
              </div>
              
              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: 1 }))}
                  disabled={pagination.page === 1}
                  className="px-2 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
                  title="Trang đầu"
                >
                  ««
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  ←
                </button>
                
                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  const current = pagination.page;
                  const total = pagination.totalPages;
                  
                  let start = Math.max(1, current - 2);
                  let end = Math.min(total, current + 2);
                  
                  if (current <= 3) {
                    end = Math.min(5, total);
                  }
                  if (current >= total - 2) {
                    start = Math.max(1, total - 4);
                  }
                  
                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPagination(p => ({ ...p, page: i }))}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          pagination.page === i
                            ? 'bg-purple-600 text-white'
                            : 'border hover:bg-gray-100'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
                
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  →
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: pagination.totalPages }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-2 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
                  title="Trang cuối"
                >
                  »»
                </button>
              </div>
              
              {/* Page info */}
              <div className="text-sm text-gray-600">
                Trang {pagination.page} / {pagination.totalPages} ({pagination.total} users)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
