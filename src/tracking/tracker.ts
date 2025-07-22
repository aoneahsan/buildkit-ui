import { BuildKitUI } from '../index';
import type { TrackingEvent, ErrorEvent } from '../definitions';
import type { TrackedComponent, InteractionEvent, PerformanceMetrics } from './types';
import { getTrackingContext } from './context';
import { addToQueue } from './queue';
import { 
  isUnifiedTrackingInitialized, 
  trackUnifiedEvent, 
  trackUnifiedError,
  trackPageView as trackUnifiedPageView,
  trackTiming
} from '../integrations/unified-tracking';
import { 
  isUnifiedErrorHandlingInitialized, 
  captureError,
  addBreadcrumb 
} from '../integrations/unified-error-handling';

// Component registry to track mounted components
const componentRegistry = new Map<string, TrackedComponent>();

// Performance observer for tracking metrics
let performanceObserver: PerformanceObserver | null = null;

/**
 * Initialize the tracking system
 */
export function initializeTracking(): void {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          // Use Promise.resolve to handle async function
          void trackPerformance(entry.name, entry.duration);
        }
      }
    });

    performanceObserver.observe({ entryTypes: ['measure'] });
  }
}

/**
 * Track a component mount
 */
export function trackComponentMount(
  componentType: string,
  componentId: string,
  props: Record<string, any>
): void {
  const mountTime = performance.now();
  
  componentRegistry.set(componentId, {
    componentType,
    componentId,
    props,
    mountTime,
    renderCount: 1,
    lastRenderTime: mountTime,
  });

  trackEvent({
    eventName: 'component_mount',
    componentType,
    parameters: {
      componentId,
      mountTime,
      propsCount: Object.keys(props).length,
    },
  });
}

/**
 * Track a component unmount
 */
export function trackComponentUnmount(componentId: string): void {
  const component = componentRegistry.get(componentId);
  if (!component) return;

  const lifetimeMs = performance.now() - component.mountTime;
  
  trackEvent({
    eventName: 'component_unmount',
    componentType: component.componentType,
    parameters: {
      componentId,
      lifetimeMs,
      renderCount: component.renderCount,
    },
  });

  componentRegistry.delete(componentId);
}

/**
 * Track a component render/update
 */
export function trackComponentRender(componentId: string): void {
  const component = componentRegistry.get(componentId);
  if (!component) return;

  const renderTime = performance.now();
  const timeSinceLastRender = renderTime - component.lastRenderTime;

  component.renderCount++;
  component.lastRenderTime = renderTime;

  if (component.renderCount > 1) {
    trackEvent({
      eventName: 'component_update',
      componentType: component.componentType,
      parameters: {
        componentId,
        renderCount: component.renderCount,
        timeSinceLastRender,
      },
    });
  }
}

/**
 * Track a user interaction
 */
export function trackInteraction(
  interaction: InteractionEvent,
  componentType: string,
  componentId?: string
): void {
  const context = getTrackingContext();
  
  trackEvent({
    eventName: `${componentType}_${interaction.type}`,
    componentType,
    parameters: {
      componentId,
      interactionType: interaction.type,
      target: interaction.target,
      ...interaction.metadata,
    },
  });
}

/**
 * Track a generic event
 */
export async function trackEvent(event: TrackingEvent): Promise<void> {
  const context = getTrackingContext();
  
  if (!context.isTracking) {
    return;
  }

  const enrichedEvent: TrackingEvent = {
    ...event,
    timestamp: Date.now(),
  };

  try {
    // Try unified tracking first if initialized
    if (isUnifiedTrackingInitialized()) {
      await trackUnifiedEvent(enrichedEvent);
    } else {
      // Fallback to direct BuildKitUI tracking
      await BuildKitUI.trackEvent(enrichedEvent);
    }
    
    // Add breadcrumb for error tracking
    if (isUnifiedErrorHandlingInitialized()) {
      await addBreadcrumb({
        message: `Event: ${event.eventName}`,
        category: 'tracking',
        data: event.parameters,
      });
    }
  } catch (error) {
    console.error('Failed to track event:', error);
    // Add to offline queue
    addToQueue({
      type: 'event',
      data: enrichedEvent,
      priority: 'normal',
    });
  }
}

/**
 * Track an error
 */
export async function trackErrorEvent(
  error: Error | ErrorEvent,
  componentType?: string,
  context?: Record<string, any>
): Promise<void> {
  const errorEvent: ErrorEvent = {
    message: error instanceof Error ? error.message : error.message,
    stack: error instanceof Error ? error.stack : error.stack,
    componentType,
    context,
    severity: 'error',
  };

  try {
    // Try unified error handling first if initialized
    if (isUnifiedErrorHandlingInitialized()) {
      await captureError(errorEvent, context);
    }
    
    // Also track through unified tracking if available
    if (isUnifiedTrackingInitialized()) {
      await trackUnifiedError(errorEvent);
    } else {
      // Fallback to direct BuildKitUI tracking
      await BuildKitUI.trackError(errorEvent);
    }
  } catch (err) {
    console.error('Failed to track error:', err);
    // Add to offline queue
    addToQueue({
      type: 'error',
      data: errorEvent,
      priority: 'high',
    });
  }
}

/**
 * Track performance metrics
 */
export async function trackPerformance(
  metricName: string,
  value: number,
  componentType?: string
): Promise<void> {
  // Use unified tracking timing if available
  if (isUnifiedTrackingInitialized()) {
    await trackTiming('performance', metricName, value, componentType);
  }
  
  // Also track as regular event
  await trackEvent({
    eventName: 'performance_metric',
    componentType,
    parameters: {
      metricName,
      value,
      unit: 'ms',
    },
  });
}

/**
 * Start a performance measurement
 */
export function startPerformanceMeasure(measureName: string): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${measureName}-start`);
  }
}

/**
 * End a performance measurement
 */
export function endPerformanceMeasure(measureName: string): number {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${measureName}-end`);
    performance.measure(
      measureName,
      `${measureName}-start`,
      `${measureName}-end`
    );
    
    const measure = performance.getEntriesByName(measureName, 'measure')[0];
    if (measure) {
      return measure.duration;
    }
  }
  return 0;
}

/**
 * Track page view
 */
export async function trackPageView(pageName: string, metadata?: Record<string, any>): Promise<void> {
  // Use unified tracking page view if available
  if (isUnifiedTrackingInitialized()) {
    await trackUnifiedPageView(pageName, metadata);
  } else {
    // Fallback to regular event tracking
    await trackEvent({
      eventName: 'page_view',
      parameters: {
        pageName,
        ...metadata,
      },
    });
  }
}

/**
 * Track user journey step
 */
export function trackUserJourney(step: string, metadata?: Record<string, any>): void {
  const context = getTrackingContext();
  context.userJourney.push(step);
  
  // Keep only last 20 steps
  if (context.userJourney.length > 20) {
    context.userJourney.shift();
  }

  trackEvent({
    eventName: 'user_journey_step',
    parameters: {
      step,
      journeyLength: context.userJourney.length,
      ...metadata,
    },
  });
}

/**
 * Get component performance metrics
 */
export function getComponentMetrics(componentId: string): PerformanceMetrics | null {
  const component = componentRegistry.get(componentId);
  if (!component) return null;

  return {
    renderTime: component.lastRenderTime - component.mountTime,
    mountTime: component.mountTime,
    updateTime: component.renderCount > 1 ? component.lastRenderTime : 0,
    interactionDelay: 0, // Will be calculated based on user interactions
  };
}

/**
 * Clear all tracking data (useful for testing)
 */
export function clearTrackingData(): void {
  componentRegistry.clear();
}

/**
 * Get all tracked components (useful for debugging)
 */
export function getTrackedComponents(): TrackedComponent[] {
  return Array.from(componentRegistry.values());
}