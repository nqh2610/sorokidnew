'use client';

import { useState, useEffect, useMemo } from 'react';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import AdminConfirmDialog from '@/components/Admin/AdminConfirmDialog';

// 🔧 Helper function to calculate level from total stars (same as Dashboard)
function calculateLevelFromStars(totalStars) {
  if (!totalStars || totalStars <= 0) return 1;
  let level = Math.floor((totalStars + 50) / 150);
  // Ensure minimum level 1
  return Math.max(1, level);
}

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
  { value: 'lastActive', label: '🕐 Hoạt động gần đây' },
  { value: 'gameStage', label: '🎮 Theo màn phiêu lưu' }
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
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', phone: '', role: 'user' });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', username: '', phone: '', password: '', tier: 'free' });
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  // Trial extend states
  const [trialDays, setTrialDays] = useState(0);
  const [extendingTrial, setExtendingTrial] = useState(null);
  
  // Certificate states for edit modal
  const [userCertificates, setUserCertificates] = useState([]);
  const [updateCertificates, setUpdateCertificates] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  
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
      case 'gameStage':
        result.sort((a, b) => (b.gameProgress?.highestStage || 0) - (a.gameProgress?.highestStage || 0));
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
    
    const actionLabels = {
      'activate_basic': 'kích hoạt gói Cơ Bản',
      'activate_advanced': 'kích hoạt gói Nâng Cao',
      'deactivate': 'chuyển về Miễn phí'
    };

    setConfirmDialog({
      type: 'warning',
      title: 'Xác nhận hành động hàng loạt',
      message: `Bạn có chắc muốn ${actionLabels[bulkAction]} cho ${selectedUsers.length} người dùng?`,
      confirmText: 'Thực hiện',
      onConfirm: async () => {
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
        setConfirmDialog(null);
      }
    });
  };

  const handleOpenEdit = async (user) => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      role: user.role || 'user'
    });
    setEditModal(user);
    setUpdateCertificates(false);
    setSelectedCertificates([]);
    setUserCertificates([]);
    
    // Fetch certificates của user
    setLoadingCertificates(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/users/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          updateCertificates,
          certificateIds: selectedCertificates.length > 0 ? selectedCertificates : null
        })
      });
      if (res.ok) {
        const data = await res.json();
        fetchUsers();
        setEditModal(null);
        
        let message = 'Đã cập nhật thông tin người dùng!';
        if (data.updatedCertificates > 0) {
          message += ` (Đã cập nhật ${data.updatedCertificates} chứng chỉ)`;
        }
        showToast(message);
      } else {
        const data = await res.json();
        showToast(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleToggleCertificate = (certId) => {
    setSelectedCertificates(prev => 
      prev.includes(certId) 
        ? prev.filter(id => id !== certId)
        : [...prev, certId]
    );
  };

  const handleSelectAllCertificates = () => {
    if (selectedCertificates.length === userCertificates.length) {
      setSelectedCertificates([]);
    } else {
      setSelectedCertificates(userCertificates.map(c => c.id));
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
        setNewUserForm({ name: '', email: '', username: '', phone: '', password: '', tier: 'free' });
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

  // Extend trial for user
  const handleExtendTrial = async (userId, days) => {
    if (days < 0 || days > 365) {
      showToast('Số ngày phải từ 0-365', 'error');
      return;
    }
    
    setExtendingTrial(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/extend-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
        // Cập nhật detailModal nếu đang mở
        if (detailModal?.id === userId) {
          setDetailModal(prev => ({
            ...prev,
            trialExpiresAt: data.user.trialExpiresAt
          }));
        }
        showToast(data.message);
        setTrialDays(0);
      } else {
        showToast(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error extending trial:', error);
      showToast('Có lỗi xảy ra', 'error');
    } finally {
      setExtendingTrial(null);
    }
  };

  // Helper: Tính thông tin trial còn lại (ngày, giờ, phút)
  const getTrialInfoDetail = (trialExpiresAt) => {
    if (!trialExpiresAt) return null;
    const now = new Date();
    const expires = new Date(trialExpiresAt);
    const diffMs = expires - now;
    
    // Tính số ngày (so sánh theo ngày)
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiresDate = new Date(expires.getFullYear(), expires.getMonth(), expires.getDate());
    const days = Math.floor((expiresDate - nowDate) / (1000 * 60 * 60 * 24));
    
    // Tính giờ và phút còn lại
    const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
    
    return {
      days,
      hours,
      minutes,
      isActive: diffMs > 0
    };
  };

  // Helper cũ để tương thích
  const getTrialDaysRemaining = (trialExpiresAt) => {
    const info = getTrialInfoDetail(trialExpiresAt);
    return info ? info.days : null;
  };

  const handleResetPassword = (userId) => {
    setConfirmDialog({
      type: 'warning',
      title: 'Reset mật khẩu',
      message: 'Bạn có chắc muốn reset mật khẩu cho người dùng này? Mật khẩu mới sẽ được tạo tự động.',
      confirmText: 'Reset',
      onConfirm: async () => {
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
        setConfirmDialog(null);
      }
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">👥 Quản lí Người dùng</h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm truncate">Quản lí tài khoản, gói dịch vụ và phân quyền</p>
        </div>
        <button
          onClick={() => setAddUserModal(true)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm"
        >
          <span>➕</span> <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg sm:text-xl">👥</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-[10px] sm:text-xs">Tổng cộng</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 hover:border-slate-500/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-500/20 flex items-center justify-center text-lg sm:text-xl">🆓</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-300">{stats.free}</div>
              <div className="text-slate-400 text-[10px] sm:text-xs">Miễn phí</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg sm:text-xl">⭐</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.basic}</div>
              <div className="text-slate-400 text-[10px] sm:text-xs">Cơ Bản</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg sm:text-xl">👑</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{stats.advanced}</div>
              <div className="text-slate-400 text-[10px] sm:text-xs">Nâng Cao</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 hover:border-green-500/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-lg sm:text-xl">🟢</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.activeToday || 0}</div>
              <div className="text-slate-400 text-[10px] sm:text-xs">Online hôm nay</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors hidden sm:block">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-lg sm:text-xl">🆕</div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">{stats.newThisWeek || 0}</div>
              <div className="text-slate-400 text-[10px] sm:text-xs">Mới tuần này</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700 space-y-3 sm:space-y-4">
        {/* Search & View Toggle */}
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <div className="flex-1 min-w-[180px] sm:min-w-[250px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm theo tên, email, username..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Dạng bảng"
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Dạng lưới"
            >
              📱
            </button>
          </div>
          
          <button onClick={fetchUsers} className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Làm mới">🔄</button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <select
            value={filterTier}
            onChange={(e) => { setFilterTier(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">🎫 Tất cả gói</option>
            <option value="free">🆓 Miễn phí</option>
            <option value="basic">⭐ Cơ Bản</option>
            <option value="advanced">👑 Nâng Cao</option>
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">👤 Tất cả vai trò</option>
            <option value="user">👤 Người dùng</option>
            <option value="admin">🛡️ Quản trị</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden sm:block px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          <div className="hidden sm:block flex-1"></div>
          
          <span className="hidden sm:inline text-slate-400 text-sm">
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

      {/* Table View - Hidden on mobile */}
      {viewMode === 'table' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
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
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-300">Trial</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-slate-300">Hoạt động</th>
                  <th className="text-center px-4 py-4 text-sm font-medium text-slate-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
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
                            {user.phone && <div className="text-xs text-green-400">📱 {user.phone}</div>}
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
                            <span className="text-white font-medium">Lv.{calculateLevelFromStars(user.totalStars)}</span>
                            <span className="text-amber-400 text-sm">⭐ {user.totalStars || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-cyan-400">💎 {user.diamonds || 0}</span>
                            <span className="text-orange-400">🔥 {user.streak || 0}</span>
                          </div>
                          {/* 🎮 Game Stage */}
                          {user.gameProgress?.hasPlayed && (
                            <div className="text-xs text-green-400">
                              🎮 Màn {user.gameProgress.highestStage}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {(() => {
                          const daysRemaining = getTrialDaysRemaining(user.trialExpiresAt);
                          if (daysRemaining === null) {
                            return <span className="text-slate-500 text-sm">—</span>;
                          }
                          if (daysRemaining > 0) {
                            return (
                              <div className="space-y-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  daysRemaining <= 2 ? 'bg-red-500/20 text-red-400' :
                                  daysRemaining <= 5 ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  ⏰ Còn {daysRemaining} ngày
                                </span>
                                <div className="text-xs text-slate-500">
                                  Đến {new Date(user.trialExpiresAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <span className="px-2 py-1 bg-slate-600/30 text-slate-400 rounded-full text-xs">
                              Đã hết
                            </span>
                          );
                        })()}
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

          {/* Mobile Card View for Table Mode */}
          <div className="sm:hidden p-3 space-y-3">
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm">Không tìm thấy người dùng nào</p>
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <div key={user.id} className={`bg-slate-700/50 rounded-xl p-3 border ${selectedUsers.includes(user.id) ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600'}`}>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="w-4 h-4 rounded"
                    />
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
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{user.name || 'Chưa đặt tên'}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      {user.phone && <div className="text-xs text-green-400">📱 {user.phone}</div>}
                    </div>
                    {getTierBadge(user.tier)}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                    <div className="bg-slate-800/50 rounded-lg p-1.5">
                      <div className="text-white font-bold text-sm">Lv.{calculateLevelFromStars(user.totalStars)}</div>
                      <div className="text-[10px] text-slate-500">Level</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-1.5">
                      <div className="text-amber-400 font-bold text-sm">⭐{user.totalStars || 0}</div>
                      <div className="text-[10px] text-slate-500">Sao</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-1.5">
                      <div className="text-cyan-400 font-bold text-sm">💎{user.diamonds || 0}</div>
                      <div className="text-[10px] text-slate-500">KC</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-1.5">
                      <div className="text-orange-400 font-bold text-sm">🔥{user.streak || 0}</div>
                      <div className="text-[10px] text-slate-500">Streak</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1 pt-2 border-t border-slate-600">
                    <button onClick={() => setDetailModal(user)} className="flex-1 py-1.5 text-slate-400 hover:bg-slate-600 rounded text-xs">👁️ Chi tiết</button>
                    <button onClick={() => handleOpenEdit(user)} className="flex-1 py-1.5 text-slate-400 hover:bg-slate-600 rounded text-xs">✏️ Sửa</button>
                    <button onClick={() => handleOpenPackage(user)} className="flex-1 py-1.5 text-blue-400 hover:bg-blue-500/20 rounded text-xs">📦 Gói</button>
                    <button onClick={() => setDeleteConfirm(user)} className="py-1.5 px-2 text-red-400 hover:bg-red-500/20 rounded text-xs">🗑️</button>
                  </div>
                </div>
              ))
            )}
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
                  {user.phone && <div className="text-xs text-green-400 mt-1">📱 {user.phone}</div>}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {getTierBadge(user.tier)}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                  <div className="bg-slate-700/50 rounded-lg py-2">
                    <div className="text-white font-bold">Lv.{calculateLevelFromStars(user.totalStars)}</div>
                    <div className="text-slate-500 text-xs">Level</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg py-2">
                    <div className="text-amber-400 font-bold">⭐{user.totalStars || 0}</div>
                    <div className="text-slate-500 text-xs">Sao</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg py-2">
                    <div className={`font-bold ${user.gameProgress?.hasPlayed ? 'text-green-400' : 'text-slate-500'}`}>
                      🎮{user.gameProgress?.highestStage || 0}
                    </div>
                    <div className="text-slate-500 text-xs">Màn</div>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <span className="text-slate-400 text-xs sm:text-sm hidden sm:inline">Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs sm:text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-400 text-xs sm:text-sm">/ trang</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="hidden sm:block p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏮️
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="hidden sm:block p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏭️
            </button>
          </div>
          
          <div className="text-slate-400 text-xs sm:text-sm order-3">
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-slate-700 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl sm:text-2xl">➕</div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Thêm người dùng mới</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Tạo tài khoản cho người dùng</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Họ tên</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Mật khẩu *</label>
                <input
                  type="text"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Gói dịch vụ</label>
                <select
                  value={newUserForm.tier}
                  onChange={(e) => setNewUserForm({ ...newUserForm, tier: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="free">🆓 Miễn phí</option>
                  <option value="basic">⭐ Cơ Bản</option>
                  <option value="advanced">👑 Nâng Cao</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button onClick={() => setAddUserModal(false)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm order-2 sm:order-1">Hủy</button>
              <button onClick={handleAddUser} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm order-1 sm:order-2">Tạo người dùng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-lg border border-slate-700 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <MonsterAvatar 
                seed={editModal.id || editModal.email}
                size={40}
                className="border-2 border-slate-600 sm:w-12 sm:h-12"
                showBorder={false}
              />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Sửa thông tin</h3>
                <p className="text-slate-400 text-xs sm:text-sm truncate">{editModal.email}</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Họ tên</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Vai trò</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user">👤 Người dùng</option>
                  <option value="admin">🛡️ Quản trị viên</option>
                </select>
              </div>
              
              {/* Certificates Section */}
              <div className="pt-3 sm:pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="text-xs sm:text-sm font-medium text-slate-300">
                    📜 Cập nhật tên chứng chỉ
                  </label>
                  {loadingCertificates && (
                    <span className="text-[10px] sm:text-xs text-slate-400">Đang tải...</span>
                  )}
                </div>
                
                {userCertificates.length > 0 ? (
                  <>
                    <label className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={updateCertificates}
                        onChange={(e) => {
                          setUpdateCertificates(e.target.checked);
                          if (!e.target.checked) setSelectedCertificates([]);
                        }}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-xs sm:text-sm text-slate-300">
                        Cập nhật tên trong chứng chỉ
                      </span>
                    </label>
                    
                    {updateCertificates && (
                      <div className="space-y-2 bg-slate-700/50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] sm:text-xs text-slate-400">
                            Chọn ({selectedCertificates.length}/{userCertificates.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleSelectAllCertificates}
                            className="text-[10px] sm:text-xs text-purple-400 hover:text-purple-300"
                          >
                            {selectedCertificates.length === userCertificates.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                          {userCertificates.map((cert) => (
                            <label
                              key={cert.id}
                              className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedCertificates.includes(cert.id) 
                                  ? 'bg-purple-500/20 border border-purple-500/50' 
                                  : 'bg-slate-600/50 hover:bg-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCertificates.includes(cert.id)}
                                onChange={() => handleToggleCertificate(cert.id)}
                                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-white truncate">
                                  {cert.certType === 'addition_subtraction' && '🧮 Cộng Trừ'}
                                  {cert.certType === 'comprehensive' && '🏆 Toàn diện'}
                                  {!['addition_subtraction', 'comprehensive'].includes(cert.certType) && `📜 ${cert.certType}`}
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                                  <span className="text-amber-400">{cert.recipientName}</span>
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                        
                        {selectedCertificates.length === 0 && (
                          <p className="text-[10px] sm:text-xs text-amber-400 mt-2">
                            ⚠️ Chưa chọn → Cập nhật tất cả
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 italic">
                    {loadingCertificates ? 'Đang tải...' : 'Chưa có chứng chỉ'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm order-2 sm:order-1">Hủy</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm order-1 sm:order-2">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {packageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-slate-700 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl sm:text-2xl">📦</div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Kích hoạt gói</h3>
                <p className="text-slate-400 text-xs sm:text-sm truncate">{packageModal.name || packageModal.email}</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4 p-2 sm:p-3 bg-slate-700/50 rounded-lg">
              💡 Chọn gói để kích hoạt (áp dụng khi khách chuyển khoản thủ công)
            </p>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(TIER_CONFIG).filter(([key]) => key !== 'vip').map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPackage === key ? `${config.borderColor} ${config.bgColor}` : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    value={key}
                    checked={selectedPackage === key}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-xl sm:text-2xl">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm sm:text-base ${config.color}`}>{config.label}</div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      {key === 'free' && '3 bài học đầu tiên'}
                      {key === 'basic' && 'Level 1-10 • 199.000đ'}
                      {key === 'advanced' && 'Full 18 Level • 299.000đ'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button onClick={() => setPackageModal(null)} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm order-2 sm:order-1">Hủy</button>
              <button onClick={handleActivatePackage} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm order-1 sm:order-2">Kích hoạt gói</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="shrink-0 bg-slate-800 p-3 sm:p-5 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-base sm:text-lg font-bold text-white">Chi tiết người dùng</h3>
              <button onClick={() => setDetailModal(null)} className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">✕</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              {/* Avatar & Name */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="relative">
                  <MonsterAvatar 
                    seed={detailModal.id || detailModal.email}
                    size={56}
                    className="border-2 border-slate-600 sm:w-[72px] sm:h-[72px]"
                    showBorder={false}
                  />
                  {detailModal.role === 'admin' && (
                    <span className="absolute -top-1 -right-1 text-base sm:text-lg">🛡️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base sm:text-lg font-bold text-white truncate">{detailModal.name || 'Chưa đặt tên'}</div>
                  <div className="text-slate-400 text-sm">@{detailModal.username || 'no-username'}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {getTierBadge(detailModal.tier)}
                    {detailModal.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Admin</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Main Stats - Simplified */}
              <div className="grid grid-cols-4 gap-2 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-2 sm:p-3 text-center border border-purple-500/30">
                  <div className="text-lg sm:text-xl font-bold text-white">Lv.{calculateLevelFromStars(detailModal.totalStars)}</div>
                  <div className="text-purple-400 text-[10px] sm:text-xs">Level</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-2 sm:p-3 text-center border border-amber-500/30">
                  <div className="text-lg sm:text-xl font-bold text-amber-400">⭐ {(detailModal.totalStars || 0).toLocaleString()}</div>
                  <div className="text-amber-400/70 text-[10px] sm:text-xs">Sao</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-2 sm:p-3 text-center border border-cyan-500/30">
                  <div className="text-lg sm:text-xl font-bold text-cyan-400">💎 {detailModal.diamonds || 0}</div>
                  <div className="text-cyan-400/70 text-[10px] sm:text-xs">Kim cương</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-2 sm:p-3 text-center border border-orange-500/30">
                  <div className="text-lg sm:text-xl font-bold text-orange-400">🔥 {detailModal.streak || 0}</div>
                  <div className="text-orange-400/70 text-[10px] sm:text-xs">Streak</div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-white font-bold text-sm sm:text-base">📚 {detailModal.completedLessons || 0}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Bài học</div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-white font-bold text-sm sm:text-base">🏆 {detailModal.totalAchievements || 0}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Thành tích</div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-white font-bold text-sm sm:text-base">🎯 {detailModal.completedQuests || 0}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Nhiệm vụ</div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-white font-bold text-sm sm:text-base">⚔️ {detailModal.totalMatches || 0}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Thi đấu</div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-white font-bold text-sm sm:text-base">📜 {detailModal.totalCertificates || 0}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Chứng chỉ</div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-white font-bold text-sm sm:text-base">✅ {detailModal.totalCorrect || 0}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Câu đúng (TĐ)</div>
                </div>
              </div>

              {/* 🔥 Exercise Statistics Section */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 sm:p-4 border border-blue-500/30 mb-3 sm:mb-4">
                <div className="text-blue-400 text-xs sm:text-sm font-medium mb-2">📝 Thống kê luyện tập</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-white font-bold text-sm sm:text-base">{detailModal.totalExercises || 0}</div>
                    <div className="text-slate-400 text-[10px] sm:text-xs">Số bài</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold text-sm sm:text-base">{detailModal.accuracy || 0}%</div>
                    <div className="text-slate-400 text-[10px] sm:text-xs">Chính xác</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-cyan-400 font-bold text-sm sm:text-base">{detailModal.avgSpeed || 0}s</div>
                    <div className="text-slate-400 text-[10px] sm:text-xs">TB/câu</div>
                  </div>
                </div>
              </div>

              {/* 🎮 Game Progress Section */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 sm:p-4 border border-amber-500/30 mb-3 sm:mb-4">
                <div className="text-amber-400 text-xs sm:text-sm font-medium mb-2">🎮 Tiến độ phiêu lưu</div>
                {detailModal.gameProgress?.hasPlayed ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300 text-xs">Màn cao nhất (1-138)</span>
                      <span className="text-amber-400 font-bold">
                        {detailModal.gameProgress.highestStage || 0}
                        {detailModal.gameProgress.currentStage > 0 && detailModal.gameProgress.highestStage === 0 && (
                          <span className="text-yellow-300 ml-1">(đang chơi #{detailModal.gameProgress.currentStage})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300 text-xs">Vùng đất</span>
                      <span className="text-amber-400 font-medium capitalize">{detailModal.gameProgress.highestZone?.replace(/-/g, ' ') || detailModal.gameProgress.currentZone?.replace(/-/g, ' ') || '-'}</span>
                    </div>
                    {/* Chi tiết hoạt động */}
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="bg-slate-700/50 rounded-lg p-1.5">
                        <div className="text-blue-400 font-bold text-xs">{detailModal.gameProgress.startedLessons || 0}</div>
                        <div className="text-slate-500 text-[8px]">Bài học</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-1.5">
                        <div className="text-green-400 font-bold text-xs">{detailModal.gameProgress.attemptedExercises || 0}</div>
                        <div className="text-slate-500 text-[8px]">Luyện tập</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-1.5">
                        <div className="text-red-400 font-bold text-xs">{detailModal.gameProgress.attemptedArenas || 0}</div>
                        <div className="text-slate-500 text-[8px]">Đấu trường</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                        <div className="text-green-400 font-bold">{detailModal.gameProgress.addSubStage || 0}/88</div>
                        <div className="text-slate-400 text-[10px]">Màn Cộng/Trừ</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                        <div className="text-purple-400 font-bold">{detailModal.gameProgress.mulDivStage || 0}/50</div>
                        <div className="text-slate-400 text-[10px]">Màn Nhân/Chia</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 text-slate-500 text-xs">
                    <span className="text-2xl">🚫</span>
                    <div className="mt-1">Chưa chơi phiêu lưu</div>
                  </div>
                )}
              </div>

              {/* Info Details */}
              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-xs sm:text-sm">📧 Email</span>
                  <span className="text-white text-xs sm:text-sm font-medium truncate ml-2 max-w-[150px] sm:max-w-[200px]">{detailModal.email}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-xs sm:text-sm">📱 Điện thoại</span>
                  <span className="text-green-400 text-xs sm:text-sm font-medium">{detailModal.phone || 'Chưa có'}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-xs sm:text-sm">📅 Đăng ký</span>
                  <span className="text-white text-xs sm:text-sm">{formatDate(detailModal.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-xs sm:text-sm">💳 Kích hoạt</span>
                  <span className="text-white text-xs sm:text-sm">{formatDate(detailModal.tierPurchasedAt) || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-xs sm:text-sm">🕐 Hoạt động</span>
                  <span className="text-white text-xs sm:text-sm">{formatRelativeTime(detailModal.lastLoginDate)}</span>
                </div>
              </div>
              
              {/* Trial Section - Luôn hiển thị để admin có thể cấp/quản lý trial */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 sm:p-4 border border-purple-500/30 mb-3 sm:mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-xs sm:text-sm font-medium">🎁 Học thử</span>
                  {(() => {
                    if (!detailModal.trialExpiresAt) {
                      return <span className="text-slate-500 text-xs">Chưa kích hoạt</span>;
                    }
                    const trialInfo = getTrialInfoDetail(detailModal.trialExpiresAt);
                    if (!trialInfo || !trialInfo.isActive) {
                      return <span className="text-slate-500 text-xs">⏹️ Đã kết thúc</span>;
                    } else if (trialInfo.days === 0) {
                      return <span className="text-red-400 text-xs font-medium">⏰ Còn {trialInfo.hours}h {trialInfo.minutes}p</span>;
                    } else if (trialInfo.days === 1) {
                      return <span className="text-orange-400 text-xs font-medium">🌟 Ngày cuối</span>;
                    } else if (trialInfo.days <= 3) {
                      return <span className="text-yellow-400 text-xs font-medium">⚡ Còn {trialInfo.days} ngày</span>;
                    } else {
                      return <span className="text-green-400 text-xs font-medium">🎉 Còn {trialInfo.days} ngày</span>;
                    }
                  })()}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    placeholder="Số ngày"
                    value={trialDays}
                    onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 w-20"
                  />
                  <button
                    onClick={() => handleExtendTrial(detailModal.id, trialDays)}
                    disabled={extendingTrial === detailModal.id}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    {extendingTrial === detailModal.id ? '...' : trialDays === 0 ? 'Xóa trial' : 'Cấp trial'}
                  </button>
                </div>
                <p className="text-slate-500 text-[10px] mt-1.5">Nhập 0 để xóa trial, hoặc số ngày để cấp/gia hạn</p>
              </div>
            </div>
              
            {/* Quick Actions - Fixed at bottom */}
            <div className="shrink-0 p-3 sm:p-4 border-t border-slate-700 grid grid-cols-2 gap-2">
              <button
                onClick={() => { setDetailModal(null); handleOpenEdit(detailModal); }}
                className="p-2 sm:p-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                ✏️ <span className="hidden sm:inline">Sửa thông tin</span><span className="sm:hidden">Sửa</span>
              </button>
              <button
                onClick={() => { setDetailModal(null); handleOpenPackage(detailModal); }}
                className="p-2 sm:p-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                📦 <span className="hidden sm:inline">Kích hoạt gói</span><span className="sm:hidden">Gói</span>
              </button>
              <button
                onClick={() => { handleResetPassword(detailModal.id); }}
                className="p-2 sm:p-2.5 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                🔑 <span className="hidden sm:inline">Reset mật khẩu</span><span className="sm:hidden">Reset</span>
              </button>
              <button
                onClick={() => { setDetailModal(null); setDeleteConfirm(detailModal); }}
                className="p-2 sm:p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                🗑️ <span className="hidden sm:inline">Xóa tài khoản</span><span className="sm:hidden">Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Xác nhận xóa</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-slate-300 text-sm">
                Bạn có chắc muốn xóa người dùng <strong className="text-white">{deleteConfirm.name || deleteConfirm.email}</strong>?
              </p>
              <p className="text-red-400 text-xs sm:text-sm mt-2">
                Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Confirm Dialog */}
      {confirmDialog && (
        <AdminConfirmDialog
          type={confirmDialog.type}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
