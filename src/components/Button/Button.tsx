import React, { forwardRef, useRef } from 'react';
import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from 'primereact/button';
import { useButton } from 'react-aria';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTracking } from '../base/useTracking';
import type { ComponentTrackingProps } from '../../tracking/types';

export interface ButtonProps extends Omit<PrimeButtonProps, 'ref' | 'size'>, ComponentTrackingProps {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost';
  
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Loading state with custom text
   */
  loadingText?: string;
  
  /**
   * Accessibility label
   */
  ariaLabel?: string;
  
  /**
   * Track specific events
   */
  trackEvents?: boolean;
}

const variantClasses = {
  primary: 'bg-buildkit-500 hover:bg-buildkit-600 text-white border-buildkit-500',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500',
  success: 'bg-green-500 hover:bg-green-600 text-white border-green-500',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500',
  danger: 'bg-red-500 hover:bg-red-600 text-white border-red-500',
  info: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
};

const sizeClasses = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    // Tracking props
    trackingId,
    trackingEnabled = true,
    trackingEventPrefix,
    trackingMetadata,
    onTrackingEvent,
    trackEvents = true,
    
    // Button props
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loadingText,
    ariaLabel,
    className,
    onClick,
    onFocus,
    onBlur,
    disabled,
    loading,
    children,
    label,
    icon,
    iconPos = 'left',
    
    ...restProps
  } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const combinedRef = ref || buttonRef;

  // Initialize tracking
  const {
    componentId,
    trackEvent,
    trackInteraction,
    createClickHandler,
  } = useTracking({
    componentType: 'Button',
    trackingId,
    trackingEnabled: trackingEnabled && trackEvents,
    onTrackingEvent,
    props: {
      variant,
      size,
      disabled,
      loading,
      label: label || (typeof children === 'string' ? children : undefined),
    },
  });

  // React Aria for accessibility
  const { buttonProps, isPressed } = useButton(
    {
      ...restProps,
      onPress: onClick ? () => onClick({} as any) : undefined,
      isDisabled: disabled || loading,
      'aria-label': ariaLabel || label || (typeof children === 'string' ? children as string : undefined),
    },
    buttonRef as any
  );

  // Create tracked handlers
  const handleClick = createClickHandler(
    onClick || (() => {}),
    'button_click',
    {
      variant,
      label: label || (typeof children === 'string' ? children : undefined),
      ...trackingMetadata,
    }
  );

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    trackInteraction('focus', 'button', { variant });
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    trackInteraction('blur', 'button', { variant });
    onBlur?.(e);
  };

  // Build class names
  const buttonClasses = twMerge(
    clsx(
      'buildkit-button buildkit-tracking-enabled',
      'inline-flex items-center justify-center',
      'font-medium rounded-md',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      {
        'w-full': fullWidth,
        'opacity-75 cursor-wait': loading,
        'ring-2 ring-offset-2': isPressed,
      },
      className
    )
  );

  // Determine button content
  const buttonContent = loading && loadingText ? loadingText : (label || children);

  return (
    <PrimeButton
      {...restProps}
      {...buttonProps}
      ref={combinedRef as any}
      className={buttonClasses}
      onClick={handleClick as any}
      onFocus={handleFocus as any}
      onBlur={handleBlur as any}
      disabled={disabled || loading}
      loading={loading}
      label={typeof buttonContent === 'string' ? buttonContent : undefined}
      icon={icon}
      iconPos={iconPos}
      data-tracking-id={componentId}
      data-variant={variant}
      data-size={size}
    >
      {typeof buttonContent !== 'string' ? buttonContent : undefined}
    </PrimeButton>
  );
});

Button.displayName = 'Button';