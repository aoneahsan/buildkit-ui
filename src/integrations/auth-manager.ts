import { CapacitorAuthManager, AuthProvider } from 'capacitor-auth-manager';
import type { AuthResult, AuthProviderConfig, AuthUser } from 'capacitor-auth-manager';
import { AuthError } from 'capacitor-auth-manager';
import { trackEvent, trackErrorEvent } from '../tracking/tracker';
import { setUserId, setUserProperties } from './unified-tracking';
import { setErrorUser } from './unified-error-handling';

export interface AuthManagerConfig {
  providers?: AuthProviderConfig[];
  trackingEnabled?: boolean;
  autoSetUserId?: boolean;
}

let authConfig: AuthManagerConfig = {
  trackingEnabled: true,
  autoSetUserId: true,
};

/**
 * Initialize Auth Manager integration
 */
export async function initializeAuthManager(config: AuthManagerConfig = {}): Promise<void> {
  authConfig = { ...authConfig, ...config };
  
  // Initialize CapacitorAuthManager if providers are specified
  if (config.providers && config.providers.length > 0) {
    await CapacitorAuthManager.initialize({
      providers: config.providers,
    });
  }
}

/**
 * Sign in with provider
 */
export async function signIn(provider: AuthProvider, options?: any): Promise<AuthResult> {
  try {
    // Track sign in attempt
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_sign_in_attempt',
        parameters: {
          provider: provider.toString(),
          method: 'provider',
        },
      });
    }

    const result = await CapacitorAuthManager.signIn({ provider, ...options });

    // Track successful sign in
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_sign_in_success',
        parameters: {
          provider: provider.toString(),
          userId: result.user?.uid,
          method: 'provider',
        },
      });
    }

    // Auto set user ID in tracking
    if (authConfig.autoSetUserId && result.user?.uid) {
      await setUserId(result.user.uid);
      await setErrorUser(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
      });
      
      // Set user properties
      if (result.user.email || result.user.displayName) {
        await setUserProperties({
          email: result.user.email,
          displayName: result.user.displayName,
          provider: provider.toString(),
        });
      }
    }

    return result;
  } catch (error) {
    const authError = error as AuthError;
    
    // Track sign in error
    if (authConfig.trackingEnabled) {
      await trackErrorEvent(
        new Error(authError.message || 'Sign in failed'),
        'auth',
        {
          provider: provider.toString(),
          errorCode: authError.code,
        }
      );
    }

    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    // Track sign out attempt
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_sign_out_attempt',
      });
    }

    await CapacitorAuthManager.signOut();

    // Track successful sign out
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_sign_out_success',
      });
    }

    // Clear user ID from tracking
    if (authConfig.autoSetUserId) {
      await setUserId('');
      await setErrorUser('');
    }
  } catch (error) {
    // Track sign out error
    if (authConfig.trackingEnabled) {
      await trackErrorEvent(
        error as Error,
        'auth',
        { action: 'sign_out' }
      );
    }

    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const result = await CapacitorAuthManager.getCurrentUser();
    return result;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  return signIn(AuthProvider.EMAIL_PASSWORD, { email, password });
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    // Track sign up attempt
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_sign_up_attempt',
        parameters: {
          method: 'email',
        },
      });
    }

    // Sign up is performed through signIn with specific provider
    const result = await signIn(AuthProvider.EMAIL_PASSWORD, { email, password, isNewUser: true });

    // Track successful sign up
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_sign_up_success',
        parameters: {
          userId: result.user?.uid,
          method: 'email',
        },
      });
    }

    // Auto set user ID in tracking
    if (authConfig.autoSetUserId && result.user?.uid) {
      await setUserId(result.user.uid);
      await setErrorUser(result.user.uid, { email });
      await setUserProperties({ email, signUpMethod: 'email' });
    }

    return result;
  } catch (error) {
    const authError = error as AuthError;
    
    // Track sign up error
    if (authConfig.trackingEnabled) {
      await trackErrorEvent(
        new Error(authError.message || 'Sign up failed'),
        'auth',
        {
          method: 'email',
          errorCode: authError.code,
        }
      );
    }

    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    // Track password reset attempt
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_password_reset_attempt',
      });
    }

    await CapacitorAuthManager.sendPasswordResetEmail({ email });

    // Track successful password reset
    if (authConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'auth_password_reset_sent',
      });
    }
  } catch (error) {
    // Track password reset error
    if (authConfig.trackingEnabled) {
      await trackErrorEvent(
        error as Error,
        'auth',
        { action: 'password_reset' }
      );
    }

    throw error;
  }
}

/**
 * Check if user is signed in
 */
export async function isSignedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Listen to auth state changes
 */
export async function onAuthStateChange(callback: (user: AuthUser | null) => void): Promise<() => void> {
  const handle = await CapacitorAuthManager.addAuthStateListener((user: AuthUser | null) => {
    callback(user);
    
    // Auto update user ID in tracking
    if (authConfig.autoSetUserId) {
      if (user?.uid) {
        void setUserId(user.uid);
        void setErrorUser(user.uid, {
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        void setUserId('');
        void setErrorUser('');
      }
    }
  });
  
  return () => {
    handle.remove();
  };
}

// Export types from capacitor-auth-manager
export type { AuthProvider, AuthResult, AuthError } from 'capacitor-auth-manager';

let authManager: typeof CapacitorAuthManager | null = null;

/**
 * Get Auth Manager instance
 */
export function getAuthManager(): typeof CapacitorAuthManager | null {
  return authManager;
}

/**
 * Check if Auth Manager is initialized
 */
export function isAuthManagerInitialized(): boolean {
  return authManager !== null;
}

// Set authManager instance after initialization
authManager = CapacitorAuthManager;