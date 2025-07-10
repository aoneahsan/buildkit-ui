import React from 'react';
import { Card as PrimeCard } from 'primereact/card';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';

export interface CardProps extends React.ComponentProps<typeof PrimeCard> {
  trackingMetadata?: Record<string, any>;
  variant?: 'default' | 'outlined' | 'elevated';
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const Card: React.FC<CardProps> = ({
  className,
  trackingMetadata,
  variant = 'default',
  interactive = false,
  onClick,
  header,
  footer,
  title,
  subTitle,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'Card',
    props: trackingMetadata 
  });

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      trackEvent('card_click', { 
        title,
        variant,
        ...trackingMetadata 
      });
      onClick(e);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'border border-gray-200 dark:border-gray-700 shadow-none';
      case 'elevated':
        return 'shadow-lg hover:shadow-xl transition-shadow duration-200';
      default:
        return 'shadow-sm';
    }
  };

  const cardClasses = cn(
    'buildkit-card',
    'bg-white dark:bg-gray-800',
    'rounded-lg',
    getVariantClasses(),
    interactive && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
    className
  );

  const headerElement = header && (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      {typeof header === 'string' ? (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{header}</h3>
      ) : (
        <>{header}</>
      )}
    </div>
  );

  const footerElement = footer && (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <>{footer}</>
    </div>
  );

  const titleElement = title && (
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      <>{title}</>
    </h3>
  );

  const subTitleElement = subTitle && (
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      <>{subTitle}</>
    </p>
  );

  return (
    <PrimeCard
      {...props}
      className={cardClasses}
      header={headerElement}
      footer={footerElement}
      title={titleElement}
      subTitle={subTitleElement}
      onClick={interactive ? handleClick : undefined}
      pt={{
        root: { className: cardClasses },
        body: { className: 'p-6' },
        content: { className: 'space-y-4' }
      }}
    >
      {children}
    </PrimeCard>
  );
};