import { FirebaseKit } from 'capacitor-firebase-kit';
import type { FirebaseKitPlugin } from 'capacitor-firebase-kit';
import { trackEvent, trackErrorEvent } from '../tracking/tracker';
import { initializeUnifiedTracking } from './unified-tracking';

export interface FirebaseKitConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  enableAnalytics?: boolean;
  enableCrashlytics?: boolean;
  enableRemoteConfig?: boolean;
  enableAppCheck?: boolean;
  trackingIntegration?: boolean;
}

let firebaseConfig: FirebaseKitConfig = {
  trackingIntegration: true,
};

/**
 * Initialize Firebase Kit integration
 */
export async function initializeFirebaseKit(config: FirebaseKitConfig): Promise<void> {
  firebaseConfig = { ...firebaseConfig, ...config };
  
  try {
    // Initialize Firebase services based on config

    // Enable features based on config
    if (config.enableAnalytics) {
      // Analytics is enabled by default when included
    }

    if (config.enableCrashlytics) {
      await FirebaseKit.crashlytics.setCrashlyticsCollectionEnabled({ enabled: true });
    }

    if (config.enableRemoteConfig) {
      await FirebaseKit.remoteConfig.fetchAndActivate();
    }

    if (config.enableAppCheck) {
      // AppCheck is initialized separately
    }

    // Initialize unified tracking with Firebase if enabled
    if (config.trackingIntegration && config.enableAnalytics) {
      // Firebase Analytics is integrated automatically
      await initializeUnifiedTracking({
        firebase: {
          // Analytics will be available through FirebaseKit
        },
      });
    }

    // Track initialization
    if (firebaseConfig.trackingIntegration) {
      await trackEvent({
        eventName: 'firebase_kit_initialized',
        parameters: {
          analyticsEnabled: config.enableAnalytics,
          crashlyticsEnabled: config.enableCrashlytics,
          remoteConfigEnabled: config.enableRemoteConfig,
          appCheckEnabled: config.enableAppCheck,
        },
      });
    }
  } catch (error) {
    await trackErrorEvent(
      error as Error,
      'firebase_kit',
      { action: 'initialize' }
    );
    throw error;
  }
}

/**
 * Log analytics event
 */
export async function logAnalyticsEvent(event: { name: string; params?: Record<string, any> }): Promise<void> {
  try {
    await FirebaseKit.analytics.logEvent(event);
  } catch (error) {
    console.error('Failed to log analytics event:', error);
    if (firebaseConfig.trackingIntegration) {
      await trackErrorEvent(
        error as Error,
        'firebase_analytics',
        { eventName: event.name }
      );
    }
  }
}

/**
 * Set user ID for analytics
 */
export async function setAnalyticsUserId(userId: string): Promise<void> {
  try {
    await FirebaseKit.analytics.setUserId({ userId });
  } catch (error) {
    console.error('Failed to set analytics user ID:', error);
  }
}

/**
 * Set user property for analytics
 */
export async function setAnalyticsUserProperty(name: string, value: string): Promise<void> {
  try {
    await FirebaseKit.analytics.setUserProperty({ key: name, value });
  } catch (error) {
    console.error('Failed to set analytics user property:', error);
  }
}

/**
 * Log crashlytics error
 */
export async function logCrashlyticsError(error: Error, context?: Record<string, any>): Promise<void> {
  try {
    // Set custom keys if context provided
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        await FirebaseKit.crashlytics.setCustomKeys({
          attributes: { [key]: String(value) },
        });
      }
    }

    // Log the error message
    await FirebaseKit.crashlytics.log({ message: error.message });
  } catch (err) {
    console.error('Failed to log crashlytics error:', err);
  }
}

/**
 * Set crashlytics user ID
 */
export async function setCrashlyticsUserId(userId: string): Promise<void> {
  try {
    await FirebaseKit.crashlytics.setUserId({ userId });
  } catch (error) {
    console.error('Failed to set crashlytics user ID:', error);
  }
}

/**
 * Get remote config value
 */
export async function getRemoteConfigValue(key: string): Promise<any> {
  try {
    const result = await FirebaseKit.remoteConfig.getValue({ key });
    return result;
  } catch (error) {
    console.error('Failed to get remote config value:', error);
    return null;
  }
}

/**
 * Get all remote config values
 */
export async function getAllRemoteConfigValues(): Promise<Record<string, any>> {
  try {
    const result = await FirebaseKit.remoteConfig.getAll();
    return result.values;
  } catch (error) {
    console.error('Failed to get all remote config values:', error);
    return {};
  }
}

/**
 * Fetch and activate remote config
 */
export async function fetchAndActivateRemoteConfig(minimumFetchInterval?: number): Promise<boolean> {
  try {
    const result = await FirebaseKit.remoteConfig.fetchAndActivate();
    
    if (firebaseConfig.trackingIntegration) {
      await trackEvent({
        eventName: 'remote_config_fetched',
        parameters: {
          activated: result.activated,
        },
      });
    }
    
    return result.activated;
  } catch (error) {
    console.error('Failed to fetch and activate remote config:', error);
    return false;
  }
}

/**
 * Get App Check token
 */
export async function getAppCheckToken(forceRefresh = false): Promise<string | null> {
  try {
    const result = await FirebaseKit.appCheck.getToken({ forceRefresh });
    return result.token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    return null;
  }
}

/**
 * Listen to App Check token changes
 */
export async function onAppCheckTokenChange(callback: (token: string) => void): Promise<() => void> {
  const handle = await FirebaseKit.appCheck.addListener('appCheckTokenChanged', (result) => {
    callback(result.token);
  });
  
  return () => {
    handle.remove();
  };
}

// Re-export FirebaseKit
export { FirebaseKit } from 'capacitor-firebase-kit';

let firebaseKit: FirebaseKitPlugin | null = null;

/**
 * Get Firebase Kit instance
 */
export function getFirebaseKit(): FirebaseKitPlugin | null {
  return firebaseKit;
}

/**
 * Check if Firebase Kit is initialized
 */
export function isFirebaseKitInitialized(): boolean {
  return firebaseKit !== null;
}

// Set firebaseKit instance after initialization
firebaseKit = FirebaseKit;