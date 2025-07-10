import React, { FormEvent } from 'react';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (data: any) => void | Promise<void>;
  trackingMetadata?: Record<string, any>;
  variant?: 'default' | 'inline' | 'floating';
  loading?: boolean;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className,
  trackingMetadata,
  variant = 'default',
  loading = false,
  validationMode = 'onBlur',
  ...props
}) => {
  const { trackEvent } = useTracking({ 
    componentType: 'Form',
    componentProps: trackingMetadata 
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    trackEvent('form_submit_attempt', { 
      variant,
      fields: Object.keys(data),
      ...trackingMetadata 
    });

    try {
      await onSubmit?.(data);
      trackEvent('form_submit_success', { 
        variant,
        ...trackingMetadata 
      });
    } catch (error) {
      trackEvent('form_submit_error', { 
        variant,
        error: (error as Error).message,
        ...trackingMetadata 
      });
      throw error;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'inline':
        return 'flex flex-wrap items-end gap-4';
      case 'floating':
        return 'space-y-6';
      default:
        return 'space-y-4';
    }
  };

  const formClasses = cn(
    'buildkit-form',
    getVariantClasses(),
    loading && 'opacity-70 pointer-events-none',
    className
  );

  return (
    <form
      {...props}
      className={formClasses}
      onSubmit={handleSubmit}
      noValidate
      data-validation-mode={validationMode}
    >
      {children}
    </form>
  );
};