import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface LoginPageProps {
  onLogin?: (method: string, credentials?: any) => Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  providers?: {
    email?: boolean;
    google?: boolean;
    apple?: boolean;
    microsoft?: boolean;
    facebook?: boolean;
    github?: boolean;
    slack?: boolean;
    linkedin?: boolean;
    biometric?: boolean;
  };
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onForgotPassword,
  onSignUp,
  providers = { email: true, google: true, apple: true },
  logo,
  title,
  subtitle,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'LoginPage' });
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!credentials.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    
    if (!credentials.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      trackEvent('login_validation_failed', { errors: Object.keys(errors) });
      return;
    }

    setLoading(true);
    trackEvent('login_attempt', { method: 'email' });

    try {
      await onLogin?.('email', credentials);
      trackEvent('login_success', { method: 'email' });
    } catch (error) {
      trackEvent('login_error', { 
        method: 'email', 
        error: (error as Error).message 
      });
      setErrors({ form: t('auth.errors.loginFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    trackEvent('login_attempt', { method: provider });

    try {
      await onLogin?.(provider);
      trackEvent('login_success', { method: provider });
    } catch (error) {
      trackEvent('login_error', { 
        method: provider, 
        error: (error as Error).message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          {logo && <div className="flex justify-center mb-4">{logo}</div>}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title || t('auth.login.title')}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Email/Password Form */}
        {providers.email && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              label={t('auth.fields.email')}
              placeholder={t('auth.placeholders.email')}
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              error={errors.email}
              required
              fullWidth
              trackingMetadata={{ field: 'email' }}
            />

            <Input
              type="password"
              label={t('auth.fields.password')}
              placeholder={t('auth.placeholders.password')}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              error={errors.password}
              required
              fullWidth
              trackingMetadata={{ field: 'password' }}
            />

            {errors.form && (
              <p className="text-sm text-red-600">{errors.form}</p>
            )}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={onForgotPassword}
              >
                {t('auth.login.forgotPassword')}
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              loadingText={t('auth.login.signingIn')}
            >
              {t('auth.login.signIn')}
            </Button>
          </form>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3">
          {providers.google && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              icon="pi pi-google"
            >
              {t('auth.login.continueWith', { provider: 'Google' })}
            </Button>
          )}

          {providers.apple && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
              icon="pi pi-apple"
            >
              {t('auth.login.continueWith', { provider: 'Apple' })}
            </Button>
          )}

          {providers.microsoft && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSocialLogin('microsoft')}
              disabled={loading}
              icon="pi pi-microsoft"
            >
              {t('auth.login.continueWith', { provider: 'Microsoft' })}
            </Button>
          )}

          {providers.facebook && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              icon="pi pi-facebook"
            >
              {t('auth.login.continueWith', { provider: 'Facebook' })}
            </Button>
          )}

          {providers.github && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              icon="pi pi-github"
            >
              {t('auth.login.continueWith', { provider: 'GitHub' })}
            </Button>
          )}

          {providers.biometric && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSocialLogin('biometric')}
              disabled={loading}
              icon="pi pi-fingerprint"
            >
              {t('auth.login.biometric')}
            </Button>
          )}
        </div>

        {/* Sign Up Link */}
        {onSignUp && (
          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.login.noAccount')}{' '}
              <Button
                variant="ghost"
                size="small"
                onClick={onSignUp}
                className="font-medium text-buildkit-500 hover:text-buildkit-600"
              >
                {t('auth.login.signUp')}
              </Button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};