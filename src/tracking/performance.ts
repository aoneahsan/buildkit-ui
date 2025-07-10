import { BuildKitUI } from '../index';
import type { PerformanceMetrics } from './types';
import { trackEvent } from './tracker';

interface PerformanceTrace {
  name: string;
  startTime: number;
  metrics: Map<string, number>;
}

const activeTraces = new Map<string, PerformanceTrace>();
const componentMetrics = new Map<string, PerformanceMetrics>();

/**
 * Start a performance trace
 */
export async function startTrace(name: string): Promise<string> {
  const { traceId } = await BuildKitUI.startTrace(name);
  
  activeTraces.set(traceId, {
    name,
    startTime: performance.now(),
    metrics: new Map(),
  });

  return traceId;
}

/**
 * Stop a performance trace
 */
export async function stopTrace(
  traceId: string,
  additionalMetrics?: Record<string, number>
): Promise<void> {
  const trace = activeTraces.get(traceId);
  if (!trace) {
    console.warn(`Trace ${traceId} not found`);
    return;
  }

  const duration = performance.now() - trace.startTime;
  const metrics: Record<string, number> = {
    duration,
    ...Object.fromEntries(trace.metrics),
    ...additionalMetrics,
  };

  await BuildKitUI.stopTrace(traceId, metrics);
  activeTraces.delete(traceId);

  // Also track as event for analytics
  trackEvent({
    eventName: 'performance_trace_complete',
    parameters: {
      traceName: trace.name,
      ...metrics,
    },
  });
}

/**
 * Add metric to active trace
 */
export function addTraceMetric(traceId: string, name: string, value: number): void {
  const trace = activeTraces.get(traceId);
  if (!trace) {
    console.warn(`Trace ${traceId} not found`);
    return;
  }

  trace.metrics.set(name, value);
}

/**
 * Measure component render performance
 */
export function measureComponentPerformance(
  componentId: string,
  phase: 'mount' | 'update' | 'render',
  duration: number
): void {
  let metrics = componentMetrics.get(componentId);
  
  if (!metrics) {
    metrics = {
      renderTime: 0,
      mountTime: 0,
      updateTime: 0,
      interactionDelay: 0,
    };
    componentMetrics.set(componentId, metrics);
  }

  switch (phase) {
    case 'mount':
      metrics.mountTime = duration;
      break;
    case 'update':
      metrics.updateTime = duration;
      break;
    case 'render':
      metrics.renderTime = duration;
      break;
  }

  // Track if duration exceeds threshold
  if (duration > 16) { // 16ms = 60fps threshold
    trackEvent({
      eventName: 'slow_component_render',
      parameters: {
        componentId,
        phase,
        duration,
        threshold: 16,
      },
    });
  }
}

/**
 * Measure interaction response time
 */
export function measureInteractionTime(
  componentId: string,
  interactionType: string,
  startTime: number
): void {
  const responseTime = performance.now() - startTime;
  
  let metrics = componentMetrics.get(componentId);
  if (metrics) {
    metrics.interactionDelay = responseTime;
  }

  // Track if interaction is slow
  if (responseTime > 100) { // 100ms threshold for interactions
    trackEvent({
      eventName: 'slow_interaction',
      parameters: {
        componentId,
        interactionType,
        responseTime,
        threshold: 100,
      },
    });
  }
}

/**
 * Create a performance observer for long tasks
 */
export function observeLongTasks(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 50ms is considered a long task
          trackEvent({
            eventName: 'long_task_detected',
            parameters: {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            },
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // Long task observer not supported
  }
}

/**
 * Measure first contentful paint
 */
export function measureFirstContentfulPaint(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          trackEvent({
            eventName: 'first_contentful_paint',
            parameters: {
              value: entry.startTime,
            },
          });
          observer.disconnect();
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  } catch (error) {
    // Paint timing not supported
  }
}

/**
 * Measure cumulative layout shift
 */
export function measureLayoutShift(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  let cumulativeScore = 0;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeScore += (entry as any).value;
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // Report CLS when page is about to unload
    window.addEventListener('beforeunload', () => {
      trackEvent({
        eventName: 'cumulative_layout_shift',
        parameters: {
          value: cumulativeScore,
        },
      });
    });
  } catch (error) {
    // Layout shift tracking not supported
  }
}

/**
 * Get component performance metrics
 */
export function getComponentPerformanceMetrics(componentId: string): PerformanceMetrics | null {
  return componentMetrics.get(componentId) || null;
}

/**
 * Clear component performance metrics
 */
export function clearComponentMetrics(componentId: string): void {
  componentMetrics.delete(componentId);
}

/**
 * Initialize web vitals tracking
 */
export function initializeWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Measure First Contentful Paint
  measureFirstContentfulPaint();

  // Measure Cumulative Layout Shift
  measureLayoutShift();

  // Observe long tasks
  observeLongTasks();

  // Track page load performance
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      trackEvent({
        eventName: 'page_load_performance',
        parameters: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          domProcessing: navigation.domComplete - navigation.domLoading,
        },
      });
    }
  });
}

/**
 * Create custom performance mark
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two marks
 */
export function measure(name: string, startMark: string, endMark: string): number {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      if (entries.length > 0) {
        const duration = entries[0].duration;
        trackEvent({
          eventName: 'custom_performance_measure',
          parameters: {
            name,
            duration,
          },
        });
        return duration;
      }
    } catch (error) {
      console.error('Failed to measure performance:', error);
    }
  }
  return 0;
}