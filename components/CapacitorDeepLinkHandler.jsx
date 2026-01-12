'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * CapacitorDeepLinkHandler
 * Component này xử lý deep links khi user quay lại app từ OAuth
 */
export default function CapacitorDeepLinkHandler() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Chỉ chạy trong Capacitor app
    if (typeof window === 'undefined') return;
    
    const isCapacitor = !!(
      window.Capacitor?.isNativePlatform?.() || 
      window.Capacitor?.isNative ||
      navigator.userAgent?.includes('SorokidApp')
    );
    
    if (!isCapacitor) return;

    let appListener = null;

    const initDeepLinkHandler = async () => {
      try {
        // Dynamic import để tránh lỗi SSR
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
          
          try {
            const urlObj = new URL(launchUrl.url);
            const path = urlObj.pathname;
            
            if (path.includes('/dashboard') || urlObj.searchParams.has('code')) {
              // Redirect về dashboard nếu có session
              if (status === 'authenticated') {
                router.push('/dashboard');
              }
            }
          } catch (error) {
            console.error('[DeepLink] Error parsing launch URL:', error);
          }
        }
        
        console.log('[DeepLink] Handler initialized');
      } catch (error) {
        console.log('[DeepLink] Not in Capacitor environment:', error.message);
      }
    };

    initDeepLinkHandler();

    // Cleanup
    return () => {
      if (appListener?.remove) {
        appListener.remove();
      }
    };
  }, [router, status]);

  // Component này không render gì
  return null;
}
