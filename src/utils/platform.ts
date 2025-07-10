import { Capacitor } from '@capacitor/core';

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Check if running on Web
 */
export function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web';
}

/**
 * Check if running on mobile (iOS or Android)
 */
export function isMobile(): boolean {
  return isIOS() || isAndroid();
}

/**
 * Check if running as a native app
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Check if device has touch support
 */
export function hasTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}