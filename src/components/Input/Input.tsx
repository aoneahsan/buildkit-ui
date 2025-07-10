import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { InputText, InputTextProps } from 'primereact/inputtext';
import { useTextField } from 'react-aria';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTracking } from '../base/useTracking';
import type { ComponentTrackingProps } from '../../tracking/types';

export interface InputProps extends Omit<InputTextProps, 'ref' | 'onInput'>, ComponentTrackingProps {
  /**
   * Input label
   */
  label?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Required field
   */
  required?: boolean;
  
  /**
   * Input size
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Full width input
   */
  fullWidth?: boolean;
  
  /**
   * Show character count
   */
  showCount?: boolean;
  
  /**
   * Track input events
   */
  trackEvents?: boolean;
  
  /**
   * Debounce delay for change tracking (ms)
   */
  trackingDebounce?: number;
}

const sizeClasses = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-5 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    // Tracking props
    trackingId,
    trackingEnabled = true,
    trackingEventPrefix,
    trackingMetadata,
    onTrackingEvent,
    trackEvents = true,
    trackingDebounce = 500,
    
    // Input props
    id,
    label,
    helperText,
    error,
    required,
    size = 'medium',
    fullWidth = false,
    showCount = false,
    className,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    readOnly,
    maxLength,
    placeholder,
    type = 'text',
    
    ...restProps
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const combinedRef = ref || inputRef;
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize tracking
  const {
    componentId,
    trackEvent,
    trackInteraction,
    startMeasure,
    endMeasure,
  } = useTracking({
    componentType: 'Input',
    trackingId,
    trackingEnabled: trackingEnabled && trackEvents,
    onTrackingEvent,
    props: {
      type,
      size,
      required,
      disabled,
      readOnly,
      hasError: !!error,
      label,
    },
  });

  // React Aria for accessibility
  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
    {
      label,
      description: helperText,
      errorMessage: error,
      isRequired: required,
      isDisabled: disabled,
      isReadOnly: readOnly,
      inputElementType: type === 'textarea' ? 'textarea' : 'input',
      'aria-label': label,
      'aria-describedby': helperText ? `${componentId}-helper` : undefined,
      'aria-errormessage': error ? `${componentId}-error` : undefined,
    },
    inputRef as any
  );

  // Update internal value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Track value changes with debouncing
  const trackValueChange = (newValue: string) => {
    if (!trackingEnabled || !trackEvents) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      trackEvent('input_change', {
        length: newValue.length,
        isEmpty: newValue.length === 0,
        type,
        hasError: !!error,
        ...trackingMetadata,
      });
    }, trackingDebounce);
  };

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    trackValueChange(newValue);
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    startMeasure('input_focus_duration');
    trackInteraction('focus', 'input', { type, label });
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const focusDuration = endMeasure('input_focus_duration');
    trackInteraction('blur', 'input', {
      type,
      label,
      focusDuration,
      finalLength: internalValue.toString().length,
      isEmpty: internalValue.toString().length === 0,
    });
    onBlur?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      trackInteraction('submit', 'input_enter', { type, label });
    }
    onKeyDown?.(e);
  };

  // Build class names
  const inputClasses = twMerge(
    clsx(
      'buildkit-input buildkit-tracking-enabled',
      'block rounded-md shadow-sm',
      'border-gray-300 focus:border-buildkit-500 focus:ring-buildkit-500',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      'transition-colors duration-200',
      sizeClasses[size],
      {
        'w-full': fullWidth,
        'border-red-500 focus:border-red-500 focus:ring-red-500': !!error,
        'pr-10': showCount && maxLength,
      },
      className
    )
  );

  const labelClasses = clsx(
    'block text-sm font-medium text-gray-700 mb-1',
    {
      'text-red-600': !!error,
    }
  );

  const helperClasses = clsx(
    'mt-1 text-sm',
    {
      'text-gray-500': !error,
      'text-red-600': !!error,
    }
  );

  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      {label && (
        <label
          {...labelProps}
          htmlFor={id || componentId}
          className={labelClasses}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <InputText
          {...restProps}
          ref={combinedRef as any}
          id={id || componentId}
          className={inputClasses}
          value={String(internalValue || '')}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          placeholder={placeholder}
          type={type}
          data-tracking-id={componentId}
          data-has-error={!!error}
          aria-invalid={!!error}
        />
        
        {showCount && maxLength && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className={clsx(
              'text-sm',
              {
                'text-gray-500': internalValue.toString().length < maxLength,
                'text-red-500': internalValue.toString().length >= maxLength,
              }
            )}>
              {internalValue.toString().length}/{maxLength}
            </span>
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p
          {...(error ? errorMessageProps : descriptionProps)}
          id={error ? `${componentId}-error` : `${componentId}-helper`}
          className={helperClasses}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';