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
    componentProps: trackingMetadata 
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
        messageContent: { 
          className: 'flex items-start p-4' 
        },
        messageIcon: { 
          className: 'text-2xl mr-3 flex-shrink-0' 
        },
        messageText: { 
          className: 'flex-1' 
        },
        summary: { 
          className: 'font-semibold text-gray-900 dark:text-white mb-1' 
        },
        detail: { 
          className: 'text-sm text-gray-600 dark:text-gray-300' 
        },
        closeButton: { 
          className: cn(
            'ml-3 p-1 rounded',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors duration-200'
          )
        },
        closeIcon: { 
          className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
        },
        // Severity-specific styles
        'message.success': { 
          className: 'bg-green-50/90 dark:bg-green-900/20' 
        },
        'messageIcon.success': { 
          className: 'text-green-600 dark:text-green-400' 
        },
        'message.info': { 
          className: 'bg-blue-50/90 dark:bg-blue-900/20' 
        },
        'messageIcon.info': { 
          className: 'text-blue-600 dark:text-blue-400' 
        },
        'message.warn': { 
          className: 'bg-yellow-50/90 dark:bg-yellow-900/20' 
        },
        'messageIcon.warn': { 
          className: 'text-yellow-600 dark:text-yellow-400' 
        },
        'message.error': { 
          className: 'bg-red-50/90 dark:bg-red-900/20' 
        },
        'messageIcon.error': { 
          className: 'text-red-600 dark:text-red-400' 
        }
      }}
    />
  );
});

Toast.displayName = 'Toast';