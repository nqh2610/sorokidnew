'use client';

import { useState, useEffect, useMemo } from 'react';
import { MonsterAvatar } from '@/components/MonsterAvatar';

// =============================================
// CONSTANTS
// =============================================
const TIER_CONFIG = {
  free: { label: 'Miễn phí', icon: '🆓', color: 'text-slate-400', bgColor: 'bg-slate-500/20', borderColor: 'border-slate-500' },
  basic: { label: 'Cơ Bản', icon: '⭐', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500' },
  advanced: { label: 'Nâng Cao', icon: '👑', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500' },
  vip: { label: 'VIP', icon: '💎', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500' }
};

const ROLE_CONFIG = {
  user: { label: 'Người dùng', icon: '👤', color: 'text-slate-400' },
  admin: { label: 'Quản trị', icon: '🛡️', color: 'text-red-400' }
};

const SORT_OPTIONS = [
  { value: 'newest', label: '🆕 Mới nhất' },
  { value: 'oldest', label: '📅 Cũ nhất' },
  { value: 'name', label: '🔤 Theo tên' },
  { value: 'level', label: '📊 Theo level' },
  { value: 'stars', label: '⭐ Theo sao' },
  { value: 'lastActive', label: '🕐 Hoạt động gần đây' }
];

const BULK_ACTIONS = [
  { value: '', label: 'Chọn hành động...' },
  { value: 'activate_basic', label: '⭐ Kích hoạt gói Cơ Bản' },
  { value: 'activate_advanced', label: '👑 Kích hoạt gói Nâng Cao' },
  { value: 'deactivate', label: '🆓 Chuyển về Miễn phí' },
  { value: 'export', label: '📥 Xuất danh sách' }
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    basic: 0,
    advanced: 0,
    activeToday: 0,
    newThisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Selection for bulk actions
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // Modals
  const [editModal, setEditModal] = useState(null);
  const [packageModal, setPackageModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [addUserModal, setAddUserModal] = useState(false);
  
  // Form states
  const [selectedPackage, setSelectedPackage] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', role: 'user' });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', username: '', password: '', tier: 'free' });
  const [toast, setToast] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Không thể tải danh sách người dùng', 'error');
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

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return formatDate(dateString);
  };

  const getTierBadge = (tier) => {
    const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
    return (
      <span className={`px-3 py-1 ${config.bgColor} ${config.color} rounded-full text-sm flex items-center gap-1 w-fit`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Filtering and Sorting
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.username?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by tier
    if (filterTier !== 'all') {
      result = result.filter(u => u.tier === filterTier);
    }
    
    // Filter by role
    if (filterRole !== 'all') {
      result = result.filter(u => u.role === filterRole);
    }
    
    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'level':
        result.sort((a, b) => (b.level || 1) - (a.level || 1));
        break;
      case 'stars':
        result.sort((a, b) => (b.totalStars || 0) - (a.totalStars || 0));
        break;
      case 'lastActive':
        result.sort((a, b) => new Date(b.lastLoginDate || 0) - new Date(a.lastLoginDate || 0));
        break;
    }
    
    return result;
  }, [users, search, filterTier, filterRole, sortBy]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(start, start + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    if (bulkAction === 'export') {
      // Export to CSV
      const selectedData = users.filter(u => selectedUsers.includes(u.id));
      const csv = [
        ['Tên', 'Email', 'Username', 'Gói', 'Level', 'Sao', 'Ngày đăng ký'].join(','),
        ...selectedData.map(u => [
          u.name || '', u.email, u.username || '', u.tier, u.level || 1, u.totalStars || 0, formatDate(u.createdAt)
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      showToast(`Đã xuất ${selectedUsers.length} người dùng`);
      setSelectedUsers([]);
      setBulkAction('');
      return;
    }
    
    const tierMap = {
      'activate_basic': 'basic',
      'activate_advanced': 'advanced',
      'deactivate': 'free'
    };
    
    if (!confirm(`Bạn có chắc muốn thực hiện hành động này cho ${selectedUsers.length} người dùng?`)) return;
    
    try {
      const tier = tierMap[bulkAction];
      await Promise.all(selectedUsers.map(userId => 
        fetch(`/api/admin/users/${userId}/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier })
        })
      ));
      fetchUsers();
      showToast(`Đã cập nhật ${selectedUsers.length} người dùng`);
      setSelectedUsers([]);
      setBulkAction('');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleOpenEdit = (user) => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || 'user'
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
        const data = await res.json();
        showToast(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleAddUser = async () => {
    if (!newUserForm.email || !newUserForm.password) {
      showToast('Email và mật khẩu là bắt buộc', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
        setAddUserModal(false);
        setNewUserForm({ name: '', email: '', username: '', password: '', tier: 'free' });
        showToast('Đã tạo người dùng mới!');
      } else {
        showToast(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
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
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải dữ liệu...</p>
        </div>
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
          {toast.type === 'error' ? '❌' : '✅'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">👥 Quản lí Người dùng</h1>
          <p className="text-slate-400 mt-1">Quản lí tài khoản, gói dịch vụ và phân quyền</p>
        </div>
        <button
          onClick={() => setAddUserModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          ➕ Thêm người dùng
        </button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">👥</div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-xs">Tổng cộng</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-slate-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center text-xl">🆓</div>
            <div>
              <div className="text-2xl font-bold text-slate-300">{stats.free}</div>
              <div className="text-slate-400 text-xs">Miễn phí</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">⭐</div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.basic}</div>
              <div className="text-slate-400 text-xs">Cơ Bản</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">👑</div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{stats.advanced}</div>
              <div className="text-slate-400 text-xs">Nâng Cao</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-green-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">🟢</div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.activeToday || 0}</div>
              <div className="text-slate-400 text-xs">Online hôm nay</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl">🆕</div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">{stats.newThisWeek || 0}</div>
              <div className="text-slate-400 text-xs">Mới tuần này</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-4">
        {/* Search & View Toggle */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm theo tên, email, username..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Dạng bảng"
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Dạng lưới"
            >
              📱
            </button>
          </div>
          
          <button onClick={fetchUsers} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Làm mới">🔄</button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterTier}
            onChange={(e) => { setFilterTier(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">🎫 Tất cả gói</option>
            <option value="free">🆓 Miễn phí</option>
            <option value="basic">⭐ Cơ Bản</option>
            <option value="advanced">👑 Nâng Cao</option>
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">👤 Tất cả vai trò</option>
            <option value="user">👤 Người dùng</option>
            <option value="admin">🛡️ Quản trị</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          <div className="flex-1"></div>
          
          <span className="text-slate-400 text-sm">
            Hiển thị {paginatedUsers.length} / {filteredAndSortedUsers.length} người dùng
          </span>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <span className="text-purple-400 font-medium">✓ Đã chọn {selectedUsers.length} người dùng</span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
            >
              {BULK_ACTIONS.map(action => (
                <option key={action.value} value={action.value}>{action.label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thực hiện
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-3 py-1.5 text-slate-400 hover:text-white text-sm"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-300">Người dùng</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-300">Gói & Vai trò</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-300">Tiến độ</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-300">Hoạt động</th>
                  <th className="text-center px-4 py-4 text-sm font-medium text-slate-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-4xl mb-2">🔍</div>
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${selectedUsers.includes(user.id) ? 'bg-purple-500/10' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <MonsterAvatar 
                              seed={user.id || user.email}
                              size={40}
                              className="border-2 border-slate-600"
                              showBorder={false}
                            />
                            {user.role === 'admin' && (
                              <span className="absolute -top-1 -right-1 text-xs">🛡️</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name || 'Chưa đặt tên'}</div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                            {user.username && <div className="text-xs text-slate-500">@{user.username}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {getTierBadge(user.tier)}
                          {user.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">🛡️ Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">Lv.{user.level || 1}</span>
                            <span className="text-amber-400 text-sm">⭐ {user.totalStars || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-cyan-400">💎 {user.diamonds || 0}</span>
                            <span className="text-orange-400">🔥 {user.streak || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="text-slate-400">📅 {formatDate(user.createdAt)}</div>
                          <div className="text-slate-500 text-xs">🕐 {formatRelativeTime(user.lastLoginDate)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setDetailModal(user)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Xem chi tiết">👁️</button>
                          <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Sửa">✏️</button>
                          <button onClick={() => handleOpenPackage(user)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Kích hoạt gói">📦</button>
                          <button onClick={() => handleResetPassword(user.id)} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" title="Reset mật khẩu">🔑</button>
                          <button onClick={() => setDeleteConfirm(user)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Xóa">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 bg-slate-800 rounded-2xl">
              <div className="text-4xl mb-2">🔍</div>
              Không tìm thấy người dùng nào
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div
                key={user.id}
                className={`bg-slate-800 rounded-2xl border-2 p-4 transition-all hover:border-purple-500/50 ${
                  selectedUsers.includes(user.id) ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="relative">
                      <MonsterAvatar 
                        seed={user.id || user.email}
                        size={48}
                        className="border-2 border-slate-600"
                        showBorder={false}
                      />
                      {user.role === 'admin' && (
                        <span className="absolute -top-1 -right-1 text-sm">🛡️</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setDetailModal(user)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">👁️</button>
                    <button onClick={() => handleOpenEdit(user)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">✏️</button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="font-bold text-white truncate">{user.name || 'Chưa đặt tên'}</div>
                  <div className="text-sm text-slate-400 truncate">{user.email}</div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {getTierBadge(user.tier)}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                  <div className="bg-slate-700/50 rounded-lg py-2">
                    <div className="text-white font-bold">Lv.{user.level || 1}</div>
                    <div className="text-slate-500 text-xs">Level</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg py-2">
                    <div className="text-amber-400 font-bold">⭐{user.totalStars || 0}</div>
                    <div className="text-slate-500 text-xs">Sao</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg py-2">
                    <div className="text-orange-400 font-bold">🔥{user.streak || 0}</div>
                    <div className="text-slate-500 text-xs">Streak</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleOpenPackage(user)} className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30">📦 Gói</button>
                  <button onClick={() => setDeleteConfirm(user)} className="py-2 px-3 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-400 text-sm">/ trang</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏮️
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀️
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶️
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏭️
            </button>
          </div>
          
          <div className="text-slate-400 text-sm">
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">➕</div>
              <div>
                <h3 className="text-lg font-bold text-white">Thêm người dùng mới</h3>
                <p className="text-slate-400 text-sm">Tạo tài khoản cho người dùng</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Họ tên</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu *</label>
                <input
                  type="text"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Gói dịch vụ</label>
                <select
                  value={newUserForm.tier}
                  onChange={(e) => setNewUserForm({ ...newUserForm, tier: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="free">🆓 Miễn phí</option>
                  <option value="basic">⭐ Cơ Bản</option>
                  <option value="advanced">👑 Nâng Cao</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setAddUserModal(false)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleAddUser} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">Tạo người dùng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <MonsterAvatar 
                seed={editModal.id || editModal.email}
                size={48}
                className="border-2 border-slate-600"
                showBorder={false}
              />
              <div>
                <h3 className="text-lg font-bold text-white">Sửa thông tin</h3>
                <p className="text-slate-400 text-sm">{editModal.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Họ tên</label>
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vai trò</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user">👤 Người dùng</option>
                  <option value="admin">🛡️ Quản trị viên</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {packageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">📦</div>
              <div>
                <h3 className="text-lg font-bold text-white">Kích hoạt gói</h3>
                <p className="text-slate-400 text-sm">{packageModal.name || packageModal.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 p-3 bg-slate-700/50 rounded-lg">
              💡 Chọn gói để kích hoạt (áp dụng khi khách chuyển khoản thủ công)
            </p>
            <div className="space-y-3">
              {Object.entries(TIER_CONFIG).filter(([key]) => key !== 'vip').map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPackage === key ? `${config.borderColor} ${config.bgColor}` : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    value={key}
                    checked={selectedPackage === key}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className={`font-medium ${config.color}`}>{config.label}</div>
                    <div className="text-sm text-slate-400">
                      {key === 'free' && '3 bài học đầu tiên'}
                      {key === 'basic' && 'Level 1-10 • 199.000đ'}
                      {key === 'advanced' && 'Full 18 Level • 299.000đ'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setPackageModal(null)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleActivatePackage} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Kích hoạt gói</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="shrink-0 bg-slate-800 p-5 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-white">Chi tiết người dùng</h3>
              <button onClick={() => setDetailModal(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">✕</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <MonsterAvatar 
                    seed={detailModal.id || detailModal.email}
                    size={72}
                    className="border-2 border-slate-600"
                    showBorder={false}
                  />
                  {detailModal.role === 'admin' && (
                    <span className="absolute -top-1 -right-1 text-lg">🛡️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-white truncate">{detailModal.name || 'Chưa đặt tên'}</div>
                  <div className="text-slate-400 text-sm">@{detailModal.username || 'no-username'}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {getTierBadge(detailModal.tier)}
                    {detailModal.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Admin</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Main Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-3 text-center border border-purple-500/30">
                  <div className="text-xl font-bold text-white">Lv.{detailModal.level || 1}</div>
                  <div className="text-purple-400 text-xs">Level</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-3 text-center border border-amber-500/30">
                  <div className="text-xl font-bold text-amber-400">⭐ {(detailModal.totalStars || 0).toLocaleString()}</div>
                  <div className="text-amber-400/70 text-xs">Sao</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-3 text-center border border-cyan-500/30">
                  <div className="text-xl font-bold text-cyan-400">💎 {detailModal.diamonds || 0}</div>
                  <div className="text-cyan-400/70 text-xs">Kim cương</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-3 text-center border border-green-500/30">
                  <div className="text-xl font-bold text-green-400">✨ {(detailModal.totalEXP || 0).toLocaleString()}</div>
                  <div className="text-green-400/70 text-xs">EXP</div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-lg">🔥</div>
                  <div>
                    <div className="text-white font-bold">{detailModal.streak || 0} ngày</div>
                    <div className="text-slate-400 text-xs">Streak liên tiếp</div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-lg">📚</div>
                  <div>
                    <div className="text-white font-bold">{detailModal.completedLessons || 0} bài</div>
                    <div className="text-slate-400 text-xs">Đã hoàn thành</div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">🏆</div>
                  <div>
                    <div className="text-white font-bold">{detailModal.totalAchievements || 0}</div>
                    <div className="text-slate-400 text-xs">Thành tích</div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">🎯</div>
                  <div>
                    <div className="text-white font-bold">{detailModal.completedQuests || 0}</div>
                    <div className="text-slate-400 text-xs">Nhiệm vụ</div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-lg">⚔️</div>
                  <div>
                    <div className="text-white font-bold">{detailModal.totalMatches || 0} trận</div>
                    <div className="text-slate-400 text-xs">Thi đấu</div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg">⏱️</div>
                  <div>
                    <div className="text-white font-bold">{Math.round((detailModal.totalTimeSpent || 0) / 60)} phút</div>
                    <div className="text-slate-400 text-xs">Thời gian học</div>
                  </div>
                </div>
              </div>
              
              {/* Info Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">📧 Email</span>
                  <span className="text-white text-sm font-medium truncate ml-2 max-w-[200px]">{detailModal.email}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">📅 Ngày đăng ký</span>
                  <span className="text-white text-sm">{formatDate(detailModal.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">💳 Kích hoạt gói</span>
                  <span className="text-white text-sm">{formatDate(detailModal.tierPurchasedAt) || 'Chưa kích hoạt'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">🕐 Hoạt động cuối</span>
                  <span className="text-white text-sm">{formatRelativeTime(detailModal.lastLoginDate)}</span>
                </div>
              </div>
            </div>
              
            {/* Quick Actions - Fixed at bottom */}
            <div className="shrink-0 p-4 border-t border-slate-700 grid grid-cols-2 gap-2">
              <button
                onClick={() => { setDetailModal(null); handleOpenEdit(detailModal); }}
                className="p-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                ✏️ Sửa thông tin
              </button>
              <button
                onClick={() => { setDetailModal(null); handleOpenPackage(detailModal); }}
                className="p-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                📦 Kích hoạt gói
              </button>
              <button
                onClick={() => { handleResetPassword(detailModal.id); }}
                className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                🔑 Reset mật khẩu
              </button>
              <button
                onClick={() => { setDetailModal(null); setDeleteConfirm(detailModal); }}
                className="p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                🗑️ Xóa tài khoản
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
