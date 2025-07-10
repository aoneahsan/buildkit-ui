import React from 'react';
import { Dropdown as PrimeDropdown } from 'primereact/dropdown';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';
import { useAriaLabel } from '../../hooks/useAriaLabel';

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
  group?: string;
}

export interface DropdownProps extends Omit<React.ComponentProps<typeof PrimeDropdown>, 'onChange' | 'options'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  options: DropdownOption[];
  onChange?: (value: any) => void;
  trackingMetadata?: Record<string, any>;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  className,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  trackingMetadata,
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'Dropdown',
    componentProps: trackingMetadata 
  });
  const ariaProps = useAriaLabel({ label, required });

  const handleChange = (e: any) => {
    const selectedValue = e.value;
    trackEvent('dropdown_change', { 
      value: selectedValue,
      label,
      ...trackingMetadata 
    });
    onChange?.(selectedValue);
  };

  const dropdownClasses = cn(
    'buildkit-dropdown',
    fullWidth && 'w-full',
    error && 'p-invalid',
    className
  );

  const containerClasses = cn(
    'buildkit-dropdown-container',
    fullWidth && 'w-full'
  );

  const itemTemplate = (option: DropdownOption) => {
    return (
      <div className="flex items-center gap-2">
        {option.icon && <i className={option.icon}></i>}
        <span>{option.label}</span>
      </div>
    );
  };

  const selectedItemTemplate = (option: DropdownOption) => {
    if (!option) return placeholder || 'Select an option';
    return itemTemplate(option);
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <PrimeDropdown
        {...props}
        {...ariaProps}
        value={value}
        options={options}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={dropdownClasses}
        itemTemplate={itemTemplate}
        valueTemplate={selectedItemTemplate}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        optionGroupLabel="group"
        optionGroupChildren="items"
        showClear={!required}
        filter
        filterPlaceholder="Search..."
        emptyFilterMessage="No results found"
        emptyMessage="No options available"
        pt={{
          root: { 
            className: cn(
              'w-full',
              disabled && 'opacity-50 cursor-not-allowed'
            )
          },
          input: { 
            className: cn(
              'w-full px-3 py-2',
              'border rounded-lg',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'placeholder-gray-400 dark:placeholder-gray-500',
              error 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-buildkit-500',
              'focus:outline-none focus:ring-2',
              'transition-colors duration-200'
            )
          },
          trigger: { 
            className: 'flex items-center pr-3 text-gray-400' 
          },
          panel: { 
            className: cn(
              'mt-1 rounded-lg shadow-lg',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'max-h-60 overflow-auto'
            )
          },
          list: { className: 'py-1' },
          item: { 
            className: cn(
              'px-3 py-2',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'cursor-pointer transition-colors'
            )
          },
          emptyMessage: { 
            className: 'px-3 py-2 text-gray-500 dark:text-gray-400 text-center' 
          },
          filterContainer: { className: 'p-2' },
          filterInput: { 
            className: cn(
              'w-full px-3 py-2',
              'border rounded-lg',
              'bg-gray-50 dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'focus:outline-none focus:ring-2 focus:ring-buildkit-500',
              'text-sm'
            )
          }
        }}
      />
      
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
  );
};