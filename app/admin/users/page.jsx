'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    basic: 0,
    advanced: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [editModal, setEditModal] = useState(null);
  const [packageModal, setPackageModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      console.log('API Response status:', res.status);
      const data = await res.json();
      console.log('API Response data:', data);
      if (res.ok) {
        setUsers(data.users || []);
        setStats(data.stats || stats);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'free':
        return <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">Miễn phí</span>;
      case 'basic':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-1">⭐ Cơ Bản</span>;
      case 'advanced':
        return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm flex items-center gap-1">👑 Nâng Cao</span>;
      default:
        return <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">{tier}</span>;
    }
  };

  const filteredUsers = users.filter(u => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (!u.name?.toLowerCase().includes(searchLower) && 
          !u.email?.toLowerCase().includes(searchLower) &&
          !u.username?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filterTier !== 'all' && u.tier !== filterTier) return false;
    return true;
  });

  const handleOpenEdit = (user) => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || ''
    });
    setEditModal(user);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/users/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        fetchUsers();
        setEditModal(null);
        showToast('Đã cập nhật thông tin người dùng!');
      } else {
        showToast('Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
        setDeleteConfirm(null);
        showToast('Đã xóa người dùng thành công!');
      } else {
        showToast('Có lỗi xảy ra khi xóa', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Có lỗi xảy ra khi xóa', 'error');
    }
  };

  const handleOpenPackage = (user) => {
    setSelectedPackage(user.tier || 'free');
    setPackageModal(user);
  };

  const handleActivatePackage = async () => {
    try {
      const res = await fetch(`/api/admin/users/${packageModal.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedPackage })
      });
      if (res.ok) {
        fetchUsers();
        setPackageModal(null);
        showToast(`Đã kích hoạt gói ${selectedPackage === 'basic' ? 'Cơ Bản' : selectedPackage === 'advanced' ? 'Nâng Cao' : 'Miễn phí'}!`);
      } else {
        showToast('Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error activating package:', error);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Bạn có chắc muốn reset mật khẩu cho người dùng này?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        // Copy to clipboard
        navigator.clipboard.writeText(data.newPassword);
        showToast(`Mật khẩu mới: ${data.newPassword} (đã copy vào clipboard)`);
      } else {
        showToast('Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {toast.type === 'error' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Tổng người dùng</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Miễn phí</div>
          <div className="text-2xl font-bold text-slate-300">{stats.free}</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-sm flex items-center gap-1 mb-1">
            <span>⭐</span> Cơ Bản
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.basic}</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-sm flex items-center gap-1 mb-1">
            <span>👑</span> Nâng Cao
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.advanced}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email, username..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tất cả gói</option>
            <option value="free">Miễn phí</option>
            <option value="basic">Cơ Bản</option>
            <option value="advanced">Nâng Cao</option>
          </select>
          <button
            onClick={fetchUsers}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Người dùng</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Gói</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Level</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Ngày đăng ký</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name || 'Chưa đặt tên'}</div>
                          <div className="text-sm text-slate-400">@{user.username || 'no-username'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">{getTierBadge(user.tier)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Lv.{user.level || 1}</span>
                        <span className="text-amber-400 text-sm">⭐ {user.totalStars || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailModal(user)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Sửa thông tin"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenPackage(user)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Kích hoạt gói"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
                          title="Reset mật khẩu"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Xóa người dùng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-sm text-slate-300 space-y-2">
        <p><strong className="text-white">📝 Sửa thông tin:</strong> Click &quot;Sửa&quot; → Cập nhật tên, email, username</p>
        <p><strong className="text-white">📦 Kích hoạt gói:</strong> Click &quot;Gói&quot; → Chọn gói muốn kích hoạt (dùng khi khách chuyển khoản thủ công)</p>
        <p><strong className="text-white">🔑 Reset mật khẩu:</strong> Click icon 🔑 → Sao chép mật khẩu mới gửi cho người dùng</p>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-white">Sửa thông tin người dùng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {packageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-bold mb-2 text-white">Kích hoạt gói cho {packageModal.name || packageModal.email}</h3>
            <p className="text-sm text-slate-400 mb-4">Chọn gói để kích hoạt (áp dụng khi khách chuyển khoản thủ công)</p>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage === 'free' ? 'border-slate-500 bg-slate-700' : 'border-slate-600 hover:border-slate-500'}`}>
                <input
                  type="radio"
                  name="package"
                  value="free"
                  checked={selectedPackage === 'free'}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium text-white">Miễn phí</div>
                  <div className="text-sm text-slate-400">3 bài học đầu tiên</div>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage === 'basic' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                <input
                  type="radio"
                  name="package"
                  value="basic"
                  checked={selectedPackage === 'basic'}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2 text-white">⭐ Cơ Bản <span className="text-blue-400">199.000đ</span></div>
                  <div className="text-sm text-slate-400">Level 1-9 • Trọn đời</div>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage === 'advanced' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                <input
                  type="radio"
                  name="package"
                  value="advanced"
                  checked={selectedPackage === 'advanced'}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2 text-white">👑 Nâng Cao <span className="text-amber-400">299.000đ</span></div>
                  <div className="text-sm text-slate-400">Full 18 Level • Trọn đời</div>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPackageModal(null)}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleActivatePackage}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Kích hoạt gói
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Chi tiết người dùng</h3>
              <button
                onClick={() => setDetailModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                {detailModal.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{detailModal.name || 'Chưa đặt tên'}</div>
                <div className="text-slate-400">@{detailModal.username || 'no-username'}</div>
              </div>
            </div>
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Email</div>
                <div className="text-white font-medium truncate">{detailModal.email}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Gói hiện tại</div>
                <div>{getTierBadge(detailModal.tier)}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Level</div>
                <div className="text-white font-bold text-xl">Level {detailModal.level || 1}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Tổng sao</div>
                <div className="text-amber-400 font-bold text-xl">⭐ {detailModal.totalStars || 0}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Kim cương</div>
                <div className="text-cyan-400 font-bold text-xl">💎 {detailModal.diamonds || 0}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Streak</div>
                <div className="text-orange-400 font-bold text-xl">🔥 {detailModal.streak || 0} ngày</div>
              </div>
            </div>
            
            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Ngày đăng ký:</span>
                <span className="text-white">{formatDate(detailModal.createdAt)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ngày kích hoạt gói:</span>
                <span className="text-white">{formatDate(detailModal.activatedAt)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lần đăng nhập cuối:</span>
                <span className="text-white">{formatDate(detailModal.lastLoginDate)}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={() => { setDetailModal(null); handleOpenEdit(detailModal); }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Sửa thông tin
              </button>
              <button
                onClick={() => { setDetailModal(null); handleOpenPackage(detailModal); }}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Kích hoạt gói
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
                <p className="text-slate-400 text-sm">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
              <p className="text-slate-300">
                Bạn có chắc muốn xóa người dùng <strong className="text-white">{deleteConfirm.name || deleteConfirm.email}</strong>?
              </p>
              <p className="text-red-400 text-sm mt-2">
                Tất cả dữ liệu của người dùng này sẽ bị xóa vĩnh viễn, bao gồm tiến trình học tập, thành tích, và lịch sử thanh toán.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Xóa người dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
