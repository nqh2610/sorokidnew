'use client';

/**
 * Capacitor Authentication Helper
 * Xử lý OAuth flow trong Capacitor app
 */

// Check if running in Capacitor app
export function isCapacitorApp() {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor native bridge
  if (window.Capacitor?.isNativePlatform?.()) return true;
  
  // Check user agent for app identifier
  if (navigator.userAgent?.includes('SorokidApp')) return true;
  
  // Check for Capacitor object
  if (window.Capacitor?.getPlatform?.() === 'android' || 
      window.Capacitor?.getPlatform?.() === 'ios') return true;
  
  return false;
}

// Get the base URL for OAuth
export function getOAuthBaseUrl() {
  // Always use production URL for OAuth
  return 'https://sorokid.com';
}

// Open external browser for OAuth
export async function openGoogleOAuth(callbackPath = '/dashboard') {
  try {
    // Dynamic import to avoid SSR issues
    const { Browser } = await import('@capacitor/browser');
    const { App } = await import('@capacitor/app');
    
    const baseUrl = getOAuthBaseUrl();
    const oauthUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + callbackPath)}`;
    
    console.log('[CapacitorAuth] Opening OAuth URL:', oauthUrl);
    
    // Listen for app URL open (when user returns from OAuth)
    const urlListener = App.addListener('appUrlOpen', async ({ url }) => {
      console.log('[CapacitorAuth] App URL opened:', url);
      
      // Close the browser
      try {
        await Browser.close();
      } catch (e) {
        console.log('[CapacitorAuth] Browser already closed');
      }
      
      // Check if this is OAuth callback
      if (url.includes('/dashboard') || url.includes('/api/auth/callback')) {
        // Reload to apply session
        window.location.href = callbackPath;
      }
      
      // Remove listener after handling
      urlListener.remove();
    });
    
    // Open external browser
    await Browser.open({ 
      url: oauthUrl,
      presentationStyle: 'fullscreen',
      toolbarColor: '#1a1a2e'
    });
    
    return true;
  } catch (error) {
    console.error('[CapacitorAuth] Error opening OAuth:', error);
    
    // Fallback: open in new tab
    window.open(getOAuthBaseUrl() + '/api/auth/signin/google', '_system');
    return false;
  }
}

// Initialize Capacitor deep link handler
export async function initCapacitorDeepLinks(onAuthCallback) {
  if (!isCapacitorApp()) return;
  
  try {
    const { App } = await import('@capacitor/app');
    
    // Handle deep links when app is opened via URL
    App.addListener('appUrlOpen', async ({ url }) => {
      console.log('[CapacitorAuth] Deep link received:', url);
      
      // Parse the URL
      const urlObj = new URL(url);
      
      // Check for auth callback
      if (urlObj.pathname.includes('/api/auth/callback') || 
          urlObj.searchParams.has('code') ||
          urlObj.pathname === '/dashboard') {
        
        if (onAuthCallback) {
          onAuthCallback(url);
        } else {
          // Default: reload page to apply session
          window.location.reload();
        }
      }
    });
    
    console.log('[CapacitorAuth] Deep link handler initialized');
  } catch (error) {
    console.error('[CapacitorAuth] Error initializing deep links:', error);
  }
}

// Check and sync session after returning from OAuth
export async function syncSessionAfterOAuth() {
  if (!isCapacitorApp()) return null;
  
  try {
    // Fetch current session from server
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const session = await response.json();
      console.log('[CapacitorAuth] Session synced:', session?.user?.email);
      return session;
    }
  } catch (error) {
    console.error('[CapacitorAuth] Error syncing session:', error);
  }
  
  return null;
}
