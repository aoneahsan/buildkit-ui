import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import type { TrackingConfig } from '../definitions';
import { initializeTrackingContext, setTrackingEnabled } from '../tracking/context';
import { initializeAnalytics } from '../tracking/analytics';
import { initializeErrorTracking } from '../tracking/errors';
import { initializeQueue } from '../tracking/queue';

export interface TrackingContextValue {
  /**
   * Whether tracking is enabled
   */
  isEnabled: boolean;
  
  /**
   * Enable/disable tracking
   */
  setEnabled: (enabled: boolean) => void;
  
  /**
   * Tracking configuration
   */
  config: TrackingConfig;
}

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

export interface TrackingProviderProps {
  /**
   * Tracking configuration
   */
  config: TrackingConfig;
  
  /**
   * Child components
   */
  children: ReactNode;
}

export function TrackingProvider({ config, children }: TrackingProviderProps) {
  const [isEnabled, setIsEnabled] = React.useState(config.autoTrack);

  useEffect(() => {
    initializeTrackingSystem();
  }, []);

  const initializeTrackingSystem = async () => {
    try {
      // Initialize tracking context
      await initializeTrackingContext();
      
      // Set initial tracking state
      setTrackingEnabled(isEnabled);

      // Initialize analytics if configured
      if (config.analytics) {
        await initializeAnalytics({
          firebase: config.analytics.firebase ? {} : undefined,
          amplitude: config.analytics.amplitude ? {} : undefined,
          clarity: config.analytics.clarity ? {} : undefined,
          custom: config.analytics.custom,
        });
      }

      // Initialize error tracking if configured
      if (config.errorTracking) {
        await initializeErrorTracking({
          sentry: config.errorTracking.sentry ? {} : undefined,
          crashlytics: config.errorTracking.crashlytics ? {} : undefined,
          custom: config.errorTracking.custom,
        });
      }

      // Initialize offline queue
      await initializeQueue({
        maxSize: 1000,
        syncInterval: 60000,
        persistQueue: true,
        maxRetries: 3,
        priorityOrder: true,
      });
    } catch (error) {
      console.error('Failed to initialize tracking system:', error);
    }
  };

  const handleSetEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    setTrackingEnabled(enabled);
  };

  const value: TrackingContextValue = {
    isEnabled,
    setEnabled: handleSetEnabled,
    config,
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

/**
 * Hook to use tracking context
 */
export function useTrackingContext() {
  const context = useContext(TrackingContext);
  
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider');
  }

  return context;
}