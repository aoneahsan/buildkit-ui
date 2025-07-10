import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Toast as PrimeToast } from 'primereact/toast';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';

export interface ToastMessage {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

export interface ToastRef {
  show: (message: ToastMessage | ToastMessage[]) => void;
  clear: () => void;
}

export interface ToastProps extends React.ComponentProps<typeof PrimeToast> {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  trackingMetadata?: Record<string, any>;
}

export const Toast = forwardRef<ToastRef, ToastProps>(({
  position = 'top-right',
  className,
  trackingMetadata,
  ...props
}, ref) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'Toast',
    props: trackingMetadata 
  });
  const toastRef = useRef<PrimeToast>(null);

  useImperativeHandle(ref, () => ({
    show: (message: ToastMessage | ToastMessage[]) => {
      const messages = Array.isArray(message) ? message : [message];
      messages.forEach(msg => {
        trackEvent('toast_show', { 
          severity: msg.severity,
          summary: msg.summary,
          position,
          ...trackingMetadata 
        });
      });
      toastRef.current?.show(message);
    },
    clear: () => {
      trackEvent('toast_clear', { 
        position,
        ...trackingMetadata 
      });
      toastRef.current?.clear();
    }
  }));

  const toastClasses = cn(
    'buildkit-toast',
    className
  );

  return (
    <PrimeToast
      ref={toastRef}
      position={position}
      className={toastClasses}
      {...props}
      pt={{
        root: { 
          className: cn(
            'opacity-90',
            position === 'center' && 'transform -translate-x-1/2 -translate-y-1/2'
          )
        },
        message: { 
          className: cn(
            'mb-4 rounded-lg shadow-lg',
            'backdrop-blur-sm',
            'border border-gray-200/20 dark:border-gray-700/20'
          )
        },
      }}
    />
  );
});

Toast.displayName = 'Toast';