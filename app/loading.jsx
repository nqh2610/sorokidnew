export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Animated soroban beads */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-400 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl animate-bounce">🧮</span>
          </div>
        </div>
        <p className="text-purple-600 font-medium animate-pulse">
          Đang tải...
        </p>
      </div>
    </div>
  );
}
