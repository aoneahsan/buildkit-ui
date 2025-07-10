import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface OfflinePageProps {
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  showRetryButton?: boolean;
  autoRetry?: boolean;
  autoRetryInterval?: number;
  image?: React.ReactNode;
  className?: string;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({
  onRetry,
  title,
  subtitle,
  showRetryButton = true,
  autoRetry = true,
  autoRetryInterval = 5000,
  image,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'OfflinePage' });
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  useEffect(() => {
    trackEvent('offline_page_view');

    // Set up online event listener
    const handleOnline = () => {
      trackEvent('connection_restored');
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);

    // Set up auto-retry
    let retryInterval: NodeJS.Timeout | null = null;
    if (autoRetry) {
      retryInterval = setInterval(() => {
        checkConnection();
      }, autoRetryInterval);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, [autoRetry, autoRetryInterval, trackEvent]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      
      if (response.ok) {
        trackEvent('offline_connection_restored');
        if (onRetry) {
          onRetry();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      // Still offline
      setLastCheckTime(Date.now());
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    trackEvent('offline_retry_click');

    try {
      await checkConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  const getTimeSinceLastCheck = () => {
    const seconds = Math.floor((Date.now() - lastCheckTime) / 1000);
    if (seconds < 60) return t('errors.offline.justNow');
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return t('errors.offline.oneMinuteAgo');
    return t('errors.offline.minutesAgo', { minutes });
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="text-center max-w-md">
        {/* Image or Icon */}
        {image ? (
          <div className="mb-8">{image}</div>
        ) : (
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800">
              <i className="pi pi-wifi text-4xl text-gray-400 dark:text-gray-600"></i>
            </div>
          </div>
        )}

        {/* Title and Subtitle */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {title || t('errors.offline.title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {subtitle || t('errors.offline.subtitle')}
        </p>

        {/* Connection Status */}
        <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <i className="pi pi-exclamation-circle"></i>
            <span className="text-sm">
              {t('errors.offline.noConnection')}
            </span>
          </div>
          {autoRetry && (
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              {t('errors.offline.autoRetrying')}
            </p>
          )}
        </div>

        {/* Retry Button */}
        {showRetryButton && (
          <Button
            variant="primary"
            onClick={handleRetry}
            loading={isRetrying}
            loadingText={t('errors.offline.checking')}
            icon="pi pi-refresh"
            size="large"
            fullWidth
          >
            {t('errors.offline.tryAgain')}
          </Button>
        )}

        {/* What You Can Do */}
        <div className="mt-12 text-left">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('errors.offline.whatYouCanDo')}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2 flex-shrink-0"></i>
              <span>{t('errors.offline.checkConnection')}</span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2 flex-shrink-0"></i>
              <span>{t('errors.offline.checkCables')}</span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2 flex-shrink-0"></i>
              <span>{t('errors.offline.checkRouter')}</span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2 flex-shrink-0"></i>
              <span>{t('errors.offline.checkFirewall')}</span>
            </li>
          </ul>
        </div>

        {/* Last Check Time */}
        {autoRetry && (
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            {t('errors.offline.lastChecked')}: {getTimeSinceLastCheck()}
          </p>
        )}
      </div>
    </div>
  );
};