declare module 'unified-error-handling' {
  export interface UnifiedErrorHandlingConfig {
    providers?: string[];
    sentry?: any;
    bugsnag?: any;
    rollbar?: any;
    logrocket?: any;
    datadog?: any;
    debug?: boolean;
  }

  export class UnifiedErrorHandling {
    constructor(config: UnifiedErrorHandlingConfig);
    initialize(): Promise<void>;
    captureException(error: Error, context?: Record<string, any>): Promise<void>;
    captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: Record<string, any>): Promise<void>;
    addBreadcrumb(breadcrumb: {
      message: string;
      category?: string;
      level?: 'info' | 'warning' | 'error';
      timestamp?: number;
      data?: Record<string, any>;
    }): Promise<void>;
    setContext(context: Record<string, any>): Promise<void>;
    setUser(user: { id: string; [key: string]: any }): Promise<void>;
    setTags(tags: Record<string, string>): Promise<void>;
    clearUser(): Promise<void>;
    startSession(): Promise<void>;
    endSession(): Promise<void>;
  }
}