import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface RegisterPageProps {
  onRegister?: (data: any) => Promise<void>;
  onLogin?: () => void;
  fields?: {
    name?: boolean;
    email?: boolean;
    phone?: boolean;
    username?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  };
  socialProviders?: string[];
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  termsUrl?: string;
  privacyUrl?: string;
  className?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  onLogin,
  fields = { name: true, email: true, password: true, confirmPassword: true },
  socialProviders = [],
  logo,
  title,
  subtitle,
  termsUrl,
  privacyUrl,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'RegisterPage' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (fields.name && !formData.name) {
      newErrors.name = t('auth.errors.nameRequired');
    }
    
    if (fields.email) {
      if (!formData.email) {
        newErrors.email = t('auth.errors.emailRequired');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t('auth.errors.emailInvalid');
      }
    }
    
    if (fields.phone && !formData.phone) {
      newErrors.phone = t('auth.errors.phoneRequired');
    }
    
    if (fields.username && !formData.username) {
      newErrors.username = t('auth.errors.usernameRequired');
    }
    
    if (fields.password) {
      if (!formData.password) {
        newErrors.password = t('auth.errors.passwordRequired');
      } else if (formData.password.length < 8) {
        newErrors.password = t('auth.errors.passwordTooShort');
      }
    }
    
    if (fields.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }
    
    if (!formData.agreeToTerms) {
      newErrors.terms = t('auth.errors.termsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      trackEvent('register_validation_failed', { 
        errors: Object.keys(errors),
        fieldsCount: Object.keys(fields).filter(k => fields[k as keyof typeof fields]).length
      });
      return;
    }

    setLoading(true);
    trackEvent('register_attempt', { 
      hasName: !!formData.name,
      hasEmail: !!formData.email,
      hasPhone: !!formData.phone,
      hasUsername: !!formData.username,
    });

    try {
      await onRegister?.(formData);
      trackEvent('register_success');
    } catch (error) {
      trackEvent('register_error', { error: (error as Error).message });
      setErrors({ form: t('auth.errors.registerFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: string) => {
    setLoading(true);
    trackEvent('register_social_attempt', { provider });

    try {
      // Social registration logic
      trackEvent('register_social_success', { provider });
    } catch (error) {
      trackEvent('register_social_error', { 
        provider,
        error: (error as Error).message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4 py-8', className)}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          {logo && <div className="flex justify-center mb-4">{logo}</div>}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title || t('auth.register.title')}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.name && (
            <Input
              label={t('auth.fields.name')}
              placeholder={t('auth.placeholders.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
              fullWidth
              trackingMetadata={{ field: 'name' }}
            />
          )}

          {fields.email && (
            <Input
              type="email"
              label={t('auth.fields.email')}
              placeholder={t('auth.placeholders.email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              fullWidth
              trackingMetadata={{ field: 'email' }}
            />
          )}

          {fields.phone && (
            <Input
              type="tel"
              label={t('auth.fields.phone')}
              placeholder={t('auth.placeholders.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
              fullWidth
              trackingMetadata={{ field: 'phone' }}
            />
          )}

          {fields.username && (
            <Input
              label={t('auth.fields.username')}
              placeholder={t('auth.placeholders.username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
              required
              fullWidth
              trackingMetadata={{ field: 'username' }}
            />
          )}

          {fields.password && (
            <Input
              type="password"
              label={t('auth.fields.password')}
              placeholder={t('auth.placeholders.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              helperText={t('auth.helpers.passwordRequirements')}
              required
              fullWidth
              trackingMetadata={{ field: 'password' }}
            />
          )}

          {fields.confirmPassword && (
            <Input
              type="password"
              label={t('auth.fields.confirmPassword')}
              placeholder={t('auth.placeholders.confirmPassword')}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
              fullWidth
              trackingMetadata={{ field: 'confirmPassword' }}
            />
          )}

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="mt-1 h-4 w-4 text-buildkit-600 focus:ring-buildkit-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {t('auth.register.agreeToTerms')}{' '}
              {termsUrl && (
                <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="text-buildkit-500 hover:text-buildkit-600">
                  {t('auth.register.terms')}
                </a>
              )}
              {' '}{t('auth.register.and')}{' '}
              {privacyUrl && (
                <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="text-buildkit-500 hover:text-buildkit-600">
                  {t('auth.register.privacy')}
                </a>
              )}
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-600">{errors.terms}</p>
          )}

          {errors.form && (
            <p className="text-sm text-red-600">{errors.form}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText={t('auth.register.creatingAccount')}
          >
            {t('auth.register.createAccount')}
          </Button>
        </form>

        {/* Social Registration */}
        {socialProviders.length > 0 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  {t('auth.register.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {socialProviders.map((provider) => (
                <Button
                  key={provider}
                  variant="secondary"
                  fullWidth
                  onClick={() => handleSocialRegister(provider)}
                  disabled={loading}
                  icon={`pi pi-${provider}`}
                >
                  {t('auth.register.continueWith', { provider: provider.charAt(0).toUpperCase() + provider.slice(1) })}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Login Link */}
        {onLogin && (
          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.register.haveAccount')}{' '}
              <Button
                variant="ghost"
                size="small"
                onClick={onLogin}
                className="font-medium text-buildkit-500 hover:text-buildkit-600"
              >
                {t('auth.register.signIn')}
              </Button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};