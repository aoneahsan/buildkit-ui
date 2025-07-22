import React, { useEffect, useRef } from 'react';
import { TrackedWrapper } from '../base/TrackedWrapper';
import { trackPageView, trackUserJourney } from '../../tracking';
import { trackScreenView } from '../../integrations/unified-tracking';
import { isUnifiedTrackingInitialized } from '../../integrations/unified-tracking';
import { clsx } from 'clsx';

export interface ScreenViewProps {
  className?: string;
  screenName: string;
  screenClass?: string;
  trackingMetadata?: Record<string, any>;
  trackOnMount?: boolean;
  trackUserJourney?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  role?: string;
  'aria-label'?: string;
}

export const ScreenView: React.FC<ScreenViewProps> = ({
  className,
  screenName,
  screenClass,
  trackingMetadata,
  trackOnMount = true,
  trackUserJourney: shouldTrackJourney = true,
  children,
  style,
  role = 'main',
  'aria-label': ariaLabel,
}) => {
  const hasTracked = useRef(false);
  const previousScreenName = useRef<string | null>(null);

  useEffect(() => {
    // Track screen view on mount or when screen name changes
    if (trackOnMount && (!hasTracked.current || previousScreenName.current !== screenName)) {
      const trackScreen = async () => {
        try {
          const metadata = {
            screenClass,
            ...trackingMetadata,
          };

          // Use unified tracking screen view if available (for mobile)
          if (isUnifiedTrackingInitialized()) {
            await trackScreenView(screenName, metadata);
          } else {
            // Fallback to page view tracking (for web)
            await trackPageView(screenName, metadata);
          }

          // Track user journey step
          if (shouldTrackJourney) {
            trackUserJourney(screenName, metadata);
          }

          hasTracked.current = true;
          previousScreenName.current = screenName;
        } catch (error) {
          console.error('Failed to track screen view:', error);
        }
      };

      void trackScreen();
    }
  }, [screenName, screenClass, trackingMetadata, trackOnMount, shouldTrackJourney]);

  // Reset tracking when component unmounts
  useEffect(() => {
    return () => {
      hasTracked.current = false;
    };
  }, []);

  return (
    <TrackedWrapper
      componentType="ScreenView"
      className={clsx('buildkit-screen-view', className)}
      trackingMetadata={{ screenName, screenClass, ...trackingMetadata }}
    >
      <div 
        className={clsx('screen-view-container', `screen-${screenName.toLowerCase().replace(/\s+/g, '-')}`)}
        style={style}
        role={role}
        aria-label={ariaLabel || screenName}
        data-screen-name={screenName}
        data-screen-class={screenClass}
      >
        {children}
      </div>
    </TrackedWrapper>
  );
};