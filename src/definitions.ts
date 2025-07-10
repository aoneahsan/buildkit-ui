import type { PluginListenerHandle } from '@capacitor/core';

export interface BuildKitUIPlugin {
  /**
   * Initialize the BuildKit UI plugin with configuration
   */
  initialize(options: BuildKitConfig): Promise<{ success: boolean }>;

  /**
   * Track a custom event with context
   */
  trackEvent(event: TrackingEvent): Promise<void>;

  /**
   * Track an error with full context
   */
  trackError(error: ErrorEvent): Promise<void>;

  /**
   * Get the current platform information
   */
  getPlatformInfo(): Promise<PlatformInfo>;

  /**
   * Set user properties for tracking
   */
  setUserProperties(properties: UserProperties): Promise<void>;

  /**
   * Start a performance trace
   */
  startTrace(name: string): Promise<{ traceId: string }>;

  /**
   * Stop a performance trace
   */
  stopTrace(traceId: string, metrics?: Record<string, number>): Promise<void>;

  /**
   * Sync offline queue
   */
  syncOfflineQueue(): Promise<{ synced: number; remaining: number }>;

  /**
   * Get offline queue status
   */
  getOfflineQueueStatus(): Promise<OfflineQueueStatus>;

  /**
   * Add event listeners
   */
  addListener(
    eventName: 'offlineStatusChanged',
    listenerFunc: (status: { isOnline: boolean }) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'queueSynced',
    listenerFunc: (result: { synced: number; failed: number }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Remove all listeners
   */
  removeAllListeners(): Promise<void>;
}

export interface BuildKitConfig {
  /**
   * Tracking configuration
   */
  tracking: TrackingConfig;

  /**
   * Firebase configuration (via capacitor-firebase-kit)
   */
  firebase?: FirebaseConfig;

  /**
   * Authentication configuration (via capacitor-auth-manager)
   */
  auth?: AuthConfig;

  /**
   * Update configuration (via capacitor-native-update)
   */
  updates?: UpdateConfig;

  /**
   * Offline queue configuration
   */
  offline?: OfflineConfig;

  /**
   * Theme configuration
   */
  theme?: ThemeConfig;

  /**
   * Internationalization configuration
   */
  i18n?: I18nConfig;
}

export interface TrackingConfig {
  /**
   * Enable automatic tracking of all component interactions
   */
  autoTrack: boolean;

  /**
   * Track user journey through screens
   */
  trackUserJourney: boolean;

  /**
   * Track performance metrics
   */
  trackPerformance: boolean;

  /**
   * Track errors automatically
   */
  trackErrors: boolean;

  /**
   * Track network status changes
   */
  trackNetwork: boolean;

  /**
   * Session timeout in milliseconds
   */
  sessionTimeout?: number;

  /**
   * Custom event prefix
   */
  eventPrefix?: string;

  /**
   * Analytics providers configuration
   */
  analytics?: {
    firebase?: boolean;
    amplitude?: AmplitudeConfig;
    clarity?: ClarityConfig;
    custom?: CustomAnalyticsConfig;
  };

  /**
   * Error tracking providers
   */
  errorTracking?: {
    sentry?: SentryConfig;
    crashlytics?: boolean;
    custom?: CustomErrorConfig;
  };

  /**
   * Platform-specific tracking options
   */
  platforms?: {
    ios?: IOSTrackingConfig;
    android?: AndroidTrackingConfig;
    web?: WebTrackingConfig;
  };
}

export interface TrackingEvent {
  /**
   * Event name
   */
  eventName: string;

  /**
   * Component that triggered the event
   */
  componentType?: string;

  /**
   * Component props at the time of event
   */
  componentProps?: Record<string, any>;

  /**
   * Additional event parameters
   */
  parameters?: Record<string, any>;

  /**
   * User properties to attach
   */
  userProperties?: Record<string, any>;

  /**
   * Platform override (auto-detected if not provided)
   */
  platform?: 'ios' | 'android' | 'web';

  /**
   * Timestamp override (auto-generated if not provided)
   */
  timestamp?: number;
}

export interface ErrorEvent {
  /**
   * Error message
   */
  message: string;

  /**
   * Error stack trace
   */
  stack?: string;

  /**
   * Error code
   */
  code?: string;

  /**
   * Component where error occurred
   */
  componentType?: string;

  /**
   * Additional error context
   */
  context?: Record<string, any>;

  /**
   * Error severity
   */
  severity?: 'fatal' | 'error' | 'warning' | 'info';

  /**
   * User actions leading to error
   */
  breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
  /**
   * Breadcrumb type
   */
  type: 'navigation' | 'click' | 'error' | 'custom';

  /**
   * Breadcrumb message
   */
  message: string;

  /**
   * Breadcrumb data
   */
  data?: Record<string, any>;

  /**
   * Timestamp
   */
  timestamp: number;
}

export interface PlatformInfo {
  /**
   * Platform type
   */
  platform: 'ios' | 'android' | 'web';

  /**
   * Platform version
   */
  platformVersion: string;

  /**
   * App version
   */
  appVersion: string;

  /**
   * App build number
   */
  buildNumber: string;

  /**
   * Device information
   */
  device: DeviceInfo;

  /**
   * Network information
   */
  network: NetworkInfo;

  /**
   * App state
   */
  appState: AppState;
}

export interface DeviceInfo {
  /**
   * Device ID
   */
  deviceId: string;

  /**
   * Device model
   */
  model: string;

  /**
   * Device manufacturer (Android only)
   */
  manufacturer?: string;

  /**
   * Operating system
   */
  operatingSystem: string;

  /**
   * OS version
   */
  osVersion: string;

  /**
   * Is simulator/emulator
   */
  isSimulator: boolean;

  /**
   * Device memory in bytes
   */
  memorySize?: number;

  /**
   * Free disk space in bytes
   */
  diskFree?: number;

  /**
   * Battery level (0-1)
   */
  batteryLevel?: number;

  /**
   * Screen dimensions
   */
  screen?: {
    width: number;
    height: number;
    scale: number;
  };
}

export interface NetworkInfo {
  /**
   * Is online
   */
  isOnline: boolean;

  /**
   * Connection type
   */
  connectionType?: 'wifi' | 'cellular' | 'none' | 'unknown';

  /**
   * Download speed in Mbps
   */
  downloadSpeed?: number;

  /**
   * Effective connection type
   */
  effectiveType?: '2g' | '3g' | '4g' | '5g';
}

export interface AppState {
  /**
   * Is app in foreground
   */
  isActive: boolean;

  /**
   * Current session ID
   */
  sessionId: string;

  /**
   * Session start time
   */
  sessionStartTime: number;

  /**
   * Previous session ID
   */
  previousSessionId?: string;

  /**
   * User ID if authenticated
   */
  userId?: string;

  /**
   * User journey (last N screens)
   */
  userJourney: string[];
}

export interface UserProperties {
  /**
   * User ID
   */
  userId?: string;

  /**
   * User email
   */
  email?: string;

  /**
   * User name
   */
  name?: string;

  /**
   * User plan/tier
   */
  plan?: string;

  /**
   * Account creation date
   */
  createdAt?: string;

  /**
   * Custom properties
   */
  custom?: Record<string, any>;
}

export interface OfflineQueueStatus {
  /**
   * Number of events in queue
   */
  queueSize: number;

  /**
   * Oldest event timestamp
   */
  oldestEventTime?: number;

  /**
   * Last sync attempt time
   */
  lastSyncAttempt?: number;

  /**
   * Last successful sync time
   */
  lastSyncSuccess?: number;

  /**
   * Is currently syncing
   */
  isSyncing: boolean;

  /**
   * Queue size in bytes
   */
  queueSizeBytes?: number;
}

export interface FirebaseConfig {
  /**
   * Firebase API Key
   */
  apiKey: string;

  /**
   * Firebase Auth Domain
   */
  authDomain: string;

  /**
   * Firebase Project ID
   */
  projectId: string;

  /**
   * Firebase Storage Bucket
   */
  storageBucket: string;

  /**
   * Firebase Messaging Sender ID
   */
  messagingSenderId: string;

  /**
   * Firebase App ID
   */
  appId: string;

  /**
   * Firebase Measurement ID
   */
  measurementId?: string;
}

export interface AuthConfig {
  /**
   * Auth providers configuration
   */
  providers: {
    google?: { clientId: string };
    apple?: { clientId: string };
    microsoft?: { clientId: string; tenantId?: string };
    facebook?: { appId: string };
    github?: { clientId: string };
    slack?: { clientId: string };
    linkedin?: { clientId: string };
    firebase?: boolean;
    emailMagicLink?: boolean;
    sms?: boolean;
    emailPassword?: boolean;
    phonePassword?: boolean;
    usernamePassword?: boolean;
    emailCode?: boolean;
    biometric?: BiometricConfig;
  };

  /**
   * Redirect URLs for OAuth
   */
  redirectUrl?: string;

  /**
   * Custom auth endpoint
   */
  customEndpoint?: string;
}

export interface BiometricConfig {
  /**
   * Require biometric for sensitive operations
   */
  required: boolean;

  /**
   * Allow fallback to device passcode
   */
  fallbackToPasscode: boolean;

  /**
   * Biometric prompt title
   */
  promptTitle?: string;

  /**
   * Biometric prompt subtitle
   */
  promptSubtitle?: string;
}

export interface UpdateConfig {
  /**
   * Enable update checks
   */
  enabled: boolean;

  /**
   * Check for updates on app launch
   */
  checkOnLaunch: boolean;

  /**
   * Check interval in milliseconds
   */
  checkInterval?: number;

  /**
   * Force mandatory updates
   */
  mandatoryUpdates: boolean;

  /**
   * Allow users to skip optional updates
   */
  allowSkip?: boolean;

  /**
   * Auto-download updates on WiFi
   */
  autoDownload?: 'always' | 'wifi-only' | 'never';

  /**
   * Show release notes
   */
  showReleaseNotes?: boolean;
}

export interface OfflineConfig {
  /**
   * Maximum queue size
   */
  queueSize: number;

  /**
   * Sync interval in milliseconds
   */
  syncInterval: number;

  /**
   * Persist queue to storage
   */
  persistQueue: boolean;

  /**
   * Retry failed events
   */
  retryFailed: boolean;

  /**
   * Maximum retry attempts
   */
  maxRetries?: number;

  /**
   * Events to exclude from queue
   */
  excludeEvents?: string[];
}

export interface ThemeConfig {
  /**
   * Default theme mode
   */
  defaultMode: 'light' | 'dark' | 'system';

  /**
   * Available themes
   */
  themes?: Record<string, ThemeDefinition>;

  /**
   * Use CSS variables
   */
  useCssVariables?: boolean;

  /**
   * Theme change transition
   */
  transition?: string;
}

export interface ThemeDefinition {
  /**
   * Theme name
   */
  name: string;

  /**
   * Theme colors
   */
  colors: Record<string, string>;

  /**
   * Theme fonts
   */
  fonts?: Record<string, string>;

  /**
   * Theme spacing
   */
  spacing?: Record<string, string>;

  /**
   * Custom CSS
   */
  customCss?: string;
}

export interface I18nConfig {
  /**
   * Default language
   */
  defaultLanguage: string;

  /**
   * Fallback language
   */
  fallbackLanguage?: string;

  /**
   * Available languages
   */
  languages: string[];

  /**
   * Translation namespaces
   */
  namespaces?: string[];

  /**
   * Load translations from URL
   */
  loadPath?: string;

  /**
   * Cache translations
   */
  cache?: boolean;

  /**
   * Debug mode
   */
  debug?: boolean;
}

export interface AmplitudeConfig {
  /**
   * Amplitude API Key
   */
  apiKey: string;

  /**
   * Server URL override
   */
  serverUrl?: string;

  /**
   * Batch events
   */
  batchEvents?: boolean;

  /**
   * Event upload threshold
   */
  eventUploadThreshold?: number;
}

export interface ClarityConfig {
  /**
   * Microsoft Clarity Project ID
   */
  projectId: string;

  /**
   * Enable cookie usage
   */
  enableCookies?: boolean;

  /**
   * Custom user ID
   */
  userId?: string;
}

export interface CustomAnalyticsConfig {
  /**
   * Custom analytics endpoint
   */
  endpoint: string;

  /**
   * Headers to include
   */
  headers?: Record<string, string>;

  /**
   * Batch events
   */
  batchEvents?: boolean;

  /**
   * Batch size
   */
  batchSize?: number;

  /**
   * Transform event before sending
   */
  transformEvent?: (event: TrackingEvent) => any;
}

export interface SentryConfig {
  /**
   * Sentry DSN
   */
  dsn: string;

  /**
   * Environment
   */
  environment?: string;

  /**
   * Release version
   */
  release?: string;

  /**
   * Sample rate (0-1)
   */
  sampleRate?: number;

  /**
   * Trace sample rate (0-1)
   */
  tracesSampleRate?: number;

  /**
   * Debug mode
   */
  debug?: boolean;
}

export interface CustomErrorConfig {
  /**
   * Custom error endpoint
   */
  endpoint: string;

  /**
   * Headers to include
   */
  headers?: Record<string, string>;

  /**
   * Transform error before sending
   */
  transformError?: (error: ErrorEvent) => any;
}

export interface IOSTrackingConfig {
  /**
   * Track device info
   */
  trackDeviceInfo: boolean;

  /**
   * Track App Store receipt
   */
  trackAppStore: boolean;

  /**
   * Track permission changes
   */
  trackPermissions: boolean;

  /**
   * Track jailbreak status
   */
  trackJailbreak?: boolean;
}

export interface AndroidTrackingConfig {
  /**
   * Track device info
   */
  trackDeviceInfo: boolean;

  /**
   * Track Play Store info
   */
  trackPlayStore: boolean;

  /**
   * Track permission changes
   */
  trackPermissions: boolean;

  /**
   * Track root status
   */
  trackRoot?: boolean;
}

export interface WebTrackingConfig {
  /**
   * Track browser info
   */
  trackBrowser: boolean;

  /**
   * Track PWA install status
   */
  trackPWA: boolean;

  /**
   * Track viewport changes
   */
  trackViewport: boolean;

  /**
   * Track page visibility
   */
  trackVisibility?: boolean;

  /**
   * Track referrer
   */
  trackReferrer?: boolean;
}