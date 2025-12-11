'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlayCircle, Lock, CheckCircle, Star, Clock, ChevronRight, BookOpen } from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';
import StarBadge from '@/components/Rewards/StarBadge';

// Thông tin các Level - 18 levels đầy đủ
const LEVELS = [
  { id: 1, name: 'Làm quen', icon: '🌱', color: 'from-green-400 to-emerald-500', description: 'Khám phá bàn tính!' },
  { id: 2, name: 'Cộng dễ', icon: '➕', color: 'from-blue-400 to-blue-500', description: 'Cộng số cơ bản!' },
  { id: 3, name: 'Bạn nhỏ +', icon: '🖐️', color: 'from-cyan-400 to-cyan-500', description: 'Cộng dùng Bạn nhỏ!' },
  { id: 4, name: 'Bạn nhỏ -', icon: '✋', color: 'from-teal-400 to-teal-500', description: 'Trừ dùng Bạn nhỏ!' },
  { id: 5, name: 'Bạn lớn +', icon: '🔟', color: 'from-purple-400 to-purple-500', description: 'Cộng dùng Bạn lớn!' },
  { id: 6, name: 'Bạn lớn -', icon: '🎯', color: 'from-pink-400 to-pink-500', description: 'Trừ dùng Bạn lớn!' },
  { id: 7, name: 'Kết hợp', icon: '🎨', color: 'from-rose-400 to-rose-500', description: 'Bạn nhỏ + Bạn lớn!' },
  { id: 8, name: '2 chữ số', icon: '🔢', color: 'from-orange-400 to-orange-500', description: 'Cộng trừ 2 chữ số!' },
  { id: 9, name: '3 chữ số', icon: '💯', color: 'from-amber-400 to-amber-500', description: 'Cộng trừ 3 chữ số!' },
  { id: 10, name: '4 chữ số', icon: '🏅', color: 'from-yellow-400 to-yellow-500', description: 'Cộng trừ 4 chữ số!' },
  { id: 11, name: 'Nhân cơ bản', icon: '✖️', color: 'from-red-400 to-red-500', description: 'Nhân 1 chữ số!' },
  { id: 12, name: 'Nhân nâng cao', icon: '🔥', color: 'from-red-500 to-rose-600', description: 'Nhân 2 chữ số!' },
  { id: 13, name: 'Chia cơ bản', icon: '➗', color: 'from-indigo-400 to-indigo-500', description: 'Chia đơn giản!' },
  { id: 14, name: 'Chia nâng cao', icon: '🌟', color: 'from-indigo-500 to-blue-600', description: 'Chia số lớn!' },
  { id: 15, name: 'Tính nhẩm 1', icon: '🧠', color: 'from-violet-400 to-violet-500', description: 'Tính nhẩm cơ bản!' },
  { id: 16, name: 'Tính nhẩm 2', icon: '🚀', color: 'from-violet-500 to-purple-600', description: 'Tính nhẩm nâng cao!' },
  { id: 17, name: 'Tốc độ', icon: '⚡', color: 'from-fuchsia-400 to-fuchsia-500', description: 'Luyện tốc độ!' },
  { id: 18, name: 'Thi đấu', icon: '🏆', color: 'from-amber-500 to-orange-500', description: 'Thi cấp 10-8!' },
];

export default function LearnPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch lessons khi chọn level
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLessons(selectedLevel);
    }
  }, [selectedLevel, status]);

  const fetchLessons = async (levelId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons?levelId=${levelId}`);
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-5xl animate-spin">🧮</div>
      </div>
    );
  }

  const currentLevelInfo = LEVELS.find(l => l.id === selectedLevel);
  const completedLessons = lessons.filter(l => l.completed).length;
  const maxStars = lessons.reduce((sum, l) => sum + l.stars, 0);
  // Giới hạn totalStars không vượt quá maxStars (tránh hiện 23/22)
  const rawTotalStars = lessons.reduce((sum, l) => sum + (l.starsEarned || 0), 0);
  const totalStars = Math.min(rawTotalStars, maxStars);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      {/* Unified TopBar */}
      <TopBar showStats={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🎮 Hành trình chinh phục Soroban</h1>
          <p className="text-gray-600">18 màn chơi • 42 nhiệm vụ • Từ người mới đến siêu sao!</p>
        </div>

        {/* Level Selector - Horizontal Scroll */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedLevel === level.id
                    ? `bg-gradient-to-r ${level.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                <span className="text-xl">{level.icon}</span>
                <span className="text-sm">{level.id}. {level.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Level Info */}
        <div className={`bg-gradient-to-r ${currentLevelInfo?.color} rounded-2xl p-6 shadow-xl mb-6 text-white`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{currentLevelInfo?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">🏰 Màn {selectedLevel}: {currentLevelInfo?.name}</h2>
                  <p className="text-white/80">{currentLevelInfo?.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{completedLessons}/{lessons.length}</div>
                <div className="text-xs text-white/80">Nhiệm vụ</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <Star size={20} fill="white" />
                  {totalStars}/{maxStars}
                </div>
                <div className="text-xs text-white/80">Sao</div>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 bg-white/30 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500 relative overflow-hidden"
              style={{ width: `${lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-white/80 mt-2 text-center">
            {completedLessons === lessons.length && lessons.length > 0 
              ? '🎉 Đã hoàn thành màn này! Tuyệt vời!'
              : `💪 Còn ${lessons.length - completedLessons} nhiệm vụ nữa thôi!`}
          </p>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} />
              📋 Danh sách nhiệm vụ
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-4xl animate-spin inline-block">🧮</div>
              <p className="text-gray-500 mt-2">Đang tải nhiệm vụ...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🚧</div>
              Nhiệm vụ đang được chuẩn bị...
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson, index) => {
                const isLocked = index > 0 && !lessons[index - 1]?.completed && !lesson.completed;
                const isCompleted = lesson.completed;
                
                return (
                  <div
                    key={lesson.id}
                    className={`p-4 flex items-center gap-4 transition-all ${
                      isLocked 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50 cursor-pointer hover:scale-[1.01]'
                    }`}
                    onClick={() => !isLocked && router.push(`/learn/${lesson.levelId}/${lesson.lessonId}`)}
                  >
                    {/* Lesson Number */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isLocked 
                          ? 'bg-gray-100 text-gray-400'
                          : `bg-gradient-to-r ${currentLevelInfo?.color} text-white`
                    }`}>
                      {isCompleted ? <CheckCircle size={24} /> : isLocked ? <Lock size={20} /> : lesson.lessonId}
                    </div>
                    
                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                        {isLocked ? '🔒 ' : '🎯 '}{lesson.title}
                      </h4>
                      <p className={`text-sm truncate ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
                          {lesson.duration} phút
                        </span>
                        {isCompleted ? (
                          <StarBadge 
                            stars={lesson.starsEarned || 0} 
                            size="xs" 
                            variant="earned"
                          />
                        ) : (
                          <span className="text-gray-400">☆ {lesson.stars || 3} sao</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                          <CheckCircle size={16} />
                          ✨ Xong
                        </div>
                      ) : isLocked ? (
                        <Lock size={20} className="text-gray-300" />
                      ) : (
                        <button className={`px-4 py-2 bg-gradient-to-r ${currentLevelInfo?.color} text-white rounded-lg font-bold text-sm flex items-center gap-1 hover:shadow-lg hover:scale-105 transition-all`}>
                          <PlayCircle size={16} />
                          Chơi!
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
