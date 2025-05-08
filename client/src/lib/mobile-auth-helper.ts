/**
 * Mobile Authentication Helper
 * 
 * This module provides utilities for handling authentication in mobile browsers,
 * particularly iOS where cookie/session handling can be problematic.
 * 
 * It implements a token-based fallback mechanism when cookies aren't properly persisted.
 */

// Storage key for mobile auth token
const MOBILE_TOKEN_KEY = 'enterN.mobileToken';

/**
 * Save the mobile auth token to local storage
 */
export function saveMobileToken(token: string): void {
  if (!token) return;
  
  try {
    localStorage.setItem(MOBILE_TOKEN_KEY, token);
    console.log('Mobile auth token saved to local storage');
  } catch (error) {
    console.error('Error saving mobile auth token:', error);
  }
}

/**
 * Get the mobile auth token from local storage
 */
export function getMobileToken(): string | null {
  try {
    return localStorage.getItem(MOBILE_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving mobile auth token:', error);
    return null;
  }
}

/**
 * Clear the mobile auth token from local storage
 */
export function clearMobileToken(): void {
  try {
    localStorage.removeItem(MOBILE_TOKEN_KEY);
    console.log('Mobile auth token cleared from local storage');
  } catch (error) {
    console.error('Error clearing mobile auth token:', error);
  }
}

/**
 * Check if we're running on iOS
 */
export function isIOSDevice(): boolean {
  return typeof window !== 'undefined' ? 
    /iPad|iPhone|iPod/.test(navigator.userAgent) : false;
}

/**
 * Check if we're running on any mobile device
 */
export function isMobileDevice(): boolean {
  return typeof window !== 'undefined' ? 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;
}

/**
 * Add the mobile auth token to API requests if available
 */
export function addMobileAuthToRequest(options: RequestInit = {}): RequestInit {
  const isMobile = isMobileDevice();
  const token = getMobileToken();
  
  if (isMobile && token) {
    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    };
  }
  
  return options;
}