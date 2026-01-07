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
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} border backdrop-blur-xl rounded-xl px-4 py-3 shadow-xl flex items-center gap-2`}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
    </div>
  );
}

const TYPES = [
  { value: 'daily', label: 'Hàng ngày', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'weekly', label: 'Hàng tuần', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'special', label: 'Đặc biệt', color: 'bg-amber-500/20 text-amber-400' }
];

// Categories thực tế trong database
const CATEGORIES = [
  { value: 'learn', label: 'Học tập', icon: '📚' },
  { value: 'lesson', label: 'Học tập', icon: '📚' },
  { value: 'practice', label: 'Luyện tập', icon: '🎯' },
  { value: 'compete', label: 'Thi đấu', icon: '⚔️' },
  { value: 'social', label: 'Xã hội', icon: '👥' },
  { value: 'streak', label: 'Chuỗi ngày', icon: '🔥' },
  { value: 'accuracy', label: 'Độ chính xác', icon: '🎯' },
  { value: 'mastery', label: 'Thành thạo', icon: '🏆' }
];

// Categories đơn giản cho filter dropdown (nhóm lại)
const FILTER_CATEGORIES = [
  { value: 'learn', label: 'Học tập', icon: '📚' },
  { value: 'practice', label: 'Luyện tập', icon: '🎯' },
  { value: 'compete', label: 'Thi đấu', icon: '⚔️' },
  { value: 'streak', label: 'Chuỗi ngày', icon: '🔥' },
  { value: 'social', label: 'Xã hội', icon: '👥' }
];

// Tất cả requirement types có trong database
const REQUIREMENT_TYPES = [
  // === BÀI HỌC ===
  { value: 'complete_lessons', label: 'Hoàn thành bài học', icon: '📚', unit: 'bài', hasTarget: true },
  { value: 'complete_all_lessons', label: 'Hoàn thành tất cả bài học', icon: '📖', unit: '', hasTarget: false },
  { value: 'three_star_lessons', label: 'Đạt 3 sao bài học', icon: '⭐', unit: 'bài', hasTarget: true },
  { value: 'three_star_all_lessons', label: 'Đạt 3 sao tất cả bài học', icon: '🌟', unit: '', hasTarget: false },
  { value: 'complete_levels', label: 'Hoàn thành màn', icon: '🎮', unit: 'màn', hasTarget: true },
  
  // === LUYỆN TẬP ===
  { value: 'complete_exercises', label: 'Hoàn thành lượt luyện tập', icon: '✏️', unit: 'lượt', hasTarget: true },
  { value: 'accurate_exercises', label: 'Trả lời đúng', icon: '✅', unit: 'câu', hasTarget: true },
  { value: 'accuracy_streak', label: 'Chuỗi trả lời đúng liên tiếp', icon: '🎯', unit: 'câu', hasTarget: true },
  { value: 'perfect_exercises', label: 'Đạt điểm tối đa', icon: '💯', unit: 'lượt', hasTarget: true },
  { value: 'perfect_exercise', label: 'Đạt điểm tối đa', icon: '💯', unit: 'lượt', hasTarget: true },
  { value: 'total_practice', label: 'Tổng lượt luyện tập', icon: '🎯', unit: 'lượt', hasTarget: true },
  
  // === TỐC ĐỘ ===
  { value: 'fast_exercise', label: 'Trả lời nhanh', icon: '⚡', unit: 'giây', hasTarget: true },
  { value: 'fast_streak', label: 'Chuỗi trả lời nhanh liên tiếp', icon: '🏃', unit: 'câu', hasTarget: true },
  { value: 'speed_master', label: 'Bậc thầy tốc độ', icon: '🚀', unit: '', hasTarget: false },
  { value: 'speed_rush', label: 'Tia chớp', icon: '💨', unit: '', hasTarget: false },
  
  // === THI ĐẤU ===
  { value: 'win_compete', label: 'Chiến thắng trận thi đấu', icon: '🏆', unit: 'trận', hasTarget: true },
  { value: 'compete_matches', label: 'Tham gia thi đấu', icon: '⚔️', unit: 'trận', hasTarget: true },
  { value: 'compete_first_place', label: 'Đạt hạng nhất thi đấu', icon: '🥇', unit: 'lần', hasTarget: true },
  
  // === CHUỖI NGÀY ===
  { value: 'login_streak', label: 'Đăng nhập liên tiếp', icon: '🔥', unit: 'ngày', hasTarget: true },
  { value: 'streak', label: 'Chuỗi ngày hoạt động', icon: '🔥', unit: 'ngày', hasTarget: true },
  
  // === THÀNH TÍCH ===
  { value: 'unlock_achievements', label: 'Mở khóa thành tích', icon: '🏅', unit: 'thành tích', hasTarget: true },
  { value: 'unlock_all_achievements', label: 'Mở tất cả thành tích', icon: '👑', unit: '', hasTarget: false },
  
  // === ĐẶC BIỆT ===
  { value: 'birthday_login', label: 'Đăng nhập ngày sinh nhật', icon: '🎂', unit: '', hasTarget: false },
  { value: 'early_adopter', label: 'Người dùng đầu tiên', icon: '🌅', unit: '', hasTarget: false },
  
  // === PHẦN THƯỞNG ===
  { value: 'earn_stars', label: 'Tích lũy sao', icon: '⭐', unit: 'sao', hasTarget: true },
  { value: 'earn_diamonds', label: 'Tích lũy kim cương', icon: '💎', unit: 'viên', hasTarget: true },
  { value: 'reach_level', label: 'Đạt màn', icon: '📈', unit: 'màn', hasTarget: true, isLevel: true },
  { value: 'perfect_score', label: 'Điểm tuyệt đối', icon: '💯', unit: 'lần', hasTarget: true },
  { value: 'play_time', label: 'Thời gian chơi', icon: '⏱️', unit: 'phút', hasTarget: true }
];

// Helper function để hiển thị requirement dạng dễ đọc
function formatRequirement(requirement) {
  if (!requirement) return { text: 'Chưa thiết lập', icon: '❓' };
  
  const req = typeof requirement === 'string' ? JSON.parse(requirement) : requirement;
  const type = req.type;
  const target = req.target || req.count || 1;
  
  const typeConfig = REQUIREMENT_TYPES.find(t => t.value === type);
  
  if (!typeConfig) {
    return { text: `${type}: ${target}`, icon: '📝' };
  }
  
  if (typeConfig.hasTarget) {
    return { 
      text: `${target} ${typeConfig.unit}`, 
      icon: typeConfig.icon,
      label: typeConfig.label
    };
  }
  
  return { 
    text: typeConfig.label, 
    icon: typeConfig.icon,
    label: ''
  };
}

// Component builder cho requirement
function RequirementBuilder({ value, onChange }) {
  const [reqType, setReqType] = useState('complete_lessons');
  const [target, setTarget] = useState(1);
  const [levelId, setLevelId] = useState('');

  // Parse giá trị ban đầu
  useEffect(() => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed.type) setReqType(parsed.type);
      if (parsed.target) setTarget(parsed.target);
      if (parsed.levelId) setLevelId(parsed.levelId);
    } catch (e) {}
  }, []);

  // Cập nhật JSON khi thay đổi
  useEffect(() => {
    const requirement = { type: reqType, target: parseInt(target) || 1 };
    if (reqType === 'reach_level' && levelId) {
      requirement.levelId = levelId;
    }
    onChange(JSON.stringify(requirement));
  }, [reqType, target, levelId]);

  const currentType = REQUIREMENT_TYPES.find(t => t.value === reqType) || REQUIREMENT_TYPES[0];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Loại điều kiện *</label>
        <select
          value={reqType}
          onChange={(e) => setReqType(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
        >
          {REQUIREMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>
      
      {currentType.hasTarget && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Mục tiêu {currentType.unit ? `(${currentType.unit})` : ''} *
          </label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            min={1}
            placeholder={`Nhập số ${currentType.unit}`}
          />
        </div>
      )}

      {currentType.isLevel && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">ID Cấp độ (tùy chọn)</label>
          <input
            type="text"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            placeholder="Để trống nếu không giới hạn"
          />
        </div>
      )}

      {/* Preview JSON */}
      <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
        <div className="text-xs text-slate-500 mb-1">Điều kiện:</div>
        <div className="text-sm text-emerald-400 font-medium">
          {currentType.icon} {currentType.label}: {target} {currentType.unit}
        </div>
      </div>
    </div>
  );
}

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  
  // Toast & Confirm states
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'learn',
    requirement: '{"type":"complete_lessons","target":1}',
    stars: 50,
    diamonds: 10,
    expiresAt: '',
    isActive: true
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchQuests();
  }, [filterType, filterCategory]);

  // Filter và tìm kiếm quests
  const filteredQuests = useMemo(() => {
    if (!searchQuery.trim()) return quests;
    const query = searchQuery.toLowerCase();
    return quests.filter(quest => 
      quest.title?.toLowerCase().includes(query) ||
      quest.description?.toLowerCase().includes(query)
    );
  }, [quests, searchQuery]);

  // Phân trang
  const paginatedQuests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuests, currentPage, itemsPerPage]);

  // Reset trang khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterCategory]);

  const fetchQuests = async () => {
    try {
      let url = '/api/admin/quests';
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterCategory) params.set('category', filterCategory);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url);
      const data = await res.json();
      setQuests(data.quests || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingQuest ? 'PUT' : 'POST';
      const body = editingQuest 
        ? { ...formData, id: editingQuest.id }
        : formData;

      const res = await fetch('/api/admin/quests', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingQuest(null);
        resetForm();
        fetchQuests();
        showToast(editingQuest ? 'Cập nhật nhiệm vụ thành công' : 'Thêm nhiệm vụ thành công', 'success');
      } else {
        showToast(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      type: 'danger',
      title: 'Xóa nhiệm vụ',
      message: 'Bạn có chắc muốn xóa nhiệm vụ này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/quests?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            fetchQuests();
            showToast('Đã xóa nhiệm vụ', 'success');
          } else {
            showToast(data.error, 'error');
          }
        } catch (error) {
          showToast('Có lỗi xảy ra', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleToggleActive = async (quest) => {
    try {
      const res = await fetch('/api/admin/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quest.id, isActive: !quest.isActive })
      });
      const data = await res.json();
      if (data.success) {
        fetchQuests();
        showToast(quest.isActive ? 'Đã tắt nhiệm vụ' : 'Đã bật nhiệm vụ', 'success');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const openEditModal = (quest) => {
    setEditingQuest(quest);
    setFormData({
      title: quest.title,
      description: quest.description,
      type: quest.type,
      category: quest.category,
      requirement: JSON.stringify(quest.requirement, null, 2),
      stars: quest.stars,
      diamonds: quest.diamonds,
      expiresAt: quest.expiresAt ? new Date(quest.expiresAt).toISOString().split('T')[0] : '',
      isActive: quest.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      category: 'learn',
      requirement: '{"type":"complete_lessons","target":1}',
      stars: 50,
      diamonds: 10,
      expiresAt: '',
      isActive: true
    });
  };

  const getTypeConfig = (type) => TYPES.find(t => t.value === type) || TYPES[0];
  const getCategoryConfig = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">🎯 Quản lí Nhiệm vụ</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm truncate">Tạo và quản lí nhiệm vụ hàng ngày, hàng tuần</p>
          </div>
          <button
            onClick={() => { setEditingQuest(null); resetForm(); setShowModal(true); }}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-1"
          >
            <span>+</span> <span className="hidden sm:inline">Thêm nhiệm vụ</span><span className="sm:hidden">Thêm nhiệm vụ</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-white">{stats.total || 0}</div>
            <div className="text-slate-400 text-[10px] sm:text-sm">Tổng nhiệm vụ</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.active || 0}</div>
            <div className="text-slate-400 text-[10px] sm:text-sm">Hàng ngày</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{stats.weekly || 0}</div>
            <div className="text-slate-400 text-[10px] sm:text-sm">Đặc biệt</div>
          </div>
          <div className="hidden sm:block bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{stats.daily || 0}</div>
            <div className="text-slate-400 text-sm">Hàng ngày</div>
          </div>
          <div className="hidden sm:block bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-amber-400">{stats.special || 0}</div>
            <div className="text-slate-400 text-sm">Đặc biệt</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-[150px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm kiếm..."
                className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white font-medium text-sm hidden sm:block">Loại:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="">Tất cả loại</option>
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white font-medium text-sm hidden sm:block">Danh mục:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="">Tất cả</option>
                {FILTER_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Nhiệm vụ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Loại</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Điều kiện</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Phần thưởng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Thống kê</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : paginatedQuests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      {searchQuery ? 'Không tìm thấy nhiệm vụ phù hợp' : 'Chưa có nhiệm vụ nào'}
                    </td>
                  </tr>
                ) : (
                  paginatedQuests.map((quest) => {
                    const typeConfig = getTypeConfig(quest.type);
                    const catConfig = getCategoryConfig(quest.category);
                    const formatted = formatRequirement(quest.requirement);
                    return (
                      <tr key={quest.id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{quest.title}</div>
                          <div className="text-slate-400 text-sm truncate max-w-xs">{quest.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white">
                          {catConfig.icon} {catConfig.label}
                        </td>
                        <td className="px-4 py-3">
                          <div className="bg-slate-900/50 px-2 py-1 rounded">
                            <div className="flex items-center gap-2">
                              <span>{formatted.icon}</span>
                              <div>
                                {formatted.label && (
                                  <div className="text-xs text-slate-500">{formatted.label}</div>
                                )}
                                <div className="text-sm text-emerald-400 font-medium">{formatted.text}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400">⭐ {quest.stars}</span>
                            <span className="text-purple-400">💎 {quest.diamonds}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-400">
                            <div>{quest.completedCount || 0} hoàn thành</div>
                            <div>{quest.claimedCount || 0} đã nhận</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(quest)}
                            className={`px-3 py-1 rounded text-sm ${
                              quest.isActive 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {quest.isActive ? '✓ Hoạt động' : '✗ Tắt'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditModal(quest)}
                            className="px-3 py-1 text-blue-400 hover:bg-blue-500/20 rounded mr-2"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(quest.id)}
                            className="px-3 py-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden p-3 space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Đang tải...</div>
            ) : paginatedQuests.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {searchQuery ? 'Không tìm thấy nhiệm vụ phù hợp' : 'Chưa có nhiệm vụ nào'}
              </div>
            ) : (
              paginatedQuests.map((quest) => {
                const typeConfig = getTypeConfig(quest.type);
                const catConfig = getCategoryConfig(quest.category);
                const formatted = formatRequirement(quest.requirement);
                return (
                  <div key={quest.id} className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className="text-slate-400 text-xs">{catConfig.icon} {catConfig.label}</span>
                      </div>
                      <button
                        onClick={() => handleToggleActive(quest)}
                        className={`px-2 py-0.5 rounded text-xs ${
                          quest.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {quest.isActive ? '✓' : '✗'}
                      </button>
                    </div>
                    
                    {/* Title */}
                    <div className="text-white font-medium text-sm mb-1">{quest.title}</div>
                    <div className="text-slate-400 text-xs mb-2 line-clamp-2">{quest.description}</div>
                    
                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <div className="bg-slate-900/50 px-2 py-1 rounded flex items-center gap-1">
                        <span>{formatted.icon}</span>
                        <span className="text-emerald-400">{formatted.text}</span>
                      </div>
                      <span className="text-amber-400">⭐{quest.stars}</span>
                      <span className="text-purple-400">💎{quest.diamonds}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-600">
                      <button onClick={() => openEditModal(quest)} className="flex-1 py-1.5 text-blue-400 hover:bg-blue-500/20 rounded text-sm">✏️ Sửa</button>
                      <button onClick={() => handleDelete(quest.id)} className="flex-1 py-1.5 text-red-400 hover:bg-red-500/20 rounded text-sm">🗑️ Xóa</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {filteredQuests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span className="hidden sm:inline">Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs sm:text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span><span className="hidden sm:inline">trong tổng số </span>{filteredQuests.length}</span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm"
                >
                  ←
                </button>
                
                {/* Mobile: Show current/total */}
                <span className="sm:hidden px-3 py-1 text-white text-sm">{currentPage}/{Math.ceil(filteredQuests.length / itemsPerPage)}</span>
                
                {/* Desktop: Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.ceil(filteredQuests.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(filteredQuests.length / itemsPerPage);
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-slate-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] px-2 py-1 rounded ${
                            currentPage === page
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredQuests.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredQuests.length / itemsPerPage)}
                  className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {editingQuest ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ mới'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Tiêu đề *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    placeholder="VD: Hoàn thành 3 bài học"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Mô tả *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    rows={2}
                    placeholder="Mô tả chi tiết nhiệm vụ"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Loại *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      {TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Danh mục *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300">Điều kiện hoàn thành *</label>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {showAdvanced ? '← Đơn giản' : 'Nâng cao →'}
                    </button>
                  </div>
                  
                  {showAdvanced ? (
                    <div>
                      <textarea
                        value={formData.requirement}
                        onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-xs sm:text-sm"
                        rows={4}
                        placeholder='{"type":"complete_lessons","target":3}'
                        required
                      />
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                        Các loại: complete_lessons, complete_exercises, win_compete, login_streak, earn_stars, earn_diamonds
                      </p>
                    </div>
                  ) : (
                    <RequirementBuilder
                      value={formData.requirement}
                      onChange={(req) => setFormData({...formData, requirement: req})}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Sao thưởng ⭐</label>
                    <input
                      type="number"
                      value={formData.stars}
                      onChange={(e) => setFormData({...formData, stars: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Kim cương 💎</label>
                    <input
                      type="number"
                      value={formData.diamonds}
                      onChange={(e) => setFormData({...formData, diamonds: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      min={0}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Ngày hết hạn (tùy chọn)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    Kích hoạt nhiệm vụ
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm order-2 sm:order-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm order-1 sm:order-2"
                  >
                    {editingQuest ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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