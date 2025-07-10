import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/Button';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface TwoFactorPageProps {
  onVerify?: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onBack?: () => void;
  method?: '2fa' | 'sms' | 'email';
  phoneNumber?: string;
  email?: string;
  codeLength?: number;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const TwoFactorPage: React.FC<TwoFactorPageProps> = ({
  onVerify,
  onResend,
  onBack,
  method = '2fa',
  phoneNumber,
  email,
  codeLength = 6,
  logo,
  title,
  subtitle,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'TwoFactorPage' });
  
  const [code, setCode] = useState(Array(codeLength).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus();
    
    // Start resend timer
    setResendTimer(30);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, codeLength).split('');
      const newCode = [...code];
      pastedCode.forEach((digit, i) => {
        if (index + i < codeLength) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // Focus last filled input or next empty one
      let lastFilledIndex = -1;
      for (let i = newCode.length - 1; i >= 0; i--) {
        if (newCode[i] !== '') {
          lastFilledIndex = i;
          break;
        }
      }
      const nextIndex = Math.min(lastFilledIndex + 1, codeLength - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus next input
      if (value && index < codeLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const fullCode = code.join('');
    if (fullCode.length !== codeLength) {
      setError(t('auth.errors.codeIncomplete'));
      trackEvent('2fa_validation_failed', { method });
      return;
    }

    setLoading(true);
    trackEvent('2fa_verify_attempt', { method });

    try {
      await onVerify?.(fullCode);
      trackEvent('2fa_verify_success', { method });
    } catch (error) {
      trackEvent('2fa_verify_error', { method, error: (error as Error).message });
      setError(t('auth.errors.codeInvalid'));
      setCode(Array(codeLength).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    trackEvent('2fa_resend', { method });

    try {
      await onResend?.();
      setResendTimer(30);
      trackEvent('2fa_resend_success', { method });
    } catch (error) {
      trackEvent('2fa_resend_error', { method, error: (error as Error).message });
    } finally {
      setResending(false);
    }
  };

  const getMethodIcon = () => {
    switch (method) {
      case 'sms': return 'pi-mobile';
      case 'email': return 'pi-envelope';
      default: return 'pi-shield';
    }
  };

  const getMethodText = () => {
    switch (method) {
      case 'sms': 
        return t('auth.twoFactor.sentToPhone', { 
          phone: phoneNumber ? `***${phoneNumber.slice(-4)}` : '' 
        });
      case 'email': 
        return t('auth.twoFactor.sentToEmail', { 
          email: email ? `***@${email.split('@')[1]}` : '' 
        });
      default: 
        return t('auth.twoFactor.enterApp');
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          {logo && <div className="flex justify-center mb-4">{logo}</div>}
          
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-buildkit-100 dark:bg-buildkit-900/40 mb-4">
            <i className={`pi ${getMethodIcon()} text-buildkit-600 dark:text-buildkit-400 text-2xl`}></i>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title || t('auth.twoFactor.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {subtitle || getMethodText()}
          </p>
        </div>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={codeLength}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  'w-12 h-12 text-center text-lg font-semibold rounded-lg border-2',
                  'focus:outline-none focus:ring-2 focus:ring-buildkit-500 focus:border-buildkit-500',
                  'transition-all duration-200',
                  error 
                    ? 'border-red-500 text-red-600' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                )}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText={t('auth.twoFactor.verifying')}
            disabled={code.some(digit => !digit)}
          >
            {t('auth.twoFactor.verify')}
          </Button>
        </form>

        {/* Resend Code */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.twoFactor.didntReceive')}
            {resendTimer > 0 && (
              <span className="ml-1">
                {t('auth.twoFactor.resendIn', { seconds: resendTimer })}
              </span>
            )}
          </div>
          
          {onResend && (
            <Button
              variant="ghost"
              onClick={handleResend}
              loading={resending}
              disabled={resendTimer > 0}
              size="small"
            >
              {t('auth.twoFactor.resendCode')}
            </Button>
          )}
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onBack}
              icon="pi pi-arrow-left"
              size="small"
            >
              {t('auth.twoFactor.back')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};