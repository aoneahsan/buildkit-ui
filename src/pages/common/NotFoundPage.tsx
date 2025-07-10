import React from 'react';
import { Button } from '../../components/Button';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface NotFoundPageProps {
  onHome?: () => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  image?: React.ReactNode;
  className?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onHome,
  onBack,
  title,
  subtitle,
  showHomeButton = true,
  showBackButton = true,
  image,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'NotFoundPage' });

  React.useEffect(() => {
    trackEvent('404_page_view', {
      url: window.location.pathname,
      referrer: document.referrer,
    });
  }, [trackEvent]);

  const handleHomeClick = () => {
    trackEvent('404_home_click');
    onHome?.();
  };

  const handleBackClick = () => {
    trackEvent('404_back_click');
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="text-center">
        {/* Error Code */}
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
          404
        </h1>

        {/* Image or Icon */}
        {image ? (
          <div className="mb-8">{image}</div>
        ) : (
          <div className="mb-8">
            <i className="pi pi-exclamation-triangle text-6xl text-gray-400 dark:text-gray-600"></i>
          </div>
        )}

        {/* Title and Subtitle */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {title || t('errors.404.title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {subtitle || t('errors.404.subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showHomeButton && onHome && (
            <Button
              variant="primary"
              onClick={handleHomeClick}
              icon="pi pi-home"
              size="large"
            >
              {t('errors.404.goHome')}
            </Button>
          )}

          {showBackButton && (
            <Button
              variant="secondary"
              onClick={handleBackClick}
              icon="pi pi-arrow-left"
              size="large"
            >
              {t('errors.404.goBack')}
            </Button>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>{t('errors.404.helpText')}</p>
          <div className="mt-4 space-x-4">
            <a
              href="/help"
              className="text-buildkit-500 hover:text-buildkit-600 dark:text-buildkit-400 dark:hover:text-buildkit-300"
              onClick={() => trackEvent('404_help_click')}
            >
              {t('errors.404.helpCenter')}
            </a>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <a
              href="/contact"
              className="text-buildkit-500 hover:text-buildkit-600 dark:text-buildkit-400 dark:hover:text-buildkit-300"
              onClick={() => trackEvent('404_contact_click')}
            >
              {t('errors.404.contactSupport')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};