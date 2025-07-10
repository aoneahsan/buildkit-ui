import React, { ComponentType, forwardRef, useEffect, useRef, useCallback } from 'react';
import type { ComponentTrackingProps } from '../../tracking/types';
import {
  trackComponentMount,
  trackComponentUnmount,
  trackComponentRender,
  trackInteraction,
  trackError,
} from '../../tracking';
import { useTracking } from './useTracking';

export interface WithTrackingOptions {
  /**
   * Component type name for tracking
   */
  componentType?: string;
  
  /**
   * Events to automatically track
   */
  trackEvents?: string[];
  
  /**
   * Props to exclude from tracking
   */
  excludeProps?: string[];
  
  /**
   * Custom prop sanitizer
   */
  sanitizeProps?: (props: any) => any;
}

/**
 * Higher-order component that adds tracking to any component
 */
export function withTracking<P extends object>(
  Component: ComponentType<P>,
  options: WithTrackingOptions = {}
): ComponentType<P & ComponentTrackingProps> {
  const {
    componentType = Component.displayName || Component.name || 'Unknown',
    trackEvents = ['onClick', 'onSubmit', 'onChange'],
    excludeProps = [],
    sanitizeProps,
  } = options;

  const TrackedComponent = forwardRef<any, P & ComponentTrackingProps>((props, ref) => {
    const {
      trackingId,
      trackingEnabled = true,
      trackingEventPrefix,
      trackingMetadata,
      onTrackingEvent,
      ...componentProps
    } = props;

    const { componentId, trackEvent } = useTracking({
      componentType,
      trackingId,
      trackingEnabled,
      onTrackingEvent,
    });

    const renderCount = useRef(0);
    const mountTime = useRef(performance.now());

    // Track component mount
    useEffect(() => {
      if (!trackingEnabled) return () => {};

      const trackableProps = getTrackableProps(
        componentProps,
        excludeProps,
        sanitizeProps
      );

      trackComponentMount(componentType, componentId, trackableProps);

      return () => {
        trackComponentUnmount(componentId);
      };
    }, [componentId, trackingEnabled]);

    // Track renders
    useEffect(() => {
      if (!trackingEnabled) return;

      renderCount.current++;
      if (renderCount.current > 1) {
        trackComponentRender(componentId);
      }
    });

    // Create tracked event handlers
    const trackedProps = useCallback(() => {
      const tracked: any = {};

      for (const [key, value] of Object.entries(componentProps)) {
        if (typeof value === 'function' && trackEvents.includes(key)) {
          tracked[key] = createTrackedHandler(
            value as Function,
            key,
            componentType,
            componentId,
            trackingEnabled,
            trackingEventPrefix,
            trackingMetadata,
            trackEvent
          );
        } else {
          tracked[key] = value;
        }
      }

      return tracked;
    }, [componentProps, componentId, trackingEnabled, trackingEventPrefix, trackingMetadata]);

    // Error boundary
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        setHasError(true);
        setError(new Error(event.message));
        
        if (trackingEnabled) {
          trackError(
            {
              message: event.message,
              stack: event.error?.stack,
              componentType,
              context: {
                componentId,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
              },
            }
          );
        }
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, [componentId, trackingEnabled]);

    if (hasError && error) {
      return (
        <div className="buildkit-error-boundary p-4 border border-red-500 rounded bg-red-50">
          <h3 className="text-red-700 font-semibold">Component Error</h3>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      );
    }

    return <Component {...trackedProps()} ref={ref} />;
  });

  TrackedComponent.displayName = `Tracked(${componentType})`;

  return TrackedComponent;
}

/**
 * Get trackable props (excluding sensitive data)
 */
function getTrackableProps(
  props: any,
  excludeProps: string[],
  sanitizeProps?: (props: any) => any
): Record<string, any> {
  const trackable: Record<string, any> = {};
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'key',
    'auth',
    'credential',
    'ssn',
    'credit',
    ...excludeProps,
  ];

  for (const [key, value] of Object.entries(props)) {
    if (
      typeof value !== 'function' &&
      !sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    ) {
      trackable[key] = sanitizeValue(value);
    }
  }

  return sanitizeProps ? sanitizeProps(trackable) : trackable;
}

/**
 * Sanitize prop values
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...';
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === 'object') {
    return `Object(${Object.keys(value).length} keys)`;
  }

  return value;
}

/**
 * Create tracked event handler
 */
function createTrackedHandler(
  handler: Function,
  eventName: string,
  componentType: string,
  componentId: string,
  trackingEnabled: boolean,
  trackingEventPrefix?: string,
  trackingMetadata?: Record<string, any>,
  trackEvent?: (name: string, data?: any) => void
): Function {
  return (...args: any[]) => {
    const startTime = performance.now();

    try {
      const result = handler(...args);

      if (trackingEnabled) {
        const eventType = getEventType(eventName);
        const target = getEventTarget(args[0]);
        
        trackInteraction(
          {
            type: eventType,
            target,
            timestamp: Date.now(),
            metadata: {
              ...trackingMetadata,
              responseTime: performance.now() - startTime,
            },
          },
          componentType,
          componentId
        );

        // Call custom tracking handler if provided
        if (trackEvent) {
          const customEventName = trackingEventPrefix
            ? `${trackingEventPrefix}_${eventName}`
            : eventName;
          trackEvent(customEventName, { target, args: args.slice(1) });
        }
      }

      return result;
    } catch (error) {
      if (trackingEnabled) {
        trackError(error as Error, componentType, {
          eventName,
          componentId,
        });
      }
      throw error;
    }
  };
}

/**
 * Get event type from handler name
 */
function getEventType(
  eventName: string
): 'click' | 'focus' | 'blur' | 'change' | 'submit' | 'hover' | 'scroll' {
  const eventMap: Record<string, any> = {
    onClick: 'click',
    onFocus: 'focus',
    onBlur: 'blur',
    onChange: 'change',
    onSubmit: 'submit',
    onMouseEnter: 'hover',
    onScroll: 'scroll',
  };

  return eventMap[eventName] || 'click';
}

/**
 * Get event target description
 */
function getEventTarget(event: any): string {
  if (!event || !event.target) return 'unknown';

  const target = event.target;
  const tagName = target.tagName?.toLowerCase() || 'unknown';
  const id = target.id ? `#${target.id}` : '';
  const className = target.className
    ? `.${target.className.split(' ').join('.')}`
    : '';

  return `${tagName}${id}${className}`;
}