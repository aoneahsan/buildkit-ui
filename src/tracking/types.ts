import type { TrackingEvent, ErrorEvent, PlatformInfo } from '../definitions';

export interface TrackedComponent {
  componentType: string;
  componentId: string;
  props: Record<string, any>;
  mountTime: number;
  renderCount: number;
  lastRenderTime: number;
}

export interface TrackingContext {
  sessionId: string;
  userId?: string;
  userJourney: string[];
  platformInfo: PlatformInfo;
  isTracking: boolean;
}

export interface ComponentTrackingProps {
  trackingId?: string;
  trackingEnabled?: boolean;
  trackingEventPrefix?: string;
  trackingMetadata?: Record<string, any>;
  onTrackingEvent?: (event: TrackingEvent) => void;
}

export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateTime: number;
  interactionDelay: number;
  memoryUsage?: number;
}

export interface InteractionEvent {
  type: 'click' | 'focus' | 'blur' | 'change' | 'submit' | 'hover' | 'scroll';
  target: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Analytics {
  firebase?: any;
  amplitude?: any;
  clarity?: any;
  custom?: CustomAnalytics;
}

export interface CustomAnalytics {
  endpoint: string;
  headers?: Record<string, string>;
  transformEvent?: (event: TrackingEvent) => any;
}

export interface ErrorTracking {
  sentry?: any;
  crashlytics?: any;
  custom?: CustomErrorTracking;
}

export interface CustomErrorTracking {
  endpoint: string;
  headers?: Record<string, string>;
  transformError?: (error: ErrorEvent) => any;
}

export interface QueueItem {
  id: string;
  type: 'event' | 'error' | 'performance';
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
}

export interface QueueConfig {
  maxSize: number;
  syncInterval: number;
  maxRetries: number;
  persistQueue: boolean;
  priorityOrder: boolean;
}