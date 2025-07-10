import React, { useEffect } from 'react';
import { ProgressBar as PrimeProgressBar } from 'primereact/progressbar';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';

export interface ProgressBarProps extends React.ComponentProps<typeof PrimeProgressBar> {
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  trackingMetadata?: Record<string, any>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  label,
  variant = 'default',
  size = 'medium',
  showValue = true,
  className,
  trackingMetadata,
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'ProgressBar',
    componentProps: trackingMetadata 
  });

  useEffect(() => {
    if (value === 100) {
      trackEvent('progress_complete', { 
        label,
        variant,
        ...trackingMetadata 
      });
    }
  }, [value, label, variant, trackingMetadata, trackEvent]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-2';
      case 'large':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-buildkit-500';
    }
  };

  const progressClasses = cn(
    'buildkit-progress',
    getSizeClasses(),
    className
  );

  const displayValueTemplate = () => {
    if (!showValue) return null;
    return (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {value}%
      </span>
    );
  };

  return (
    <div className="buildkit-progress-container">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {displayValueTemplate()}
        </div>
      )}
      
      <PrimeProgressBar
        {...props}
        value={value}
        showValue={false}
        className={progressClasses}
        pt={{
          root: { 
            className: cn(
              'overflow-hidden',
              'bg-gray-200 dark:bg-gray-700',
              'rounded-full',
              getSizeClasses()
            )
          },
          value: { 
            className: cn(
              'h-full',
              'rounded-full',
              'transition-all duration-500 ease-out',
              getVariantColor(),
              'relative overflow-hidden'
            ),
            style: { width: `${value}%` }
          }
        }}
      />
      
      {!label && showValue && (
        <div className="text-center mt-2">
          {displayValueTemplate()}
        </div>
      )}
    </div>
  );
};