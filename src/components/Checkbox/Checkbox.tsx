import React from 'react';
import { Checkbox as PrimeCheckbox } from 'primereact/checkbox';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';
import { useAriaLabel } from '../../hooks/useAriaLabel';

export interface CheckboxProps extends Omit<React.ComponentProps<typeof PrimeCheckbox>, 'onChange' | 'checked'> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  trackingMetadata?: Record<string, any>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  error,
  helperText,
  required,
  disabled,
  className,
  trackingMetadata,
  inputId,
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'Checkbox',
    componentProps: trackingMetadata 
  });
  const ariaProps = useAriaLabel({ label, required });

  const handleChange = (e: any) => {
    const isChecked = e.checked;
    trackEvent('checkbox_change', { 
      checked: isChecked,
      label,
      ...trackingMetadata 
    });
    onChange?.(isChecked);
  };

  const checkboxId = inputId || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const checkboxClasses = cn(
    'buildkit-checkbox',
    error && 'p-invalid',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const containerClasses = cn(
    'buildkit-checkbox-container',
    'flex items-start'
  );

  return (
    <div className={containerClasses}>
      <PrimeCheckbox
        {...props}
        {...ariaProps}
        inputId={checkboxId}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={checkboxClasses}
        pt={{
          root: { 
            className: 'inline-flex items-center' 
          },
          input: { 
            className: cn(
              'rounded',
              'border-2',
              'w-5 h-5',
              'transition-all duration-200',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              error 
                ? 'border-red-500 focus:ring-red-500' 
                : checked
                  ? 'border-buildkit-500 bg-buildkit-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
              !disabled && !error && 'hover:border-buildkit-400 focus:ring-2 focus:ring-buildkit-500'
            )
          },
          icon: { 
            className: 'text-white text-sm' 
          }
        }}
      />
      
      {label && (
        <label 
          htmlFor={checkboxId}
          className={cn(
            'ml-2 text-sm',
            disabled 
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-300 cursor-pointer'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="ml-7">
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};