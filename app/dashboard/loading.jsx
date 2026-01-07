export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🧮</div>
        <p className="text-gray-600 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}
