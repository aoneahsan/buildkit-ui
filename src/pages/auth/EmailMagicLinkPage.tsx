import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface EmailMagicLinkPageProps {
  onSendLink?: (email: string) => Promise<void>;
  onBack?: () => void;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EmailMagicLinkPage: React.FC<EmailMagicLinkPageProps> = ({
  onSendLink,
  onBack,
  logo,
  title,
  subtitle,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'EmailMagicLinkPage' });
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError(t('auth.errors.emailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.errors.emailInvalid'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail()) {
      trackEvent('magic_link_validation_failed');
      return;
    }

    setLoading(true);
    trackEvent('magic_link_request', { email: email.split('@')[1] });

    try {
      await onSendLink?.(email);
      setLinkSent(true);
      trackEvent('magic_link_sent');
    } catch (error) {
      trackEvent('magic_link_error', { error: (error as Error).message });
      setError(t('auth.errors.magicLinkFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    trackEvent('magic_link_resend');

    try {
      await onSendLink?.(email);
      trackEvent('magic_link_resent');
    } catch (error) {
      trackEvent('magic_link_resend_error', { error: (error as Error).message });
      setError(t('auth.errors.magicLinkFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-buildkit-100 dark:bg-buildkit-900/40 mb-4">
              <i className="pi pi-envelope text-buildkit-600 dark:text-buildkit-400 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.magicLink.checkEmail')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              {t('auth.magicLink.sentTo', { email })}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('auth.magicLink.instructions')}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {t('auth.magicLink.didntReceive')}
            </p>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={handleResend}
              loading={loading}
              loadingText={t('auth.magicLink.resending')}
            >
              {t('auth.magicLink.resend')}
            </Button>

            {onBack && (
              <Button
                variant="ghost"
                fullWidth
                onClick={onBack}
              >
                {t('auth.magicLink.tryAnotherMethod')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          {logo && <div className="flex justify-center mb-4">{logo}</div>}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title || t('auth.magicLink.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {subtitle || t('auth.magicLink.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label={t('auth.fields.email')}
            placeholder={t('auth.placeholders.email')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error}
            required
            fullWidth
            helperText={t('auth.magicLink.helper')}
            trackingMetadata={{ field: 'email' }}
          />

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              loadingText={t('auth.magicLink.sending')}
              icon="pi pi-send"
            >
              {t('auth.magicLink.sendLink')}
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={onBack}
              >
                {t('auth.magicLink.usePassword')}
              </Button>
            )}
          </div>
        </form>

        {/* Benefits */}
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.magicLink.benefits.title')}
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2"></i>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.magicLink.benefits.noPassword')}
              </span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2"></i>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.magicLink.benefits.secure')}
              </span>
            </li>
            <li className="flex items-start">
              <i className="pi pi-check-circle text-green-500 mt-0.5 mr-2"></i>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.magicLink.benefits.quick')}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};