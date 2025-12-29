'use client';

import { useState } from 'react';
import { LogoIcon } from '@/components/Logo/Logo';

/**
 * BrandWatermark - Logo thương hiệu cho toàn bộ Toolbox
 * 
 * TÍNH NĂNG:
 * - Logo góc: Luôn hiển thị ở góc dưới phải (sử dụng logo SoroKid chính thức)
 * - Logo giữa (watermark): Hiển thị mờ ở giữa màn hình
 * - Không ảnh hưởng UX, không chặn tương tác
 * - Hoạt động cả trong fullscreen
 * 
 * CẤU HÌNH:
 * - showCornerLogo: Bật/tắt logo góc (mặc định: true)
 * - showCenterWatermark: Bật/tắt watermark giữa (mặc định: false)
 * - cornerPosition: Vị trí góc ('bottom-right', 'bottom-left', 'top-right', 'top-left')
 * - centerOpacity: Độ mờ watermark giữa (0.03 - 0.08)
 */

export default function BrandWatermark({
  showCornerLogo = true,
  showCenterWatermark = false,
  cornerPosition = 'bottom-right',
  centerOpacity = 0.05,
  isFullscreen = false,
}) {
  // Vị trí góc
  const cornerPositionClasses = {
    'bottom-right': 'bottom-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
  };

  return (
    <>
      {/* LOGO GÓC - Luôn hiển thị - Sử dụng logo SoroKid chính thức */}
      {showCornerLogo && (
        <div 
          className={`fixed ${cornerPositionClasses[cornerPosition]} z-[9998] pointer-events-none select-none`}
          aria-hidden="true"
        >
          <div className={`
            flex items-center gap-1.5 
            px-2 py-1 rounded-lg
            bg-white/80 backdrop-blur-sm shadow-sm
            border border-gray-100/50
            ${isFullscreen ? 'bg-black/30 border-white/20' : ''}
          `}>
            {/* Logo SoroKid chính thức */}
            <LogoIcon size={20} />
            
            {/* Text - Brand gradient */}
            <span className="text-xs font-bold tracking-tight bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              SoroKid
            </span>
          </div>
        </div>
      )}

      {/* WATERMARK GIỮA - Chỉ hiển thị khi bật */}
      {showCenterWatermark && (
        <div 
          className="fixed inset-0 z-[9997] pointer-events-none select-none flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <div 
            className="flex flex-col items-center gap-2"
            style={{ opacity: centerOpacity }}
          >
            {/* Logo SoroKid chính thức - Kích thước lớn */}
            <LogoIcon size={120} />
            
            {/* Text thương hiệu - Brand gradient */}
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              SoroKid
            </span>
            
            <span className={`
              text-lg sm:text-xl font-medium
              ${isFullscreen ? 'text-white/80' : 'text-gray-600'}
            `}>
              Toolbox Giáo Viên
            </span>
          </div>
        </div>
      )}

      {/* CSS để đảm bảo không ảnh hưởng layout */}
      <style jsx>{`
        /* Đảm bảo watermark không chặn bất kỳ tương tác nào */
        [aria-hidden="true"] {
          pointer-events: none !important;
          user-select: none !important;
        }
      `}</style>
    </>
  );
}

/**
 * Hook để sử dụng trong các tool riêng lẻ nếu cần custom
 */
export function useBrandWatermark() {
  const [config, setConfig] = useState({
    showCornerLogo: true,
    showCenterWatermark: false,
    cornerPosition: 'bottom-right',
    centerOpacity: 0.05,
  });

  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return { config, updateConfig };
}
