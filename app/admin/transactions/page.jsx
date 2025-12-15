'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminConfirmDialog from '@/components/Admin/AdminConfirmDialog';

// Simple toast component inline
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
    : type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400'
    : 'bg-blue-500/20 border-blue-500/30 text-blue-400';

  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} border backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl animate-slide-in flex items-center gap-2`}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Toast & Confirm states
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm flex items-center gap-1">✓ Hoàn thành</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm flex items-center gap-1">⏳ Đang chờ</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Đã hủy</span>;
      case 'expired':
        return <span className="px-3 py-1 bg-slate-600 text-slate-400 rounded-full text-sm">Hết hạn</span>;
      default:
        return <span className="px-3 py-1 bg-slate-600 text-slate-400 rounded-full text-sm">{status}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'new':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">Mua mới</span>;
      case 'upgrade':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">Nâng cấp</span>;
      case 'renew':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Gia hạn</span>;
      default:
        return <span className="px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs">{type}</span>;
    }
  };

  const getPackageBadge = (pkg) => {
    switch (pkg) {
      case 'basic':
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-xs flex items-center gap-1">⭐ Cơ Bản</span>;
      case 'advanced':
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-xs flex items-center gap-1">👑 Nâng Cao</span>;
      default:
        return <span className="px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs">{pkg}</span>;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (search && !t.orderId?.toLowerCase().includes(search.toLowerCase()) && 
        !t.user?.email?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPackage !== 'all' && t.packageType !== filterPackage) return false;
    if (filterType !== 'all' && t.transactionType !== filterType) return false;
    return true;
  });

  // Paginated data
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset page when filter changes
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    // Mở link xuất CSV
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterPackage !== 'all') params.set('package', filterPackage);
    window.open(`/api/admin/transactions/export?${params.toString()}`, '_blank');
  };

  const handleDeleteCancelled = () => {
    setConfirmDialog({
      type: 'danger',
      title: 'Xóa đơn hàng đã hủy',
      message: 'Bạn có chắc muốn xóa TẤT CẢ đơn hàng đã hủy? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa tất cả',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/transactions?status=cancelled', { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
            fetchTransactions();
          } else {
            showToast(data.error || 'Có lỗi xảy ra', 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra khi xóa', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteExpired = () => {
    setConfirmDialog({
      type: 'danger',
      title: 'Xóa đơn hàng hết hạn',
      message: 'Bạn có chắc muốn xóa TẤT CẢ đơn hàng hết hạn? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa tất cả',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/transactions?status=expired', { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
            fetchTransactions();
          } else {
            showToast(data.error || 'Có lỗi xảy ra', 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra khi xóa', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleConfirmPayment = (id) => {
    setConfirmDialog({
      type: 'success',
      title: 'Xác nhận thanh toán',
      message: 'Xác nhận đơn hàng này đã thanh toán thành công? Gói sẽ được kích hoạt ngay.',
      confirmText: 'Xác nhận',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/transactions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'completed' })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
            fetchTransactions();
          } else {
            showToast(data.error || 'Có lỗi xảy ra', 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleCancelOrder = (id) => {
    setConfirmDialog({
      type: 'warning',
      title: 'Hủy đơn hàng',
      message: 'Bạn có chắc muốn hủy đơn hàng này?',
      confirmText: 'Hủy đơn',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/transactions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'cancelled' })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
            fetchTransactions();
          } else {
            showToast(data.error || 'Có lỗi xảy ra', 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleDeleteSingle = (id) => {
    setConfirmDialog({
      type: 'danger',
      title: 'Xóa vĩnh viễn',
      message: 'Bạn có chắc muốn XÓA VĨNH VIỄN đơn hàng này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/transactions?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
            fetchTransactions();
          } else {
            showToast(data.error || 'Có lỗi xảy ra', 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra khi xóa', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
        <button
          onClick={handleDeleteCancelled}
          className="px-3 sm:px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">Xóa đơn hủy</span>
        </button>
        <button
          onClick={handleDeleteExpired}
          className="px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-red-500/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span className="hidden sm:inline">Xóa đơn hết hạn</span>
        </button>
        <button
          onClick={handleExportExcel}
          className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-5 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm mb-1">Tổng đơn</div>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalOrders}</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-5 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm mb-1">Hoàn thành</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.completedOrders}</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-5 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm mb-1">Đang chờ</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">{stats.pendingOrders}</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3 sm:p-5 border border-slate-700">
          <div className="text-slate-400 text-xs sm:text-sm mb-1">Doanh thu</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-700">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
                placeholder="Tìm theo mã đơn, email..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus)(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="pending">Đang chờ</option>
              <option value="cancelled">Đã hủy</option>
              <option value="expired">Hết hạn</option>
            </select>
            <select
              value={filterPackage}
              onChange={(e) => handleFilterChange(setFilterPackage)(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả gói</option>
              <option value="basic">Cơ Bản</option>
              <option value="advanced">Nâng Cao</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(setFilterType)(e.target.value)}
              className="hidden sm:block px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả loại GD</option>
              <option value="new">Mua mới</option>
              <option value="upgrade">Nâng cấp</option>
              <option value="renew">Gia hạn</option>
            </select>
            <button
              onClick={fetchTransactions}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Mã đơn</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Người dùng</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Loại GD</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Gói</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Số tiền</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Thời gian</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <span className="text-purple-400 font-medium">{t.orderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-300">
                          {t.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-white">{t.user?.name || 'Unknown'}</div>
                          <div className="text-sm text-slate-400">{t.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(t.transactionType)}
                      {t.upgradeFrom && (
                        <div className="text-xs text-slate-500 mt-1">
                          {t.upgradeFrom} → {t.upgradeTo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getPackageBadge(t.packageType)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{formatCurrency(t.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-slate-300">{formatDate(t.createdAt)}</div>
                      {t.completedAt && (
                        <div className="text-emerald-400 text-xs">
                          Thanh toán: {formatDate(t.completedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {t.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleConfirmPayment(t.id)}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" 
                              title="Xác nhận thanh toán"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleCancelOrder(t.id)}
                              className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors"
                              title="Hủy đơn"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {/* Nút xóa riêng từng giao dịch */}
                        <button 
                          onClick={() => handleDeleteSingle(t.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Xóa vĩnh viễn"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Xem chi tiết">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
              <span className="hidden sm:inline">Hiển thị {paginatedTransactions.length} / {filteredTransactions.length} giao dịch</span>
              <span className="sm:hidden">{paginatedTransactions.length}/{filteredTransactions.length}</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 sm:px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs sm:text-sm"
              >
                <option value={10}>10/trang</option>
                <option value={20}>20/trang</option>
                <option value={50}>50/trang</option>
                <option value={100}>100/trang</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent text-xs sm:text-sm"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent text-xs sm:text-sm"
              >
                «
              </button>
              
              {/* Page numbers - hide on very small screens */}
              <span className="sm:hidden px-3 py-1.5 text-white text-sm">{currentPage}/{totalPages}</span>
              <div className="hidden sm:flex items-center gap-1">
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
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
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
                className="px-2 sm:px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent text-xs sm:text-sm"
              >
                »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent text-xs sm:text-sm"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400 border border-slate-700">
            Chưa có giao dịch nào
          </div>
        ) : (
          <>
            {paginatedTransactions.map((t) => (
              <div key={t.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-medium text-sm">{t.orderId}</span>
                  {getStatusBadge(t.status)}
                </div>
                
                {/* User */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-300 text-sm">
                    {t.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{t.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400 truncate">{t.user?.email}</div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">Loại GD</span>
                    <div>{getTypeBadge(t.transactionType)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Gói</span>
                    <div>{getPackageBadge(t.packageType)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Số tiền</span>
                    <div className="font-semibold text-white">{formatCurrency(t.amount)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Thời gian</span>
                    <div className="text-slate-300 text-xs">{formatDate(t.createdAt)}</div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-700">
                  {t.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleConfirmPayment(t.id)}
                        className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                      >
                        ✓ Xác nhận
                      </button>
                      <button 
                        onClick={() => handleCancelOrder(t.id)}
                        className="flex-1 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors"
                      >
                        ✕ Hủy
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteSingle(t.id)}
                    className="py-2 px-3 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                    title="Xóa vĩnh viễn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            {/* Mobile Pagination */}
            {filteredTransactions.length > 0 && (
              <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-3 border border-slate-700">
                <span className="text-slate-400 text-xs">{paginatedTransactions.length}/{filteredTransactions.length} giao dịch</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 text-sm"
                  >
                    «
                  </button>
                  <span className="px-3 py-1.5 text-white text-sm">{currentPage}/{totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 text-sm"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <AdminConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          type={confirmDialog.type}
        />
      )}
    </div>
  );
}
