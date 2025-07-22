import { registerPlugin } from '@capacitor/core';

import type { BuildKitUIPlugin } from './definitions';

const BuildKitUI = registerPlugin<BuildKitUIPlugin>('BuildKitUI', {
  web: () => import('./web').then(m => new m.BuildKitUIWeb()),
});

export * from './definitions';
export { BuildKitUI };

// Export React components and hooks
export * from './components';
export * from './hooks';
export * from './providers';
export * from './pages';
export * from './utils';
export { 
  trackEvent,
  trackError,
  trackComponentMount,
  trackComponentUnmount,
  trackComponentRender,
  trackInteraction,
  trackPerformance,
  initializeTracking,
  getTrackingContext,
  addBreadcrumb,
  initializeAnalytics,
  initializeErrorTracking
} from './tracking';
export * from './theme';

// Export integrations
export * as integrations from './integrations';

// Re-export specific integration functions for convenience
export {
  // Unified tracking
  initializeUnifiedTracking,
  trackUnifiedEvent,
  trackUnifiedError,
  isUnifiedTrackingInitialized,
  
  // Unified error handling
  initializeUnifiedErrorHandling,
  captureUnifiedException,
  captureUnifiedError,
  isUnifiedErrorHandlingInitialized,
  
  // Firebase kit
  initializeFirebaseKit,
  getFirebaseKit,
  isFirebaseKitInitialized,
  
  // Auth manager
  initializeAuthManager,
  getAuthManager,
  isAuthManagerInitialized,
  
  // Biometric auth
  initializeBiometricAuth,
  authenticateWithBiometrics,
  isBiometricAuthAvailable,
  
  // Native update
  initializeNativeUpdate,
  checkForNativeUpdate,
  downloadNativeUpdate,
  installNativeUpdate
} from './integrations';