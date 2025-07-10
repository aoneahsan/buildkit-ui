import React from 'react';
import { cn } from '../../utils';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  const sectionClasses = cn(
    'buildkit-form-section',
    'pb-6 mb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0 last:mb-0',
    className
  );

  return (
    <div className={sectionClasses}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};