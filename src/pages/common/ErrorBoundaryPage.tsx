import React from 'react';
import { Button } from '../../components/Button';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface ErrorBoundaryPageProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onReset?: () => void;
  onReport?: (error: Error, errorInfo?: React.ErrorInfo) => void;
  title?: string;
  subtitle?: string;
  showDetails?: boolean;
  showReportButton?: boolean;
  image?: React.ReactNode;
  className?: string;
}

export const ErrorBoundaryPage: React.FC<ErrorBoundaryPageProps> = ({
  error,
  errorInfo,
  onReset,
  onReport,
  title,
  subtitle,
  showDetails = process.env.NODE_ENV === 'development',
  showReportButton = true,
  image,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'ErrorBoundaryPage' });
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);
  const [reportSent, setReportSent] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      trackEvent('error_boundary_triggered', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
      });
    }
  }, [error, errorInfo, trackEvent]);

  const handleReset = () => {
    trackEvent('error_boundary_reset');
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleReport = async () => {
    if (!error) return;
    
    trackEvent('error_boundary_report');
    try {
      await onReport?.(error, errorInfo);
      setReportSent(true);
      setTimeout(() => setReportSent(false), 3000);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  const toggleDetails = () => {
    setDetailsExpanded(!detailsExpanded);
    trackEvent('error_boundary_toggle_details', { expanded: !detailsExpanded });
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          {/* Image or Icon */}
          {image ? (
            <div className="mb-8">{image}</div>
          ) : (
            <div className="mb-8">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20">
                <i className="pi pi-times-circle text-4xl text-red-600 dark:text-red-400"></i>
              </div>
            </div>
          )}

          {/* Title and Subtitle */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title || t('errors.boundary.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {subtitle || t('errors.boundary.subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="primary"
            onClick={handleReset}
            icon="pi pi-refresh"
            size="large"
          >
            {t('errors.boundary.tryAgain')}
          </Button>

          {showReportButton && onReport && (
            <Button
              variant="secondary"
              onClick={handleReport}
              icon={reportSent ? "pi pi-check" : "pi pi-flag"}
              size="large"
              disabled={reportSent}
            >
              {reportSent ? t('errors.boundary.reported') : t('errors.boundary.report')}
            </Button>
          )}
        </div>

        {/* Error Details */}
        {showDetails && error && (
          <div className="mt-8">
            <button
              onClick={toggleDetails}
              className="flex items-center justify-center w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <i className={cn(
                "pi mr-2",
                detailsExpanded ? "pi-chevron-up" : "pi-chevron-down"
              )}></i>
              {t('errors.boundary.technicalDetails')}
            </button>

            {detailsExpanded && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
                <div className="space-y-4">
                  {/* Error Message */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('errors.boundary.errorMessage')}
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                      {error.message}
                    </p>
                  </div>

                  {/* Stack Trace */}
                  {error.stack && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('errors.boundary.stackTrace')}
                      </h4>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap break-words">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('errors.boundary.componentStack')}
                      </h4>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap break-words">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('errors.boundary.persistentError')}</p>
          <a
            href="/support"
            className="text-buildkit-500 hover:text-buildkit-600 dark:text-buildkit-400 dark:hover:text-buildkit-300"
            onClick={() => trackEvent('error_boundary_support_click')}
          >
            {t('errors.boundary.contactSupport')}
          </a>
        </div>
      </div>
    </div>
  );
};