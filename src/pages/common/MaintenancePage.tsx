import React, { useState, useEffect } from 'react';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface MaintenancePageProps {
  title?: string;
  subtitle?: string;
  estimatedTime?: Date;
  showProgress?: boolean;
  progress?: number;
  contactEmail?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    status?: string;
  };
  image?: React.ReactNode;
  className?: string;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  title,
  subtitle,
  estimatedTime,
  showProgress = false,
  progress = 0,
  contactEmail,
  socialLinks,
  image,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'MaintenancePage' });
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    trackEvent('maintenance_page_view');
  }, [trackEvent]);

  useEffect(() => {
    if (!estimatedTime) return undefined;

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = estimatedTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(t('errors.maintenance.checkingStatus'));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeRemaining(t('errors.maintenance.hoursRemaining', { hours, minutes }));
      } else {
        setTimeRemaining(t('errors.maintenance.minutesRemaining', { minutes }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedTime, t]);

  const handleSocialClick = (platform: string) => {
    trackEvent('maintenance_social_click', { platform });
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="max-w-2xl w-full text-center">
        {/* Image or Icon */}
        {image ? (
          <div className="mb-8">{image}</div>
        ) : (
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <i className="pi pi-wrench text-4xl text-yellow-600 dark:text-yellow-400"></i>
            </div>
          </div>
        )}

        {/* Title and Subtitle */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title || t('errors.maintenance.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {subtitle || t('errors.maintenance.subtitle')}
        </p>

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">
              {t('errors.maintenance.estimatedCompletion')}
            </p>
            <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
              {timeRemaining || estimatedTime.toLocaleString()}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{t('errors.maintenance.progress')}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-buildkit-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-buildkit-500 to-buildkit-600 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* What We're Doing */}
        <div className="mb-12 text-left max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            {t('errors.maintenance.whatWereDoing')}
          </h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <i className="pi pi-server mt-0.5 mr-3 text-buildkit-500"></i>
              <span>{t('errors.maintenance.task1')}</span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-shield mt-0.5 mr-3 text-buildkit-500"></i>
              <span>{t('errors.maintenance.task2')}</span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-bolt mt-0.5 mr-3 text-buildkit-500"></i>
              <span>{t('errors.maintenance.task3')}</span>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('errors.maintenance.followUpdates')}
            </p>
            <div className="flex justify-center space-x-4">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('twitter')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <i className="pi pi-twitter text-xl text-gray-600 dark:text-gray-400"></i>
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('facebook')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <i className="pi pi-facebook text-xl text-gray-600 dark:text-gray-400"></i>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('linkedin')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <i className="pi pi-linkedin text-xl text-gray-600 dark:text-gray-400"></i>
                </a>
              )}
              {socialLinks.status && (
                <a
                  href={socialLinks.status}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('status')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <i className="pi pi-info-circle text-xl text-gray-600 dark:text-gray-400"></i>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        {contactEmail && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              {t('errors.maintenance.questions')}{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="text-buildkit-500 hover:text-buildkit-600 dark:text-buildkit-400 dark:hover:text-buildkit-300"
                onClick={() => trackEvent('maintenance_contact_click')}
              >
                {contactEmail}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};