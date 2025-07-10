import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface ForgotPasswordPageProps {
  onSubmit?: (email: string) => Promise<void>;
  onBack?: () => void;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onSubmit,
  onBack,
  logo,
  title,
  subtitle,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'ForgotPasswordPage' });
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      trackEvent('forgot_password_validation_failed');
      return;
    }

    setLoading(true);
    trackEvent('forgot_password_submit', { email: email.split('@')[1] }); // Only track domain

    try {
      await onSubmit?.(email);
      setSubmitted(true);
      trackEvent('forgot_password_success');
    } catch (error) {
      trackEvent('forgot_password_error', { error: (error as Error).message });
      setError(t('auth.errors.forgotPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
              <i className="pi pi-check text-green-600 dark:text-green-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('auth.forgotPassword.emailSent')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.forgotPassword.checkEmail', { email })}
            </p>
            <Button
              variant="primary"
              onClick={onBack}
              fullWidth
            >
              {t('auth.forgotPassword.backToLogin')}
            </Button>
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
            {title || t('auth.forgotPassword.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {subtitle || t('auth.forgotPassword.subtitle')}
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
            trackingMetadata={{ field: 'email' }}
          />

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              loadingText={t('auth.forgotPassword.sending')}
            >
              {t('auth.forgotPassword.sendResetLink')}
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={onBack}
              >
                {t('auth.forgotPassword.backToLogin')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};