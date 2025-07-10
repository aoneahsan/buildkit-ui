import { useEffect, useRef, useCallback } from 'react';
import type { TrackingEvent } from '../../definitions';
import {
  trackComponentMount,
  trackComponentUnmount,
  trackComponentRender,
  trackEvent as trackEventCore,
  trackInteraction as trackInteractionCore,
} from '../../tracking';
import { logInteractionBreadcrumb } from '../../tracking/errors';

export interface UseTrackingOptions {
  /**
   * Component type for tracking
   */
  componentType: string;

  /**
   * Custom component ID
   */
  trackingId?: string;

  /**
   * Whether tracking is enabled
   */
  trackingEnabled?: boolean;

  /**
   * Callback when tracking event occurs
   */
  onTrackingEvent?: (event: TrackingEvent) => void;

  /**
   * Props to track on mount
   */
  props?: Record<string, any>;
}

export interface UseTrackingResult {
  /**
   * Component ID used for tracking
   */
  componentId: string;

  /**
   * Track a custom event
   */
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;

  /**
   * Track an interaction
   */
  trackInteraction: (
    type: 'click' | 'focus' | 'blur' | 'change' | 'submit' | 'hover' | 'scroll',
    target: string,
    metadata?: Record<string, any>
  ) => void;

  /**
   * Create a tracked click handler
   */
  createClickHandler: <T extends (...args: any[]) => any>(
    handler: T,
    eventName: string,
    metadata?: Record<string, any>
  ) => T;

  /**
   * Measure performance of an async operation
   */
  measureAsync: <T>(
    operation: () => Promise<T>,
    operationName: string
  ) => Promise<T>;

  /**
   * Start a performance measurement
   */
  startMeasure: (name: string) => void;

  /**
   * End a performance measurement
   */
  endMeasure: (name: string) => number;
}

/**
 * React hook for component tracking
 */
export function useTracking(options: UseTrackingOptions): UseTrackingResult {
  const {
    componentType,
    trackingId,
    trackingEnabled = true,
    onTrackingEvent,
    props = {},
  } = options;

  // Generate stable component ID
  const componentId = useRef(
    trackingId || `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  const renderCount = useRef(0);
  const measurements = useRef<Map<string, number>>(new Map());

  // Track component lifecycle
  useEffect(() => {
    if (!trackingEnabled) return () => {};

    // Track mount
    trackComponentMount(componentType, componentId, props);

    return () => {
      // Track unmount
      trackComponentUnmount(componentId);
    };
  }, [componentId, componentType, trackingEnabled]);

  // Track renders
  useEffect(() => {
    if (!trackingEnabled) return;

    renderCount.current++;
    if (renderCount.current > 1) {
      trackComponentRender(componentId);
    }
  });

  // Track event
  const trackEvent = useCallback(
    (eventName: string, parameters?: Record<string, any>) => {
      if (!trackingEnabled) return;

      const event: TrackingEvent = {
        eventName,
        componentType,
        parameters: {
          componentId,
          ...parameters,
        },
      };

      trackEventCore(event);

      if (onTrackingEvent) {
        onTrackingEvent(event);
      }
    },
    [componentId, componentType, trackingEnabled, onTrackingEvent]
  );

  // Track interaction
  const trackInteraction = useCallback(
    (
      type: 'click' | 'focus' | 'blur' | 'change' | 'submit' | 'hover' | 'scroll',
      target: string,
      metadata?: Record<string, any>
    ) => {
      if (!trackingEnabled) return;

      trackInteractionCore(
        {
          type,
          target,
          timestamp: Date.now(),
          metadata,
        },
        componentType,
        componentId
      );

      // Add breadcrumb
      logInteractionBreadcrumb(type, `${componentType}.${target}`, metadata);
    },
    [componentId, componentType, trackingEnabled]
  );

  // Create tracked click handler
  const createClickHandler = useCallback(
    <T extends (...args: any[]) => any>(
      handler: T,
      eventName: string,
      metadata?: Record<string, any>
    ): T => {
      return ((...args: Parameters<T>) => {
        const startTime = performance.now();

        try {
          const result = handler(...args);

          if (trackingEnabled) {
            trackInteraction('click', eventName, {
              ...metadata,
              responseTime: performance.now() - startTime,
            });
          }

          return result;
        } catch (error) {
          if (trackingEnabled) {
            trackEvent(`${eventName}_error`, {
              error: (error as Error).message,
              ...metadata,
            });
          }
          throw error;
        }
      }) as T;
    },
    [trackingEnabled, trackInteraction, trackEvent]
  );

  // Measure async operation
  const measureAsync = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await operation();
        const duration = performance.now() - startTime;

        if (trackingEnabled) {
          trackEvent(`${operationName}_complete`, {
            duration,
            success: true,
          });
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        if (trackingEnabled) {
          trackEvent(`${operationName}_error`, {
            duration,
            success: false,
            error: (error as Error).message,
          });
        }

        throw error;
      }
    },
    [trackingEnabled, trackEvent]
  );

  // Start performance measurement
  const startMeasure = useCallback((name: string) => {
    measurements.current.set(name, performance.now());
  }, []);

  // End performance measurement
  const endMeasure = useCallback(
    (name: string): number => {
      const startTime = measurements.current.get(name);
      if (!startTime) {
        console.warn(`No measurement found for ${name}`);
        return 0;
      }

      const duration = performance.now() - startTime;
      measurements.current.delete(name);

      if (trackingEnabled) {
        trackEvent('performance_measure', {
          measureName: name,
          duration,
        });
      }

      return duration;
    },
    [trackingEnabled, trackEvent]
  );

  return {
    componentId,
    trackEvent,
    trackInteraction,
    createClickHandler,
    measureAsync,
    startMeasure,
    endMeasure,
  };
}