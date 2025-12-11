'use client';

import Link from 'next/link';
import { 
  BookOpen, Trophy, Target, Gamepad2, Users, BarChart3, 
  Zap, Clock, Award, TrendingUp, GraduationCap, Heart, Sparkles
} from 'lucide-react';
import CompactSoroban from '@/components/FloatingSoroban/CompactSoroban';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import Logo from '@/components/Logo/Logo';

export default function HomePage() {
  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Game hóa học tập",
      description: "Chơi mà học, học mà chơi! Hệ thống điểm thưởng, sao, kim cương khiến việc học thú vị như chơi game.",
      color: "from-blue-500 to-violet-500",
      emoji: "🎮"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Bài học khoa học",
      description: "Lộ trình từ cơ bản đến nâng cao, giúp học sinh từ chưa biết gì đến thành thạo tính nhẩm Soroban.",
      color: "from-violet-500 to-purple-500",
      emoji: "📚"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Luyện tập thông minh",
      description: "Bài tập đa dạng giúp tăng phản xạ và kỹ năng tính toán. Càng luyện càng nhanh, càng chính xác!",
      color: "from-amber-500 to-orange-500",
      emoji: "⚡"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Thi đấu xếp hạng",
      description: "Ganh đua lành mạnh với bạn bè qua bảng xếp hạng. Tăng động lực học tập và tinh thần cạnh tranh.",
      color: "from-yellow-500 to-amber-500",
      emoji: "🏆"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Nhiệm vụ hằng ngày",
      description: "Hoàn thành nhiệm vụ để nhận thưởng! Hệ thống quest giúp học sinh duy trì thói quen học tập đều đặn.",
      color: "from-pink-500 to-rose-500",
      emoji: "🎯"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Theo dõi tiến độ",
      description: "Phụ huynh nắm rõ con học đến đâu, đạt được gì. Đo lường độ chăm chỉ, tốc độ và độ chính xác.",
      color: "from-cyan-500 to-blue-500",
      emoji: "📊"
    }
  ];

  const userTypes = [
    {
      title: "Học sinh",
      description: "Học Soroban qua game thú vị, nhận thưởng khi hoàn thành bài học, thi đấu với bạn bè.",
      color: "bg-gradient-to-br from-blue-500 to-violet-500",
      emoji: "👦"
    },
    {
      title: "Phụ huynh", 
      description: "Công cụ kèm con tự học tại nhà. Theo dõi tiến độ, biết con đạt được những gì mỗi ngày.",
      color: "bg-gradient-to-br from-violet-500 to-purple-500",
      emoji: "👨‍👩‍👧"
    },
    {
      title: "Giáo viên",
      description: "Công cụ dạy học hiện đại, cá nhân hóa cho từng học sinh. Quản lý lớp học dễ dàng.",
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
      emoji: "👩‍🏫"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex gap-2 sm:gap-3">
            <Link href="/login" className="px-4 sm:px-6 py-2 text-sm sm:text-base text-violet-600 font-bold hover:bg-violet-50 rounded-full transition-all">
              Đăng nhập
            </Link>
            <Link href="/register" className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transition-all shadow-lg">
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-violet-400/10 to-pink-400/10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Phương pháp Soroban từ Nhật Bản 🇯🇵</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500">
                Học Soroban
              </span>
              <br />
              <span className="text-gray-800">Vui như chơi Game!</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-4">
              Ứng dụng học tính nhẩm Soroban dành cho học sinh tiểu học. 
              <strong className="text-violet-600"> Chơi mà học, học mà chơi!</strong>
            </p>

            <div className="flex justify-center mb-8 px-4">
              <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-full text-lg font-bold shadow-xl hover:shadow-violet-500/30 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Đăng ký ngay
              </Link>
            </div>

            {/* Benefits badges */}
            <div className="flex flex-wrap justify-center gap-3 px-4">
              {[
                { icon: "🧠", text: "Phát triển tư duy" },
                { icon: "⚡", text: "Tính nhẩm siêu nhanh" },
                { icon: "🎯", text: "Tăng tập trung" },
                { icon: "😊", text: "Học mà vui" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                  <span>{benefit.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soroban Demo */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                🧮 Trải nghiệm bàn tính Soroban
              </h2>
              <p className="text-gray-600">Click vào các hạt để di chuyển lên/xuống</p>
            </div>
            
            {/* Mobile */}
            <div className="md:hidden px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
                <CompactSoroban />
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden md:block px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50">
                <SorobanBoard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
              ✨ Tính năng nổi bật
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Sorokid được thiết kế đặc biệt cho học sinh tiểu học với giao diện đơn giản, bắt mắt
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-violet-200 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{feature.emoji}</span>
                  <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-violet-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
              📈 Lộ trình học tập khoa học
            </h2>
            <p className="text-gray-600 text-lg">Từ người mới bắt đầu đến thành thạo tính nhẩm</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Học lý thuyết", desc: "Làm quen với bàn tính Soroban qua bài học sinh động", icon: "📖", color: "bg-blue-500" },
              { step: "2", title: "Thực hành", desc: "Luyện tập với bài tập từ dễ đến khó", icon: "✍️", color: "bg-violet-500" },
              { step: "3", title: "Luyện tập", desc: "Tăng tốc độ và độ chính xác qua các bài luyện", icon: "🏃", color: "bg-pink-500" },
              { step: "4", title: "Thi đấu", desc: "Thử thách bản thân, xếp hạng cùng bạn bè", icon: "🏆", color: "bg-amber-500" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center h-full">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Measurement System */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-6">
                📊 Theo dõi tiến độ học tập
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Hệ thống tự động đánh giá và đo lường sự tiến bộ của học sinh qua từng bài học.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Clock className="w-6 h-6" />, label: "Tốc độ tính toán", desc: "Đo thời gian hoàn thành mỗi bài", color: "text-blue-500" },
                  { icon: <Target className="w-6 h-6" />, label: "Độ chính xác", desc: "Tỷ lệ trả lời đúng", color: "text-violet-500" },
                  { icon: <TrendingUp className="w-6 h-6" />, label: "Tính chăm chỉ", desc: "Số ngày học liên tiếp (streak)", color: "text-pink-500" },
                  { icon: <Award className="w-6 h-6" />, label: "Thành tích", desc: "Huy hiệu, level, điểm kinh nghiệm", color: "text-amber-500" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                    <div className={`${item.color} bg-white rounded-lg p-2 shadow-sm`}>{item.icon}</div>
                    <div>
                      <div className="font-bold text-gray-800">{item.label}</div>
                      <div className="text-gray-600 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">🎁 Hệ thống phần thưởng</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "⭐", label: "Sao", desc: "Nhận khi hoàn thành bài học" },
                  { icon: "💎", label: "Kim cương", desc: "Phần thưởng đặc biệt" },
                  { icon: "🏅", label: "Huy hiệu", desc: "Đạt thành tích nổi bật" },
                  { icon: "🎖️", label: "Cấp bậc", desc: "Thăng cấp khi tích điểm" }
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs text-white/80">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
              👥 Dành cho ai?
            </h2>
            <p className="text-gray-600 text-lg">Sorokid phù hợp với nhiều đối tượng người dùng</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {userTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className={`${type.color} p-6 text-white text-center`}>
                  <div className="text-5xl mb-2">{type.emoji}</div>
                  <h3 className="text-xl font-bold">{type.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
              💡 Điểm nổi bật
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎨", title: "Giao diện đẹp", desc: "Thiết kế bắt mắt, phù hợp lứa tuổi tiểu học" },
              { icon: "📱", title: "Đa nền tảng", desc: "Học mọi lúc mọi nơi trên điện thoại, máy tính" },
              { icon: "🧮", title: "Bàn tính ảo", desc: "Không cần mua bàn tính thật, tiện lợi" },
              { icon: "🏠", title: "Tự học tại nhà", desc: "Phụ huynh có thể kèm con học" }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-violet-50 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6">
            🚀 Bắt đầu hành trình Soroban ngay hôm nay!
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Đăng ký và khám phá thế giới tính nhẩm thú vị cùng Sorokid
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-white text-violet-600 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
              Đăng ký ngay
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white/20 backdrop-blur text-white rounded-full text-lg font-bold hover:bg-white/30 transition-all border-2 border-white/50">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">Học Soroban vui như chơi Game</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <Link href="/learn" className="hover:text-white transition-colors">Bài học</Link>
              <Link href="/practice" className="hover:text-white transition-colors">Luyện tập</Link>
              <Link href="/compete" className="hover:text-white transition-colors">Thi đấu</Link>
              <Link href="/leaderboard" className="hover:text-white transition-colors">Xếp hạng</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 Sorokid. Phát triển với ❤️ cho học sinh Việt Nam.
          </div>
        </div>
      </footer>
    </div>
  );
}
