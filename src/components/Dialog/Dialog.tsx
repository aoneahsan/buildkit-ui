import React, { useEffect } from 'react';
import { Dialog as PrimeDialog } from 'primereact/dialog';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';

export interface DialogProps extends Omit<React.ComponentProps<typeof PrimeDialog>, 'onShow' | 'onHide'> {
  trackingMetadata?: Record<string, any>;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  variant?: 'default' | 'alert' | 'confirm';
  onShow?: () => void;
  onHide?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  className,
  trackingMetadata,
  size = 'medium',
  variant = 'default',
  visible,
  onShow,
  onHide,
  header,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'Dialog',
    props: trackingMetadata 
  });

  useEffect(() => {
    if (visible) {
      trackEvent('dialog_open', { 
        header: typeof header === 'string' ? header : 'custom',
        size,
        variant,
        ...trackingMetadata 
      });
      onShow?.();
    } else {
      trackEvent('dialog_close', { 
        header: typeof header === 'string' ? header : 'custom',
        ...trackingMetadata 
      });
    }
  }, [visible, header, size, variant, trackingMetadata, trackEvent, onShow]);

  const handleHide = () => {
    trackEvent('dialog_dismiss', { 
      header: typeof header === 'string' ? header : 'custom',
      ...trackingMetadata 
    });
    onHide?.();
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: '30vw', minWidth: '300px' };
      case 'large':
        return { width: '80vw', minWidth: '600px' };
      case 'fullscreen':
        return { width: '95vw', height: '95vh' };
      default:
        return { width: '50vw', minWidth: '450px' };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'alert':
        return 'buildkit-dialog-alert';
      case 'confirm':
        return 'buildkit-dialog-confirm';
      default:
        return '';
    }
  };

  const dialogClasses = cn(
    'buildkit-dialog',
    getVariantClasses(),
    className
  );

  return (
    <PrimeDialog
      {...props}
      visible={visible}
      onHide={handleHide}
      header={header}
      className={dialogClasses}
      style={getSizeStyle()}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      pt={{
        root: { 
          className: cn(
            'rounded-lg shadow-2xl',
            'bg-white dark:bg-gray-800'
          )
        },
        header: { 
          className: cn(
            'px-6 py-4',
            'border-b border-gray-200 dark:border-gray-700',
            'text-xl font-semibold text-gray-900 dark:text-white'
          )
        },
        headerTitle: { className: 'flex-1' },
        headerIcons: { className: 'flex items-center gap-2' },
        closeButton: { 
          className: cn(
            'w-8 h-8 rounded-full',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors duration-200',
            'flex items-center justify-center'
          )
        },
        closeButtonIcon: { className: 'text-gray-500 dark:text-gray-400' },
        content: { 
          className: cn(
            'px-6 py-4',
            size === 'fullscreen' && 'h-full overflow-auto'
          )
        },
        mask: { 
          className: 'bg-black/50 backdrop-blur-sm' 
        }
      }}
    >
      {children}
    </PrimeDialog>
  );
};