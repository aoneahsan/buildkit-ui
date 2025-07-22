import React, { useCallback, useEffect, useState } from 'react';
import { Dialog } from '../Dialog';
import { Button } from '../Button';
import { TrackedWrapper } from '../base/TrackedWrapper';
import { 
  authenticateWithBiometrics, 
  isBiometricAvailable,
  type BiometricAuthOptions,
  type BiometricCheckResult 
} from '../../integrations/biometric-auth';
import { trackEvent } from '../../tracking';
import { clsx } from 'clsx';

export interface BiometricPromptProps {
  className?: string;
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
  onError?: (error: Error) => void;
  reason?: string;
  title?: string;
  subtitle?: string;
  fallbackButtonLabel?: string;
  showFallback?: boolean;
  maxAttempts?: number;
  autoPrompt?: boolean;
  children?: React.ReactNode;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  className,
  visible,
  onHide,
  onSuccess,
  onError,
  reason = 'Please authenticate to continue',
  title = 'Authentication Required',
  subtitle,
  fallbackButtonLabel = 'Use Passcode',
  showFallback = true,
  maxAttempts = 3,
  autoPrompt = true,
  children,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState<BiometricCheckResult | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check biometric availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await isBiometricAvailable();
        setBiometricAvailable(result);
      } catch (error) {
        console.error('Failed to check biometric availability:', error);
      }
    };

    void checkAvailability();
  }, []);

  // Auto prompt when dialog becomes visible
  useEffect(() => {
    if (visible && autoPrompt && biometricAvailable?.available) {
      void handleAuthenticate();
    }
  }, [visible, autoPrompt, biometricAvailable]);

  const handleAuthenticate = useCallback(async () => {
    if (!biometricAvailable?.available) {
      setErrorMessage('Biometric authentication is not available on this device');
      setShowError(true);
      return;
    }

    try {
      setIsAuthenticating(true);
      setShowError(false);
      
      const options: any = {
        reason,
        fallbackToDevicePasscode: showFallback,
        maxAttempts,
      };

      const result = await authenticateWithBiometrics(options);

      if (result.success) {
        await trackEvent({
          eventName: 'biometric_prompt_success',
          componentType: 'BiometricPrompt',
          parameters: {
            biometryType: (result as any).biometryType,
            attemptCount: attemptCount + 1,
          },
        });

        onSuccess();
        onHide();
        setAttemptCount(0);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      await trackEvent({
        eventName: 'biometric_prompt_failed',
        componentType: 'BiometricPrompt',
        parameters: {
          attemptCount: newAttemptCount,
          errorCode: error.code,
        },
      });

      if (newAttemptCount >= maxAttempts) {
        setErrorMessage('Maximum authentication attempts exceeded');
        if (onError) {
          onError(new Error('Maximum authentication attempts exceeded'));
        }
      } else {
        setErrorMessage(error.message || 'Authentication failed. Please try again.');
      }
      
      setShowError(true);

      if (onError && error.code !== 'UserCancel') {
        onError(error);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [biometricAvailable, reason, showFallback, maxAttempts, attemptCount, onSuccess, onHide, onError]);

  const handleCancel = useCallback(() => {
    void trackEvent({
      eventName: 'biometric_prompt_cancelled',
      componentType: 'BiometricPrompt',
    });

    onHide();
    setAttemptCount(0);
    setShowError(false);
  }, [onHide]);

  const getBiometryIcon = () => {
    // Platform-specific biometry type icons
    // For now, return generic shield icon
    return 'pi pi-shield';
  };

  const getBiometryLabel = () => {
    // Platform-specific biometry type labels
    // For now, return generic label
    return 'Biometric Authentication';
  };

  return (
    <TrackedWrapper 
      componentType="BiometricPrompt" 
      className={clsx('buildkit-biometric-prompt', className)}
    >
      <Dialog
        header={title}
        visible={visible}
        onHide={handleCancel}
        modal
        closable={false}
        className="biometric-prompt-dialog"
        footer={
          <div className="biometric-prompt-footer">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={handleCancel}
              disabled={isAuthenticating}
            />
            {biometricAvailable?.available && (
              <Button
                label={`Use ${getBiometryLabel()}`}
                icon={getBiometryIcon()}
                onClick={handleAuthenticate}
                loading={isAuthenticating}
                disabled={attemptCount >= maxAttempts}
              />
            )}
          </div>
        }
      >
        <div className="biometric-prompt-content">
          {subtitle && <p className="biometric-prompt-subtitle">{subtitle}</p>}
          
          {children || (
            <div className="biometric-prompt-message">
              <i className={`${getBiometryIcon()} biometric-icon`} />
              <p>{reason}</p>
            </div>
          )}

          {showError && (
            <div className="biometric-prompt-error p-error">
              <i className="pi pi-exclamation-triangle" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!biometricAvailable?.available && biometricAvailable && (
            <div className="biometric-prompt-unavailable p-warning">
              <i className="pi pi-info-circle" />
              <span>
                Biometric authentication is not available: {biometricAvailable.reason}
              </span>
            </div>
          )}

          {attemptCount > 0 && attemptCount < maxAttempts && (
            <div className="biometric-prompt-attempts">
              Attempts remaining: {maxAttempts - attemptCount}
            </div>
          )}
        </div>
      </Dialog>
    </TrackedWrapper>
  );
};