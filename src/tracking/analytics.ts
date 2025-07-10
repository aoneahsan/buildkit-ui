import type { TrackingEvent } from '../definitions';
import type { Analytics } from './types';

let analyticsProviders: Analytics = {};
let isInitialized = false;

/**
 * Initialize analytics providers
 */
export async function initializeAnalytics(providers: Analytics): Promise<void> {
  analyticsProviders = providers;
  isInitialized = true;

  // Initialize Firebase Analytics
  if (providers.firebase) {
    await initializeFirebaseAnalytics();
  }

  // Initialize Amplitude
  if (providers.amplitude) {
    await initializeAmplitude();
  }

  // Initialize Microsoft Clarity
  if (providers.clarity) {
    await initializeClarity();
  }
}

/**
 * Send event to all analytics providers
 */
export async function sendAnalyticsEvent(event: TrackingEvent): Promise<void> {
  if (!isInitialized) {
    console.warn('Analytics not initialized');
    return;
  }

  const promises: Promise<void>[] = [];

  // Send to Firebase
  if (analyticsProviders.firebase) {
    promises.push(sendToFirebase(event));
  }

  // Send to Amplitude
  if (analyticsProviders.amplitude) {
    promises.push(sendToAmplitude(event));
  }

  // Send to Clarity
  if (analyticsProviders.clarity) {
    promises.push(sendToClarity(event));
  }

  // Send to custom analytics
  if (analyticsProviders.custom) {
    promises.push(sendToCustom(event));
  }

  await Promise.allSettled(promises);
}

/**
 * Set user properties across all providers
 */
export async function setAnalyticsUserProperties(properties: Record<string, any>): Promise<void> {
  if (!isInitialized) return;

  const promises: Promise<void>[] = [];

  // Set Firebase user properties
  if (analyticsProviders.firebase) {
    promises.push(setFirebaseUserProperties(properties));
  }

  // Set Amplitude user properties
  if (analyticsProviders.amplitude) {
    promises.push(setAmplitudeUserProperties(properties));
  }

  await Promise.allSettled(promises);
}

/**
 * Set user ID across all providers
 */
export async function setAnalyticsUserId(userId: string | null): Promise<void> {
  if (!isInitialized) return;

  const promises: Promise<void>[] = [];

  // Set Firebase user ID
  if (analyticsProviders.firebase) {
    promises.push(setFirebaseUserId(userId));
  }

  // Set Amplitude user ID
  if (analyticsProviders.amplitude) {
    promises.push(setAmplitudeUserId(userId));
  }

  await Promise.allSettled(promises);
}

// Firebase Analytics implementation
async function initializeFirebaseAnalytics(): Promise<void> {
  try {
    const { FirebaseKit } = await import('@vettabase/capacitor-firebase-kit');
    // Firebase should be initialized in the main plugin
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
}

async function sendToFirebase(event: TrackingEvent): Promise<void> {
  try {
    const { FirebaseKit } = await import('@vettabase/capacitor-firebase-kit');
    await FirebaseKit.logEvent({
      name: event.eventName,
      params: {
        ...event.parameters,
        component_type: event.componentType,
      },
    });
  } catch (error) {
    console.error('Firebase Analytics error:', error);
  }
}

async function setFirebaseUserProperties(properties: Record<string, any>): Promise<void> {
  try {
    const { FirebaseKit } = await import('@vettabase/capacitor-firebase-kit');
    await FirebaseKit.setUserProperties({ properties });
  } catch (error) {
    console.error('Firebase user properties error:', error);
  }
}

async function setFirebaseUserId(userId: string | null): Promise<void> {
  try {
    const { FirebaseKit } = await import('@vettabase/capacitor-firebase-kit');
    await FirebaseKit.setUserId({ userId: userId || '' });
  } catch (error) {
    console.error('Firebase user ID error:', error);
  }
}

// Amplitude implementation
async function initializeAmplitude(): Promise<void> {
  try {
    const amplitude = await import('@amplitude/analytics-browser');
    // Amplitude should be initialized with API key from config
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
}

async function sendToAmplitude(event: TrackingEvent): Promise<void> {
  try {
    const amplitude = await import('@amplitude/analytics-browser');
    amplitude.track(event.eventName, {
      ...event.parameters,
      component_type: event.componentType,
    });
  } catch (error) {
    console.error('Amplitude error:', error);
  }
}

async function setAmplitudeUserProperties(properties: Record<string, any>): Promise<void> {
  try {
    const amplitude = await import('@amplitude/analytics-browser');
    const identify = new amplitude.Identify();
    
    Object.entries(properties).forEach(([key, value]) => {
      identify.set(key, value);
    });
    
    amplitude.identify(identify);
  } catch (error) {
    console.error('Amplitude user properties error:', error);
  }
}

async function setAmplitudeUserId(userId: string | null): Promise<void> {
  try {
    const amplitude = await import('@amplitude/analytics-browser');
    amplitude.setUserId(userId);
  } catch (error) {
    console.error('Amplitude user ID error:', error);
  }
}

// Microsoft Clarity implementation
async function initializeClarity(): Promise<void> {
  try {
    const { clarity } = await import('@microsoft/clarity');
    // Clarity should be initialized with project ID from config
  } catch (error) {
    console.error('Failed to initialize Clarity:', error);
  }
}

async function sendToClarity(event: TrackingEvent): Promise<void> {
  try {
    const { clarity } = await import('@microsoft/clarity');
    clarity.event(event.eventName, {
      ...event.parameters,
      component_type: event.componentType,
    });
  } catch (error) {
    console.error('Clarity error:', error);
  }
}

// Custom analytics implementation
async function sendToCustom(event: TrackingEvent): Promise<void> {
  const customConfig = analyticsProviders.custom;
  if (!customConfig) return;

  try {
    const eventData = customConfig.transformEvent
      ? customConfig.transformEvent(event)
      : event;

    await fetch(customConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customConfig.headers,
      },
      body: JSON.stringify(eventData),
    });
  } catch (error) {
    console.error('Custom analytics error:', error);
  }
}

/**
 * Log screen view
 */
export async function logScreenView(screenName: string, screenClass?: string): Promise<void> {
  await sendAnalyticsEvent({
    eventName: 'screen_view',
    parameters: {
      screen_name: screenName,
      screen_class: screenClass,
    },
  });
}

/**
 * Log custom event
 */
export async function logCustomEvent(
  eventName: string,
  parameters?: Record<string, any>
): Promise<void> {
  await sendAnalyticsEvent({
    eventName,
    parameters,
  });
}

/**
 * Begin checkout
 */
export async function logBeginCheckout(
  value: number,
  currency: string,
  items?: any[]
): Promise<void> {
  await sendAnalyticsEvent({
    eventName: 'begin_checkout',
    parameters: {
      value,
      currency,
      items,
    },
  });
}

/**
 * Log purchase
 */
export async function logPurchase(
  value: number,
  currency: string,
  transactionId: string,
  items?: any[]
): Promise<void> {
  await sendAnalyticsEvent({
    eventName: 'purchase',
    parameters: {
      value,
      currency,
      transaction_id: transactionId,
      items,
    },
  });
}