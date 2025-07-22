declare module 'unified-tracking' {
  export interface UnifiedTrackingConfig {
    providers?: string[];
    firebase?: any;
    amplitude?: any;
    clarity?: any;
    debug?: boolean;
  }

  export class UnifiedTracking {
    constructor(config: UnifiedTrackingConfig);
    initialize(): Promise<void>;
    trackEvent(eventName: string, properties?: Record<string, any>): Promise<void>;
    trackError(error: Error, context?: Record<string, any>): Promise<void>;
    setUserId(userId: string): Promise<void>;
    setUserProperties(properties: Record<string, any>): Promise<void>;
    trackPageView(pageName: string, properties?: Record<string, any>): Promise<void>;
    trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void>;
    startSession(sessionId?: string): Promise<void>;
    endSession(): Promise<void>;
    trackTiming(category: string, variable: string, value: number, label?: string): Promise<void>;
  }
}