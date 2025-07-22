import { UnifiedTracking } from 'unified-tracking';
import type { TrackingEvent, ErrorEvent } from '../definitions';
import { getTrackingContext } from '../tracking/context';

// Unified tracking instance
let unifiedTracker: UnifiedTracking | null = null;

export interface UnifiedTrackingConfig {
  firebase?: {
    app?: any;
    analytics?: any;
  };
  amplitude?: {
    apiKey: string;
    options?: any;
  };
  clarity?: {
    projectId: string;
  };
  providers?: string[];
  debug?: boolean;
}

/**
 * Initialize unified tracking
 */
export async function initializeUnifiedTracking(config: UnifiedTrackingConfig): Promise<void> {
  try {
    const providers: any[] = [];

    // Add configured providers
    if (config.firebase?.analytics) {
      providers.push({
        name: 'firebase',
        provider: config.firebase.analytics,
      });
    }

    if (config.amplitude?.apiKey) {
      providers.push({
        name: 'amplitude',
        provider: {
          apiKey: config.amplitude.apiKey,
          ...config.amplitude.options,
        },
      });
    }

    if (config.clarity?.projectId) {
      providers.push({
        name: 'clarity',
        provider: {
          projectId: config.clarity.projectId,
        },
      });
    }

    // Initialize unified tracking
    unifiedTracker = new UnifiedTracking({
      providers: config.providers || ['firebase', 'amplitude', 'clarity'],
      firebase: config.firebase,
      amplitude: config.amplitude,
      clarity: config.clarity,
      debug: config.debug || false,
    });

    await unifiedTracker.initialize();

    // Set user properties from context
    const context = getTrackingContext();
    if (context.userId) {
      await setUserId(context.userId);
    }
    if (context.userProperties) {
      await setUserProperties(context.userProperties);
    }
  } catch (error) {
    console.error('Failed to initialize unified tracking:', error);
    throw error;
  }
}

/**
 * Track event using unified tracking
 */
export async function trackUnifiedEvent(event: TrackingEvent): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  const context = getTrackingContext();
  
  await unifiedTracker.trackEvent(event.eventName, {
    ...event.parameters,
    componentType: event.componentType,
    sessionId: context.sessionId,
    platform: context.platform,
    appVersion: context.appVersion,
    timestamp: event.timestamp || Date.now(),
  });
}

/**
 * Track error using unified tracking
 */
export async function trackUnifiedError(error: ErrorEvent): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  const context = getTrackingContext();

  await unifiedTracker.trackError(new Error(error.message), {
    componentType: error.componentType,
    stack: error.stack,
    severity: error.severity,
    context: {
      ...error.context,
      sessionId: context.sessionId,
      platform: context.platform,
      appVersion: context.appVersion,
    },
  });
}

/**
 * Set user ID in unified tracking
 */
export async function setUserId(userId: string): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.setUserId(userId);
}

/**
 * Set user properties in unified tracking
 */
export async function setUserProperties(properties: Record<string, any>): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.setUserProperties(properties);
}

/**
 * Track page view using unified tracking
 */
export async function trackPageView(pageName: string, properties?: Record<string, any>): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.trackPageView(pageName, properties);
}

/**
 * Track screen view using unified tracking (for mobile)
 */
export async function trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.trackScreenView(screenName, properties);
}

/**
 * Start session tracking
 */
export async function startSession(sessionId?: string): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.startSession(sessionId);
}

/**
 * End session tracking
 */
export async function endSession(): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.endSession();
}

/**
 * Track timing
 */
export async function trackTiming(category: string, variable: string, value: number, label?: string): Promise<void> {
  if (!unifiedTracker) {
    throw new Error('Unified tracking not initialized');
  }

  await unifiedTracker.trackTiming(category, variable, value, label);
}

/**
 * Check if unified tracking is initialized
 */
export function isUnifiedTrackingInitialized(): boolean {
  return unifiedTracker !== null;
}

/**
 * Get unified tracking instance
 */
export function getUnifiedTracker(): UnifiedTracking | null {
  return unifiedTracker;
}