import { useCallback, useRef } from 'react';
import { startTrace, stopTrace, addTraceMetric } from '../tracking/performance';

export interface UsePerformanceResult {
  startTrace: (name: string) => Promise<string>;
  stopTrace: (traceId: string, metrics?: Record<string, number>) => Promise<void>;
  addMetric: (traceId: string, name: string, value: number) => void;
  measureRender: () => () => void;
}

export function usePerformance(): UsePerformanceResult {
  const traces = useRef<Map<string, string>>(new Map());

  const handleStartTrace = useCallback(async (name: string) => {
    const traceId = await startTrace(name);
    traces.current.set(name, traceId);
    return traceId;
  }, []);

  const handleStopTrace = useCallback(async (traceId: string, metrics?: Record<string, number>) => {
    await stopTrace(traceId, metrics);
    
    // Remove from local map
    for (const [name, id] of traces.current.entries()) {
      if (id === traceId) {
        traces.current.delete(name);
        break;
      }
    }
  }, []);

  const handleAddMetric = useCallback((traceId: string, name: string, value: number) => {
    addTraceMetric(traceId, name, value);
  }, []);

  const measureRender = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      console.log(`Render took ${renderTime}ms`);
    };
  }, []);

  return {
    startTrace: handleStartTrace,
    stopTrace: handleStopTrace,
    addMetric: handleAddMetric,
    measureRender,
  };
}