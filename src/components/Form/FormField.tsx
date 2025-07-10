import React from 'react';
import { cn } from '../../utils';

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required,
  className
}) => {
  const fieldClasses = cn(
    'buildkit-form-field',
    className
  );

  return (
    <div className={fieldClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
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