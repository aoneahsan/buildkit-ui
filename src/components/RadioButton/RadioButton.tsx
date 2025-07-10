import React from 'react';
import { RadioButton as PrimeRadioButton } from 'primereact/radiobutton';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';
import { useAriaLabel } from '../../hooks/useAriaLabel';

export interface RadioButtonProps extends Omit<React.ComponentProps<typeof PrimeRadioButton>, 'onChange' | 'checked'> {
  label?: string;
  value: any;
  checked?: boolean;
  onChange?: (value: any) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  trackingMetadata?: Record<string, any>;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  checked = false,
  onChange,
  error,
  helperText,
  required,
  disabled,
  className,
  trackingMetadata,
  inputId,
  name,
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'RadioButton',
    componentProps: trackingMetadata 
  });
  const ariaProps = useAriaLabel({ label, required });

  const handleChange = (e: any) => {
    trackEvent('radio_change', { 
      value,
      label,
      name,
      ...trackingMetadata 
    });
    onChange?.(value);
  };

  const radioId = inputId || `radio-${Math.random().toString(36).substr(2, 9)}`;

  const radioClasses = cn(
    'buildkit-radio',
    error && 'p-invalid',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const containerClasses = cn(
    'buildkit-radio-container',
    'flex items-start'
  );

  return (
    <div className={containerClasses}>
      <PrimeRadioButton
        {...props}
        {...ariaProps}
        inputId={radioId}
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={radioClasses}
        pt={{
          root: { 
            className: 'inline-flex items-center' 
          },
          input: { 
            className: cn(
              'rounded-full',
              'border-2',
              'w-5 h-5',
              'transition-all duration-200',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              error 
                ? 'border-red-500 focus:ring-red-500' 
                : checked
                  ? 'border-buildkit-500 bg-buildkit-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
              !disabled && !error && 'hover:border-buildkit-400 focus:ring-2 focus:ring-buildkit-500'
            )
          },
          icon: { 
            className: 'rounded-full bg-white w-2 h-2' 
          }
        }}
      />
      
      {label && (
        <label 
          htmlFor={radioId}
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
    </div>
  );
};

// RadioGroup component for managing multiple radio buttons
export interface RadioGroupProps {
  name: string;
  value?: any;
  onChange?: (value: any) => void;
  options: Array<{
    label: string;
    value: any;
    disabled?: boolean;
  }>;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  trackingMetadata?: Record<string, any>;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  error,
  helperText,
  required,
  disabled,
  orientation = 'vertical',
  trackingMetadata
}) => {
  const groupClasses = cn(
    'buildkit-radio-group',
    orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'
  );

  return (
    <div>
      <div className={groupClasses}>
        {options.map((option) => (
          <RadioButton
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={onChange}
            disabled={disabled || option.disabled}
            required={required}
            trackingMetadata={{ ...trackingMetadata, group: name }}
          />
        ))}
      </div>
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};