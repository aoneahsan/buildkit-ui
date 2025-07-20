import type { ErrorEvent, Breadcrumb } from '../definitions';
import type { ErrorTracking } from './types';
import { getTrackingContext } from './context';
import { loadSentry } from '../utils/dynamic-imports';

let errorProviders: ErrorTracking = {};
let isInitialized = false;
let breadcrumbs: Breadcrumb[] = [];

/**
 * Initialize error tracking providers
 */
export async function initializeErrorTracking(providers: ErrorTracking): Promise<void> {
  errorProviders = providers;
  isInitialized = true;

  // Initialize Sentry
  if (providers.sentry) {
    await initializeSentry();
  }

  // Initialize Crashlytics (via Firebase)
  if (providers.crashlytics) {
    await initializeCrashlytics();
  }

  // Set up global error handlers
  setupGlobalErrorHandlers();
}

/**
 * Track an error across all providers
 */
export async function trackError(error: ErrorEvent): Promise<void> {
  if (!isInitialized) {
    console.warn('Error tracking not initialized');
    return;
  }

  // Enrich error with context
  const enrichedError = await enrichError(error);

  const promises: Promise<void>[] = [];

  // Send to Sentry
  if (errorProviders.sentry) {
    promises.push(sendToSentry(enrichedError));
  }

  // Send to Crashlytics
  if (errorProviders.crashlytics) {
    promises.push(sendToCrashlytics(enrichedError));
  }

  // Send to custom error tracking
  if (errorProviders.custom) {
    promises.push(sendToCustom(enrichedError));
  }

  await Promise.allSettled(promises);
}

/**
 * Add a breadcrumb
 */
export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
  const fullBreadcrumb: Breadcrumb = {
    ...breadcrumb,
    timestamp: Date.now(),
  };

  breadcrumbs.push(fullBreadcrumb);

  // Keep only last 100 breadcrumbs
  if (breadcrumbs.length > 100) {
    breadcrumbs = breadcrumbs.slice(-100);
  }

  // Also add to Sentry if available
  if (errorProviders.sentry) {
    addSentryBreadcrumb(fullBreadcrumb);
  }
}

/**
 * Clear breadcrumbs
 */
export function clearBreadcrumbs(): void {
  breadcrumbs = [];
}

/**
 * Get current breadcrumbs
 */
export function getBreadcrumbs(): Breadcrumb[] {
  return [...breadcrumbs];
}

/**
 * Enrich error with context
 */
async function enrichError(error: ErrorEvent): Promise<ErrorEvent> {
  const context = getTrackingContext();
  
  return {
    ...error,
    breadcrumbs: [...breadcrumbs.slice(-20), ...(error.breadcrumbs || [])],
    context: {
      ...error.context,
      sessionId: context.sessionId,
      userId: context.userId,
      userJourney: context.userJourney.slice(-10),
      platform: context.platformInfo.platform,
      appVersion: context.platformInfo.appVersion,
      device: context.platformInfo.device,
      network: context.platformInfo.network,
    },
  };
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers(): void {
  if (typeof window !== 'undefined') {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      trackError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'error',
        context: {
          reason: event.reason,
        },
      });
    });
  }
}

// Sentry implementation
async function initializeSentry(): Promise<void> {
  try {
    const Sentry = await loadSentry();
    // Sentry should be initialized with DSN from config
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

async function sendToSentry(error: ErrorEvent): Promise<void> {
  try {
    const Sentry = await loadSentry();
    
    if (error.severity === 'fatal') {
      Sentry.captureException(new Error(error.message), {
        level: 'fatal',
        contexts: {
          custom: error.context,
        },
      });
    } else {
      Sentry.captureMessage(error.message, error.severity || 'error');
    }
  } catch (err) {
    console.error('Sentry error:', err);
  }
}

function addSentryBreadcrumb(breadcrumb: Breadcrumb): void {
  try {
    loadSentry().then((Sentry) => {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        type: breadcrumb.type,
        data: breadcrumb.data,
        timestamp: breadcrumb.timestamp / 1000, // Sentry expects seconds
      });
    });
  } catch (error) {
    // Ignore
  }
}

// Crashlytics implementation
async function initializeCrashlytics(): Promise<void> {
  try {
    // Firebase Crashlytics would be initialized here
    // Crashlytics should be initialized with Firebase
  } catch (error) {
    console.error('Failed to initialize Crashlytics:', error);
  }
}

async function sendToCrashlytics(error: ErrorEvent): Promise<void> {
  try {
    // Firebase Crashlytics would record the error here
    
    // Log custom keys for context
    if (error.context) {
      for (const [key, value] of Object.entries(error.context)) {
        // Firebase Crashlytics would set custom key here
        // await FirebaseKit.setCustomKey({
        //   key,
        //   value: String(value),
        // });
      }
    }

    // Record the exception
    // Firebase Crashlytics would record exception here
    // await FirebaseKit.recordException({
    //   message: error.message,
    //   stack: error.stack,
    //   fatal: error.severity === 'fatal',
    // });
  } catch (err) {
    console.error('Crashlytics error:', err);
  }
}

// Custom error tracking implementation
async function sendToCustom(error: ErrorEvent): Promise<void> {
  const customConfig = errorProviders.custom;
  if (!customConfig) return;

  try {
    const errorData = customConfig.transformError
      ? customConfig.transformError(error)
      : error;

    await fetch(customConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customConfig.headers,
      },
      body: JSON.stringify(errorData),
    });
  } catch (err) {
    console.error('Custom error tracking error:', err);
  }
}

/**
 * Capture exception
 */
export async function captureException(
  error: Error,
  context?: Record<string, any>
): Promise<void> {
  await trackError({
    message: error.message,
    stack: error.stack,
    severity: 'error',
    context,
  });
}

/**
 * Capture message
 */
export async function captureMessage(
  message: string,
  severity: 'fatal' | 'error' | 'warning' | 'info' = 'info',
  context?: Record<string, any>
): Promise<void> {
  await trackError({
    message,
    severity,
    context,
  });
}

/**
 * Log navigation breadcrumb
 */
export function logNavigationBreadcrumb(from: string, to: string): void {
  addBreadcrumb({
    type: 'navigation',
    message: `Navigated from ${from} to ${to}`,
    data: { from, to },
  });
}

/**
 * Log interaction breadcrumb
 */
export function logInteractionBreadcrumb(
  action: string,
  target: string,
  data?: Record<string, any>
): void {
  addBreadcrumb({
    type: 'click',
    message: `${action} on ${target}`,
    data,
  });
}