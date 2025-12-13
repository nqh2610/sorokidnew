'use client';

import { useState, useEffect, useMemo } from 'react';

// =============================================
// CONSTANTS
// =============================================
const PRACTICE_TYPES = [
  { value: 'create', label: 'Tạo số trên Soroban', icon: '🧮', description: 'Yêu cầu tạo một số cụ thể', fields: ['target'] },
  { value: 'calc', label: 'Tính toán', icon: '🔢', description: 'Giải bài toán cộng/trừ', fields: ['problem', 'answer', 'hint'] },
  { value: 'explore', label: 'Khám phá', icon: '🔍', description: 'Khám phá với hướng dẫn', fields: ['instruction', 'target'] },
  { value: 'mental', label: 'Tính nhẩm', icon: '🧠', description: 'Tính nhẩm có giới hạn thời gian', fields: ['problem', 'answer', 'timeLimit'] },
  { value: 'chain', label: 'Chuỗi phép tính', icon: '🔗', description: 'Nhiều phép tính liên tiếp', fields: ['problems', 'answer'] },
  { value: 'friend5', label: 'Bạn nhỏ (=5)', icon: '🖐️', description: 'Tìm số bạn nhỏ cộng = 5', fields: ['question', 'answer'] },
  { value: 'friend10', label: 'Bạn lớn (=10)', icon: '🤝', description: 'Tìm số bạn lớn cộng = 10', fields: ['question', 'answer'] },
  { value: 'memory', label: 'Ghép đôi', icon: '🎴', description: 'Ghép đôi thẻ nhớ', fields: ['pairs'] },
  { value: 'speed', label: 'Tốc độ', icon: '⚡', description: 'Làm nhanh nhiều bài', fields: ['count', 'difficulty', 'timeLimit'] }
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Dễ', color: 'bg-green-500/20 text-green-400', icon: '🌱' },
  { value: 2, label: 'Trung bình', color: 'bg-blue-500/20 text-blue-400', icon: '🌿' },
  { value: 3, label: 'Khó', color: 'bg-orange-500/20 text-orange-400', icon: '🌳' },
  { value: 4, label: 'Rất khó', color: 'bg-red-500/20 text-red-400', icon: '🔥' },
  { value: 5, label: 'Thử thách', color: 'bg-purple-500/20 text-purple-400', icon: '💎' }
];

const LEVEL_ICONS = ['📚', '🧮', '🎯', '🔥', '⭐', '💎', '🏆', '🚀', '🌟', '👑', '🎮', '🧠', '💡', '📖', '✨'];

// =============================================
// HELPER COMPONENTS
// =============================================

// Component để thêm/sửa một practice item
function PracticeItemEditor({ item, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const typeConfig = PRACTICE_TYPES.find(t => t.value === item.type) || PRACTICE_TYPES[0];
  
  const updateField = (field, value) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeConfig.icon}</span>
          <span className="text-white font-medium">Câu {index + 1}</span>
          <span className="text-slate-400 text-sm">({typeConfig.label})</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" title="Di chuyển lên">↑</button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="p-1 text-slate-400 hover:text-white disabled:opacity-30" title="Di chuyển xuống">↓</button>
          <button type="button" onClick={onRemove} className="p-1 text-red-400 hover:text-red-300 ml-2" title="Xóa câu hỏi">✕</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Loại câu hỏi */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Loại câu hỏi</label>
          <select value={item.type} onChange={(e) => updateField('type', e.target.value)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm">
            {PRACTICE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
            ))}
          </select>
        </div>

        {/* Fields theo loại */}
        {(item.type === 'create' || item.type === 'explore') && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">{item.type === 'create' ? 'Số cần tạo' : 'Số mục tiêu'}</label>
            <input type="number" value={item.target || ''} onChange={(e) => updateField('target', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder="VD: 5" />
          </div>
        )}

        {item.type === 'explore' && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Hướng dẫn</label>
            <input type="text" value={item.instruction || ''} onChange={(e) => updateField('instruction', e.target.value)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder="VD: Hãy tạo số 5 trên Soroban" />
          </div>
        )}

        {(item.type === 'calc' || item.type === 'mental' || item.type === 'friend5' || item.type === 'friend10') && (
          <>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{item.type.startsWith('friend') ? 'Câu hỏi' : 'Phép tính'}</label>
              <input type="text" value={item.type.startsWith('friend') ? (item.question || '') : (item.problem || '')} onChange={(e) => updateField(item.type.startsWith('friend') ? 'question' : 'problem', e.target.value)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder={item.type.startsWith('friend') ? 'VD: Bạn của 3 là?' : 'VD: 5 + 3'} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Đáp án</label>
              <input type="number" value={item.answer || ''} onChange={(e) => updateField('answer', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder="VD: 8" />
            </div>
          </>
        )}

        {item.type === 'calc' && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Gợi ý (tùy chọn)</label>
            <input type="text" value={item.hint || ''} onChange={(e) => updateField('hint', e.target.value)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder="VD: Nhớ dùng bạn nhỏ nhé!" />
          </div>
        )}

        {(item.type === 'mental' || item.type === 'speed') && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Thời gian (giây)</label>
            <input type="number" value={item.timeLimit || 30} onChange={(e) => updateField('timeLimit', parseInt(e.target.value) || 30)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" min={5} />
          </div>
        )}

        {item.type === 'chain' && (
          <>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Chuỗi phép tính (cách nhau bởi dấu phẩy)</label>
              <input type="text" value={Array.isArray(item.problems) ? item.problems.join(', ') : ''} onChange={(e) => updateField('problems', e.target.value.split(',').map(s => s.trim()))} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder="VD: +3, -2, +5" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kết quả cuối</label>
              <input type="number" value={item.answer || ''} onChange={(e) => updateField('answer', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" />
            </div>
          </>
        )}

        {item.type === 'speed' && (
          <>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Số câu</label>
              <input type="number" value={item.count || 5} onChange={(e) => updateField('count', parseInt(e.target.value) || 5)} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" min={1} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Độ khó</label>
              <select value={item.difficulty || 1} onChange={(e) => updateField('difficulty', parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm">
                {DIFFICULTY_LEVELS.map(d => (<option key={d.value} value={d.value}>{d.icon} {d.label}</option>))}
              </select>
            </div>
          </>
        )}

        {item.type === 'memory' && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Các cặp ghép (format: a:b, c:d)</label>
            <input type="text" value={Array.isArray(item.pairs) ? item.pairs.map(p => `${p[0]}:${p[1]}`).join(', ') : ''} onChange={(e) => { const pairs = e.target.value.split(',').map(pair => { const [a, b] = pair.trim().split(':'); return [a?.trim(), b?.trim()]; }).filter(p => p[0] && p[1]); updateField('pairs', pairs); }} className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm" placeholder="VD: 1:một, 2:hai, 3:ba" />
          </div>
        )}
      </div>
    </div>
  );
}

// Component để xây dựng nội dung lý thuyết
function TheoryBuilder({ items, onChange }) {
  const [lines, setLines] = useState(items || []);

  useEffect(() => { setLines(items || []); }, [items]);

  const updateLine = (index, value) => {
    const newLines = [...lines];
    newLines[index] = value;
    setLines(newLines);
    onChange(newLines);
  };

  const addLine = (type) => {
    let newLine = '';
    switch (type) {
      case 'heading': newLine = '🧠 **Tiêu đề mới**'; break;
      case 'subheading': newLine = '🔹 **Tiêu đề phụ**'; break;
      case 'text': newLine = 'Nội dung văn bản...'; break;
      case 'example': newLine = '   Ví dụ: 1 + 2 = 3'; break;
      default: newLine = '';
    }
    const newLines = [...lines, newLine];
    setLines(newLines);
    onChange(newLines);
  };

  const removeLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
    onChange(newLines);
  };

  const moveLine = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= lines.length) return;
    const newLines = [...lines];
    [newLines[index], newLines[newIndex]] = [newLines[newIndex], newLines[index]];
    setLines(newLines);
    onChange(newLines);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">Nội dung lý thuyết</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => addLine('heading')} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">+ Tiêu đề</button>
          <button type="button" onClick={() => addLine('text')} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">+ Văn bản</button>
          <button type="button" onClick={() => addLine('example')} className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30">+ Ví dụ</button>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="text-center py-4 text-slate-500 bg-slate-700/30 rounded-lg">Chưa có nội dung. Nhấn các nút ở trên để thêm.</div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {lines.map((line, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => moveLine(index, -1)} disabled={index === 0} className="text-slate-500 hover:text-white disabled:opacity-30 text-xs">↑</button>
                <button type="button" onClick={() => moveLine(index, 1)} disabled={index === lines.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 text-xs">↓</button>
              </div>
              <input type="text" value={line} onChange={(e) => updateLine(index, e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm" placeholder="Nhập nội dung..." />
              <button type="button" onClick={() => removeLine(index)} className="text-red-400 hover:text-red-300 px-2">✕</button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">💡 Dùng **văn bản** để in đậm. Dùng emoji ở đầu dòng để tạo tiêu đề section (🧠, 📚, 💡...). Thụt đầu dòng bằng 3 dấu cách để tạo nội dung phụ.</p>
    </div>
  );
}

// Component để xây dựng nội dung bài tập
function PracticeBuilder({ items: initialItems, onChange }) {
  const [items, setItems] = useState(initialItems || []);

  useEffect(() => { setItems(initialItems || []); }, [initialItems]);

  const updateItem = (index, newItem) => {
    const newItems = [...items];
    newItems[index] = newItem;
    setItems(newItems);
    onChange(newItems);
  };

  const addItem = (type) => {
    let newItem = { type };
    switch (type) {
      case 'create': newItem.target = 5; break;
      case 'calc': newItem = { type, problem: '3 + 2', answer: 5, hint: '' }; break;
      case 'explore': newItem = { type, instruction: 'Hãy tạo số...', target: 5 }; break;
      case 'mental': newItem = { type, problem: '5 + 3', answer: 8, timeLimit: 30 }; break;
      case 'friend5': newItem = { type, question: 'Bạn của 3 là?', answer: 2 }; break;
      case 'friend10': newItem = { type, question: 'Bạn của 7 là?', answer: 3 }; break;
      case 'chain': newItem = { type, problems: ['+3', '-2', '+5'], answer: 6 }; break;
      case 'speed': newItem = { type, count: 5, difficulty: 1, timeLimit: 60 }; break;
      case 'memory': newItem = { type, pairs: [['1', 'một'], ['2', 'hai']] }; break;
    }
    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-sm font-medium text-slate-300">Bài tập thực hành ({items.length} câu)</label>
        <div className="flex flex-wrap gap-2">
          {PRACTICE_TYPES.slice(0, 4).map(type => (
            <button key={type.value} type="button" onClick={() => addItem(type.value)} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30" title={type.description}>
              {type.icon} {type.label}
            </button>
          ))}
          <div className="relative group">
            <button type="button" className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded hover:bg-slate-500">+ Thêm...</button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-slate-700 rounded-lg shadow-xl z-10 p-2 min-w-[150px]">
              {PRACTICE_TYPES.slice(4).map(type => (
                <button key={type.value} type="button" onClick={() => addItem(type.value)} className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-600 rounded flex items-center gap-2">
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 text-slate-500 bg-slate-700/30 rounded-lg">Chưa có bài tập. Nhấn các nút ở trên để thêm câu hỏi.</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <PracticeItemEditor key={index} item={item} index={index} onChange={(newItem) => updateItem(index, newItem)} onRemove={() => removeItem(index)} onMoveUp={() => moveItem(index, -1)} onMoveDown={() => moveItem(index, 1)} isFirst={index === 0} isLast={index === items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function để format practice preview
function formatPracticePreview(practice) {
  if (!practice || practice.length === 0) return 'Chưa có bài tập';
  const types = {};
  practice.forEach(p => { types[p.type] = (types[p.type] || 0) + 1; });
  return Object.entries(types).map(([type, count]) => {
    const config = PRACTICE_TYPES.find(t => t.value === type);
    return `${config?.icon || '📝'} ${count}`;
  }).join(' ');
}

// Helper function để lấy config độ khó
function getDifficultyConfig(d) {
  return DIFFICULTY_LEVELS.find(l => l.value === d) || DIFFICULTY_LEVELS[0];
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  
  // Tab state for lesson modal
  const [activeTab, setActiveTab] = useState('basic');
  
  // Lesson form data - tách riêng theory và practice
  const [lessonForm, setLessonForm] = useState({
    levelId: '',
    lessonId: '',
    title: '',
    description: '',
    theory: [],
    practice: [],
    difficulty: 1,
    duration: 15,
    stars: 10,
    videoUrl: '',
    order: 1,
    isLocked: false
  });

  // Level form data
  const [levelForm, setLevelForm] = useState({
    id: '',
    name: '',
    icon: '📚',
    description: '',
    order: 1,
    isActive: true
  });

  // Group lessons by level
  const lessonsByLevel = useMemo(() => {
    const grouped = {};
    lessons.forEach(lesson => {
      if (!grouped[lesson.levelId]) grouped[lesson.levelId] = [];
      grouped[lesson.levelId].push(lesson);
    });
    return grouped;
  }, [lessons]);

  // Filter lessons by selected level and search
  const filteredLessons = useMemo(() => {
    let result = lessons;
    
    if (selectedLevel) {
      result = result.filter(lesson => String(lesson.levelId) === selectedLevel);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lesson => 
        lesson.title?.toLowerCase().includes(query) ||
        lesson.description?.toLowerCase().includes(query) ||
        String(lesson.lessonId).includes(query)
      );
    }
    
    return result;
  }, [lessons, selectedLevel, searchQuery]);

  // Phân trang
  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLessons.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLessons, currentPage, itemsPerPage]);

  // Reset trang khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel]);

  useEffect(() => {
    fetchData();
  }, [selectedLevel]);

  const fetchData = async () => {
    try {
      const url = selectedLevel 
        ? `/api/admin/lessons?levelId=${selectedLevel}` 
        : '/api/admin/lessons';
      const res = await fetch(url);
      const data = await res.json();
      setLessons(data.lessons || []);
      setLevels(data.levels || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LESSON HANDLERS =====
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuyển theory và practice thành content JSON
      const content = {
        theory: lessonForm.theory,
        practice: lessonForm.practice
      };

      const body = {
        levelId: lessonForm.levelId,
        lessonId: lessonForm.lessonId,
        title: lessonForm.title,
        description: lessonForm.description,
        content: JSON.stringify(content),
        difficulty: lessonForm.difficulty,
        duration: lessonForm.duration,
        stars: lessonForm.stars,
        videoUrl: lessonForm.videoUrl,
        order: lessonForm.order,
        isLocked: lessonForm.isLocked
      };

      if (editingLesson) {
        body.id = editingLesson.id;
      }

      const res = await fetch('/api/admin/lessons', {
        method: editingLesson ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setShowLessonModal(false);
        setEditingLesson(null);
        resetLessonForm();
        fetchData();
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
      const res = await fetch(`/api/admin/lessons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const openEditLessonModal = (lesson) => {
    setEditingLesson(lesson);
    // Parse content nếu là string JSON
    let content = {};
    try {
      if (typeof lesson.content === 'string') {
        content = JSON.parse(lesson.content || '{}');
      } else {
        content = lesson.content || {};
      }
    } catch (e) {
      console.error('Error parsing lesson content:', e);
      content = {};
    }
    
    setLessonForm({
      levelId: lesson.levelId,
      lessonId: lesson.lessonId,
      title: lesson.title,
      description: lesson.description,
      theory: content.theory || [],
      practice: content.practice || [],
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      stars: lesson.stars,
      videoUrl: lesson.videoUrl || '',
      order: lesson.order,
      isLocked: lesson.isLocked
    });
    setActiveTab('basic');
    setShowLessonModal(true);
  };

  const resetLessonForm = () => {
    setLessonForm({
      levelId: selectedLevel || '',
      lessonId: '',
      title: '',
      description: '',
      theory: [],
      practice: [],
      difficulty: 1,
      duration: 15,
      stars: 10,
      videoUrl: '',
      order: 1,
      isLocked: false
    });
  };

  // ===== LEVEL HANDLERS =====
  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/levels', {
        method: editingLevel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelForm)
      });

      const data = await res.json();
      if (data.success) {
        setShowLevelModal(false);
        setEditingLevel(null);
        resetLevelForm();
        fetchData();
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDeleteLevel = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa Level này? Level phải không có bài học nào để có thể xóa.')) return;
    try {
      const res = await fetch(`/api/admin/levels?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (selectedLevel === String(id)) setSelectedLevel('');
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const openEditLevelModal = (level) => {
    setEditingLevel(level);
    setLevelForm({
      id: level.id,
      name: level.name,
      icon: level.icon,
      description: level.description || '',
      order: level.order,
      isActive: level.isActive
    });
    setShowLevelModal(true);
  };

  const resetLevelForm = () => {
    setLevelForm({
      id: levels.length + 1,
      name: '',
      icon: '📚',
      description: '',
      order: levels.length + 1,
      isActive: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">📚 Quản lí Bài học</h1>
          <p className="text-slate-400 mt-1">Quản lí Level (Màn) và Bài học (Nhiệm vụ)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingLevel(null); resetLevelForm(); setShowLevelModal(true); }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            + Thêm Level
          </button>
          <button
            onClick={() => { setEditingLesson(null); resetLessonForm(); setActiveTab('basic'); setShowLessonModal(true); }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            + Thêm Bài học
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stats.totalLevels || 0}</div>
          <div className="text-slate-400 text-sm">Tổng Level</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl font-bold text-purple-400">{stats.totalLessons || 0}</div>
          <div className="text-slate-400 text-sm">Tổng Bài học</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">{(stats.totalLessons || 0) - (stats.lockedLessons || 0)}</div>
          <div className="text-slate-400 text-sm">Đã mở khóa</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl font-bold text-amber-400">{stats.lockedLessons || 0}</div>
          <div className="text-slate-400 text-sm">Đang khóa</div>
        </div>
      </div>

      {/* Levels Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">🎮 Danh sách Level (Màn chơi)</h2>
        </div>
        <div className="p-4">
          {levels.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Chưa có Level nào. Nhấn "Thêm Level" để tạo mới.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className={`rounded-xl p-4 border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                    selectedLevel === String(level.id)
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedLevel(selectedLevel === String(level.id) ? '' : String(level.id))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{level.icon}</span>
                      <div>
                        <div className="text-white font-bold">Level {level.id}</div>
                        <div className="text-slate-300 text-sm">{level.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEditLevelModal(level); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="Sửa">✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteLevel(level.id); }} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Xóa">🗑️</button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{lessonsByLevel[level.id]?.length || 0} bài học</span>
                    <span className={level.isActive ? 'text-green-400' : 'text-red-400'}>{level.isActive ? '✓ Hoạt động' : '✗ Tắt'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            📖 Danh sách Bài học {selectedLevel && `(Level ${selectedLevel})`}
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm bài học..."
              className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 w-48"
            />
            {selectedLevel && (
              <button onClick={() => setSelectedLevel('')} className="text-sm text-slate-400 hover:text-white">✕ Bỏ lọc</button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Bài</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Tiêu đề</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Nội dung</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Độ khó</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Sao</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Trạng thái</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : paginatedLessons.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  {searchQuery ? 'Không tìm thấy bài học phù hợp' : `Chưa có bài học nào${selectedLevel ? ' trong level này' : ''}`}
                </td></tr>
              ) : (
                paginatedLessons.map((lesson) => {
                  const content = typeof lesson.content === 'string' ? JSON.parse(lesson.content || '{}') : (lesson.content || {});
                  const theory = content.theory || [];
                  const practice = content.practice || [];
                  const diffConfig = getDifficultyConfig(lesson.difficulty);
                  return (
                    <tr key={lesson.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">Lv.{lesson.levelId}</span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{lesson.lessonId}</td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{lesson.title}</div>
                        <div className="text-slate-400 text-sm truncate max-w-xs">{lesson.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-cyan-400">📖 {theory.length} lý thuyết</span>
                          <span className="text-xs text-purple-400">{formatPracticePreview(practice)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 ${diffConfig.bgColor} ${diffConfig.color} rounded text-sm`}>
                          {diffConfig.icon} {diffConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-400 font-medium">⭐ {lesson.stars}</td>
                      <td className="px-4 py-3">
                        {lesson.isLocked ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">🔒 Khóa</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">✓ Mở</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEditLessonModal(lesson)} className="px-3 py-1 text-blue-400 hover:bg-blue-500/20 rounded mr-2">✏️ Sửa</button>
                        <button onClick={() => handleDeleteLesson(lesson.id)} className="px-3 py-1 text-red-400 hover:bg-red-500/20 rounded">🗑️ Xóa</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLessons.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>trong tổng số {filteredLessons.length} bài học</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                ←
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(filteredLessons.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
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
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLessons.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredLessons.length / itemsPerPage)}
                className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Level Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">{editingLevel ? 'Sửa Level' : 'Thêm Level mới'}</h2>
            </div>
            <form onSubmit={handleLevelSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Level ID *</label>
                  <input type="number" value={levelForm.id} onChange={(e) => setLevelForm({...levelForm, id: parseInt(e.target.value) || ''})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required disabled={!!editingLevel} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={levelForm.icon} onChange={(e) => setLevelForm({...levelForm, icon: e.target.value})} className="w-20 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl" maxLength={2} />
                    <div className="flex flex-wrap gap-1">
                      {LEVEL_ICONS.map(icon => (
                        <button key={icon} type="button" onClick={() => setLevelForm({...levelForm, icon})} className={`p-1 text-lg rounded ${levelForm.icon === icon ? 'bg-purple-500' : 'hover:bg-slate-600'}`}>{icon}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên Level *</label>
                <input type="text" value={levelForm.name} onChange={(e) => setLevelForm({...levelForm, name: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" placeholder="VD: Làm quen với Soroban" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả</label>
                <textarea value={levelForm.description} onChange={(e) => setLevelForm({...levelForm, description: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" rows={2} placeholder="Mô tả ngắn về level này..." />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input type="checkbox" checked={levelForm.isActive} onChange={(e) => setLevelForm({...levelForm, isActive: e.target.checked})} className="w-4 h-4 rounded" />
                  Level đang hoạt động
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setShowLevelModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium">{editingLevel ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal with Tabs */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">{editingLesson ? 'Sửa Bài học' : 'Thêm Bài học mới'}</h2>
              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                {[
                  { id: 'basic', label: '📋 Thông tin cơ bản', color: 'blue' },
                  { id: 'theory', label: '📖 Lý thuyết', color: 'cyan' },
                  { id: 'practice', label: '🎯 Bài tập', color: 'purple' }
                ].map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? `bg-${tab.color}-500 text-white` : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLessonSubmit} className="flex-1 overflow-y-auto p-6">
              {/* Tab: Basic Info */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Level *</label>
                      <select value={lessonForm.levelId} onChange={(e) => setLessonForm({...lessonForm, levelId: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required disabled={!!editingLesson}>
                        <option value="">Chọn Level</option>
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.icon} Level {level.id}: {level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Số bài học *</label>
                      <input type="number" value={lessonForm.lessonId} onChange={(e) => setLessonForm({...lessonForm, lessonId: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required disabled={!!editingLesson} min={1} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Tiêu đề *</label>
                    <input type="text" value={lessonForm.title} onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" placeholder="VD: Làm quen với bàn tính Soroban" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả *</label>
                    <textarea value={lessonForm.description} onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" rows={2} placeholder="Mô tả ngắn về bài học này..." required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Độ khó</label>
                      <select value={lessonForm.difficulty} onChange={(e) => setLessonForm({...lessonForm, difficulty: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                        {DIFFICULTY_LEVELS.map(d => (
                          <option key={d.value} value={d.value}>{d.icon} {d.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Thời gian (phút)</label>
                      <input type="number" value={lessonForm.duration} onChange={(e) => setLessonForm({...lessonForm, duration: parseInt(e.target.value) || 15})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" min={1} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Sao thưởng</label>
                      <input type="number" value={lessonForm.stars} onChange={(e) => setLessonForm({...lessonForm, stars: parseInt(e.target.value) || 10})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" min={1} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Video URL (tùy chọn)</label>
                    <input type="url" value={lessonForm.videoUrl} onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" placeholder="https://youtube.com/..." />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white">
                      <input type="checkbox" checked={lessonForm.isLocked} onChange={(e) => setLessonForm({...lessonForm, isLocked: e.target.checked})} className="w-4 h-4 rounded" />
                      🔒 Khóa bài học (yêu cầu hoàn thành bài trước)
                    </label>
                  </div>
                </div>
              )}

              {/* Tab: Theory */}
              {activeTab === 'theory' && (
                <TheoryBuilder 
                  key={`theory-${editingLesson?.id || 'new'}`}
                  items={lessonForm.theory} 
                  onChange={(theory) => setLessonForm({...lessonForm, theory})} 
                />
              )}

              {/* Tab: Practice */}
              {activeTab === 'practice' && (
                <PracticeBuilder 
                  key={`practice-${editingLesson?.id || 'new'}`}
                  items={lessonForm.practice} 
                  onChange={(practice) => setLessonForm({...lessonForm, practice})} 
                />
              )}
            </form>

            <div className="p-6 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                📖 {lessonForm.theory.length} lý thuyết | 🎯 {lessonForm.practice.length} bài tập
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowLessonModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Hủy</button>
                <button type="button" onClick={handleLessonSubmit} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium">{editingLesson ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}