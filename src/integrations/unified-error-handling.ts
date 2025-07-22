import { UnifiedErrorHandling } from 'unified-error-handling';
import type { ErrorEvent } from '../definitions';
import { getTrackingContext } from '../tracking/context';

// Unified error handler instance
let unifiedErrorHandler: UnifiedErrorHandling | null = null;

export interface UnifiedErrorConfig {
  sentry?: {
    dsn: string;
    environment?: string;
    tracesSampleRate?: number;
    options?: any;
  };
  bugsnag?: {
    apiKey: string;
    options?: any;
  };
  rollbar?: {
    accessToken: string;
    environment?: string;
    options?: any;
  };
  logrocket?: {
    appId: string;
    options?: any;
  };
  datadog?: {
    clientToken: string;
    site?: string;
    service?: string;
    options?: any;
  };
  providers?: string[];
  debug?: boolean;
}

/**
 * Initialize unified error handling
 */
export async function initializeUnifiedErrorHandling(config: UnifiedErrorConfig): Promise<void> {
  try {
    // Initialize unified error handling with configured providers
    unifiedErrorHandler = new UnifiedErrorHandling({
      providers: config.providers || [],
      sentry: config.sentry,
      bugsnag: config.bugsnag,
      rollbar: config.rollbar,
      logrocket: config.logrocket,
      datadog: config.datadog,
      debug: config.debug || false,
    });

    await unifiedErrorHandler.initialize();

    // Set initial context
    const context = getTrackingContext();
    await setErrorContext({
      sessionId: context.sessionId,
      platform: context.platform || context.platformInfo?.platform,
      appVersion: context.appVersion || context.platformInfo?.appVersion,
    });

    // Set user if available
    if (context.userId) {
      await setErrorUser(context.userId, context.userProperties);
    }
  } catch (error) {
    console.error('Failed to initialize unified error handling:', error);
    throw error;
  }
}

/**
 * Capture error using unified error handling
 */
export async function captureError(error: Error | ErrorEvent, context?: Record<string, any>): Promise<void> {
  if (!unifiedErrorHandler) {
    console.error('Unified error handling not initialized');
    return;
  }

  const trackingContext = getTrackingContext();
  const errorContext = {
    ...context,
    sessionId: trackingContext.sessionId,
    platform: trackingContext.platform,
    appVersion: trackingContext.appVersion,
  };

  if (error instanceof Error) {
    await unifiedErrorHandler.captureException(error, errorContext);
  } else {
    const err = new Error(error.message);
    err.stack = error.stack;
    await unifiedErrorHandler.captureException(err, {
      ...errorContext,
      severity: error.severity,
      componentType: error.componentType,
    });
  }
}

/**
 * Capture message
 */
export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): Promise<void> {
  if (!unifiedErrorHandler) {
    console.error('Unified error handling not initialized');
    return;
  }

  await unifiedErrorHandler.captureMessage(message, level, context);
}

/**
 * Add breadcrumb
 */
export async function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'ui',
    level: breadcrumb.level || 'info',
    timestamp: Date.now(),
    data: breadcrumb.data,
  });
}

/**
 * Set error context
 */
export async function setErrorContext(context: Record<string, any>): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.setContext(context);
}

/**
 * Set error user
 */
export async function setErrorUser(userId: string, properties?: Record<string, any>): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.setUser({
    id: userId,
    ...properties,
  });
}

/**
 * Set error tags
 */
export async function setErrorTags(tags: Record<string, string>): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.setTags(tags);
}

/**
 * Clear error user
 */
export async function clearErrorUser(): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.clearUser();
}

/**
 * Start error session
 */
export async function startErrorSession(): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.startSession();
}

/**
 * End error session
 */
export async function endErrorSession(): Promise<void> {
  if (!unifiedErrorHandler) {
    return;
  }

  await unifiedErrorHandler.endSession();
}

/**
 * Wrap function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      await captureError(error as Error, context);
      throw error;
    }
  }) as T;
}

/**
 * React error boundary handler
 */
export async function handleErrorBoundary(error: Error, errorInfo: { componentStack: string }): Promise<void> {
  await captureError(error, {
    errorBoundary: true,
    componentStack: errorInfo.componentStack,
  });
}

/**
 * Check if unified error handling is initialized
 */
export function isUnifiedErrorHandlingInitialized(): boolean {
  return unifiedErrorHandler !== null;
}

/**
 * Get unified error handler instance
 */
export function getUnifiedErrorHandler(): UnifiedErrorHandling | null {
  return unifiedErrorHandler;
}

/**
 * Capture unified exception (alias for captureError)
 */
export async function captureUnifiedException(error: Error | ErrorEvent, context?: Record<string, any>): Promise<void> {
  return captureError(error, context);
}

/**
 * Capture unified error (alias for captureError)
 */
export async function captureUnifiedError(error: Error | ErrorEvent, context?: Record<string, any>): Promise<void> {
  return captureError(error, context);
}