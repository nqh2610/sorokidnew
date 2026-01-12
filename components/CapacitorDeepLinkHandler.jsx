'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CapacitorDeepLinkHandler
 * Component này xử lý deep links khi user quay lại app từ OAuth
 * Chỉ hoạt động trong Capacitor app, không ảnh hưởng web
 */
export default function CapacitorDeepLinkHandler() {
  const router = useRouter();
  const [isCapacitor, setIsCapacitor] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor - chỉ check một lần khi mount
    if (typeof window === 'undefined') return;
    
    const capacitorDetected = !!(
      window.Capacitor?.isNativePlatform?.() || 
      window.Capacitor?.isNative
    );
    
    setIsCapacitor(capacitorDetected);
    
    // Nếu không phải Capacitor app, không làm gì cả
    if (!capacitorDetected) {
      return;
    }

    let appListener = null;

    const initDeepLinkHandler = async () => {
      try {
        // Dynamic import để tránh lỗi SSR và chỉ load khi cần
        const { App } = await import('@capacitor/app');
        
        // Lắng nghe khi app được mở qua URL (deep link)
        appListener = await App.addListener('appUrlOpen', async ({ url }) => {
          console.log('[DeepLink] App opened with URL:', url);
          
          try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            
            // Xử lý OAuth callback
            if (path.includes('/api/auth/callback') || 
                path.includes('/dashboard') ||
                urlObj.searchParams.has('code')) {
              
              console.log('[DeepLink] OAuth callback detected, refreshing session...');
              
              // Đợi một chút để session được cập nhật
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Refresh page để lấy session mới
              window.location.href = '/dashboard';
              return;
            }
            
            // Xử lý các deep link khác
            if (path && path !== '/') {
              router.push(path);
            }
          } catch (error) {
            console.error('[DeepLink] Error parsing URL:', error);
          }
        });
        
        // Kiểm tra nếu app được mở từ URL khi khởi động
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          console.log('[DeepLink] App launched with URL:', launchUrl.url);
        }
        
        console.log('[DeepLink] Handler initialized');
      } catch (error) {
        // Không log error trên web vì đây là expected behavior
        if (capacitorDetected) {
          console.error('[DeepLink] Error:', error.message);
        }
      }
    };

    initDeepLinkHandler();

    // Cleanup
    return () => {
      if (appListener?.remove) {
        appListener.remove();
      }
    };
  }, [router]);

  // Component này không render gì
  return null;
}

  // Component này không render gì
  return null;
}
