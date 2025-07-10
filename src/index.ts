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