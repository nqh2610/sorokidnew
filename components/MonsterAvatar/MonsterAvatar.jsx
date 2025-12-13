'use client';

/**
 * MonsterAvatar - Avatar quái vật dễ thương sử dụng Robohash API
 * Cố định cho mỗi user dựa trên userId hoặc email
 * Set 2 = Monsters (quái vật cute), Set 3 = Robots, Set 4 = Cats
 */
export default function MonsterAvatar({ 
  seed, // userId hoặc email để tạo avatar cố định
  size = 40, 
  className = '',
  showBorder = true,
  avatarSet = 2 // 2 = monsters, 3 = robots, 4 = cats
}) {
  // Tạo URL avatar từ Robohash API với monster set
  // bgset=bg1 thêm background gradient đẹp
  const avatarUrl = `https://robohash.org/${encodeURIComponent(seed || 'default-monster')}.png?set=set${avatarSet}&bgset=bg1&size=${size * 2}x${size * 2}`;
  
  const borderClass = showBorder ? 'border-2 border-violet-200 shadow-sm' : '';
  
  return (
    <div 
      className={`rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 ${borderClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={avatarUrl} 
        alt="Avatar"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

// Export helper function để sử dụng bên ngoài nếu cần
export const generateAvatarSeed = (userId, email) => {
  return userId || email || 'default-monster';
};
