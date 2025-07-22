import { BiometricAuth } from 'capacitor-biometric-authentication';
import type { 
  BiometricAuthOptions,
  BiometricAvailabilityResult,
  BiometricAuthResult,
  BiometricType
} from 'capacitor-biometric-authentication';
import { trackEvent, trackErrorEvent } from '../tracking/tracker';

export interface BiometricConfig {
  trackingEnabled?: boolean;
  fallbackToDevicePasscode?: boolean;
  maxAttempts?: number;
}

let biometricConfig: BiometricConfig = {
  trackingEnabled: true,
  fallbackToDevicePasscode: true,
  maxAttempts: 3,
};

/**
 * Initialize Biometric Authentication integration
 */
export function initializeBiometricAuth(config: BiometricConfig = {}): void {
  biometricConfig = { ...biometricConfig, ...config };
}

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<BiometricAvailabilityResult> {
  try {
    const result = await BiometricAuth.isAvailable();
    
    if (biometricConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'biometric_availability_checked',
        parameters: {
          available: result.available,
          reason: result.reason,
        },
      });
    }
    
    return result;
  } catch (error) {
    console.error('Failed to check biometric availability:', error);
    throw error;
  }
}

/**
 * Authenticate with biometrics
 */
export async function authenticateWithBiometrics(options?: BiometricAuthOptions): Promise<BiometricAuthResult> {
  try {
    // Track authentication attempt
    if (biometricConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'biometric_auth_attempt',
        parameters: {
          reason: (options as any)?.reason,
          fallbackEnabled: (options as any)?.fallbackToDevicePasscode ?? biometricConfig.fallbackToDevicePasscode,
        },
      });
    }

    const authOptions: BiometricAuthOptions = {
      title: 'Authentication Required',
      description: (options as any)?.reason || 'Please authenticate to continue',
      fallbackButtonTitle: 'Use Passcode',
      disableFallback: !((options as any)?.fallbackToDevicePasscode ?? biometricConfig.fallbackToDevicePasscode),
      maxAttempts: options?.maxAttempts ?? biometricConfig.maxAttempts,
      ...options,
    };

    const result = await BiometricAuth.authenticate(authOptions);

    // Track successful authentication
    if (biometricConfig.trackingEnabled && result.success) {
      await trackEvent({
        eventName: 'biometric_auth_success',
        parameters: {
          // biometryType will be in result data
        },
      });
    }

    return result;
  } catch (error) {
    const biometricError = error as any;
    
    // Track authentication error
    if (biometricConfig.trackingEnabled) {
      await trackErrorEvent(
        new Error(biometricError.message || 'Biometric authentication failed'),
        'biometric_auth',
        {
          errorCode: biometricError.code,
          // biometryType may be in error data
        }
      );
    }

    throw error;
  }
}

/**
 * Verify user with biometrics (convenience method)
 */
export async function verifyUser(reason?: string): Promise<boolean> {
  try {
    const result = await authenticateWithBiometrics({ description: reason } as any);
    return result.success;
  } catch (error) {
    return false;
  }
}

/**
 * Check if device has biometric capability
 */
export async function hasBiometricCapability(): Promise<boolean> {
  try {
    const result = await isBiometricAvailable();
    return result.available;
  } catch (error) {
    return false;
  }
}

/**
 * Get biometry type
 */
export async function getBiometryType(): Promise<string | undefined> {
  try {
    const result = await isBiometricAvailable();
    // biometryType may be available in platform-specific implementations
    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Check if biometric authentication is available (alias for hasBiometricCapability)
 */
export async function isBiometricAuthAvailable(): Promise<boolean> {
  return hasBiometricCapability();
}

/**
 * Set biometric credentials (for supported platforms)
 */
export async function setBiometricCredentials(options: {
  username: string;
  password: string;
  server?: string;
}): Promise<void> {
  // setCredentials is not available in the current API
  throw new Error('Setting credentials is not supported');
}

/**
 * Get biometric credentials (for supported platforms)
 */
export async function getBiometricCredentials(options?: {
  server?: string;
}): Promise<{ username: string; password: string } | null> {
  try {
    // getCredentials is not available in the current API
    throw new Error('Getting credentials is not supported');
  } catch (error) {
    console.error('Failed to get biometric credentials:', error);
    return null;
  }
}

/**
 * Delete biometric credentials (for supported platforms)
 */
export async function deleteBiometricCredentials(options?: {
  server?: string;
}): Promise<void> {
  try {
    await BiometricAuth.deleteCredentials();
    
    if (biometricConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'biometric_credentials_deleted',
      });
    }
  } catch (error) {
    console.error('Failed to delete biometric credentials:', error);
    throw error;
  }
}

// Export types from capacitor-biometric-authentication
export type { 
  BiometricAuthOptions,
  BiometricAvailabilityResult,
  BiometricAuthResult
} from 'capacitor-biometric-authentication';
export type BiometricCheckResult = BiometricAvailabilityResult;