import { WebPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

import type {
  BuildKitUIPlugin,
  BuildKitConfig,
  TrackingEvent,
  ErrorEvent,
  PlatformInfo,
  UserProperties,
  OfflineQueueStatus,
  DeviceInfo,
  NetworkInfo,
  AppState,
  Breadcrumb,
} from './definitions';

export class BuildKitUIWeb extends WebPlugin implements BuildKitUIPlugin {
  private config: BuildKitConfig | null = null;
  private sessionId: string;
  private sessionStartTime: number;
  private userJourney: string[] = [];
  private offlineQueue: any[] = [];
  private userProperties: UserProperties = {};
  private traces: Map<string, { name: string; startTime: number }> = new Map();
  private breadcrumbs: Breadcrumb[] = [];
  private deviceInfo: DeviceInfo | null = null;
  private networkInfo: NetworkInfo | null = null;
  private isInitialized = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeListeners();
  }

  async initialize(options: BuildKitConfig): Promise<{ success: boolean }> {
    try {
      this.config = options;
      this.isInitialized = true;

      // Initialize device info
      await this.updateDeviceInfo();

      // Initialize network info
      await this.updateNetworkInfo();

      // Load offline queue from storage
      await this.loadOfflineQueue();

      // Start offline sync if configured
      if (options.offline?.syncInterval) {
        this.startOfflineSync(options.offline.syncInterval);
      }

      // Initialize analytics providers
      await this.initializeAnalytics();

      // Initialize error tracking
      await this.initializeErrorTracking();

      // Set up global error handler
      this.setupGlobalErrorHandler();

      return { success: true };
    } catch (error) {
      console.warn('BuildKit UI initialization failed:', error);
      return { success: false };
    }
  }

  async trackEvent(event: TrackingEvent): Promise<void> {
    if (!this.isInitialized) {
      console.warn('BuildKit UI not initialized');
      return;
    }

    const enrichedEvent = await this.enrichEvent(event);

    // Add to breadcrumbs
    this.addBreadcrumb({
      type: 'custom',
      message: event.eventName,
      data: event.parameters,
      timestamp: Date.now(),
    });

    // Send to analytics providers
    if (this.config?.tracking.analytics?.firebase) {
      await this.sendToFirebaseAnalytics(enrichedEvent);
    }

    if (this.config?.tracking.analytics?.amplitude) {
      await this.sendToAmplitude(enrichedEvent);
    }

    if (this.config?.tracking.analytics?.clarity) {
      await this.sendToClarity(enrichedEvent);
    }

    if (this.config?.tracking.analytics?.custom) {
      await this.sendToCustomAnalytics(enrichedEvent);
    }

    // Handle offline queue
    if (!this.networkInfo?.isOnline) {
      await this.addToOfflineQueue(enrichedEvent);
    }
  }

  async trackError(error: ErrorEvent): Promise<void> {
    if (!this.isInitialized) {
      console.warn('BuildKit UI not initialized');
      return;
    }

    const enrichedError = {
      ...error,
      breadcrumbs: this.breadcrumbs.slice(-20), // Last 20 breadcrumbs
      platform: await this.getPlatformType(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userProperties: this.userProperties,
      deviceInfo: this.deviceInfo,
      networkInfo: this.networkInfo,
    };

    // Send to error tracking providers
    if (this.config?.tracking.errorTracking?.sentry) {
      await this.sendToSentry(enrichedError);
    }

    if (this.config?.tracking.errorTracking?.crashlytics) {
      await this.sendToCrashlytics(enrichedError);
    }

    if (this.config?.tracking.errorTracking?.custom) {
      await this.sendToCustomError(enrichedError);
    }
  }

  async getPlatformInfo(): Promise<PlatformInfo> {
    const [deviceInfo, appInfo, networkStatus] = await Promise.all([
      Device.getInfo(),
      App.getInfo(),
      Network.getStatus(),
    ]);

    const appState: AppState = {
      isActive: true,
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime,
      userId: this.userProperties.userId,
      userJourney: this.userJourney.slice(-10),
    };

    return {
      platform: deviceInfo.platform as 'ios' | 'android' | 'web',
      platformVersion: deviceInfo.osVersion || 'unknown',
      appVersion: appInfo.version,
      buildNumber: appInfo.build,
      device: this.deviceInfo || await this.getDeviceInfo(),
      network: this.networkInfo || await this.getNetworkInfo(),
      appState,
    };
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    this.userProperties = { ...this.userProperties, ...properties };

    // Update analytics providers
    if (this.config?.tracking.analytics?.firebase) {
      await this.setFirebaseUserProperties(properties);
    }

    if (this.config?.tracking.analytics?.amplitude) {
      await this.setAmplitudeUserProperties(properties);
    }

    // Store in preferences
    await Preferences.set({
      key: 'buildkit_user_properties',
      value: JSON.stringify(this.userProperties),
    });
  }

  async startTrace(name: string): Promise<{ traceId: string }> {
    const traceId = this.generateTraceId();
    this.traces.set(traceId, { name, startTime: performance.now() });

    if (this.config?.tracking.analytics?.firebase) {
      // Start Firebase Performance trace
      await this.startFirebaseTrace(name);
    }

    return { traceId };
  }

  async stopTrace(traceId: string, metrics?: Record<string, number>): Promise<void> {
    const trace = this.traces.get(traceId);
    if (!trace) {
      console.warn(`Trace ${traceId} not found`);
      return;
    }

    const duration = performance.now() - trace.startTime;
    this.traces.delete(traceId);

    // Track as performance event
    await this.trackEvent({
      eventName: 'performance_trace',
      parameters: {
        traceName: trace.name,
        duration,
        ...metrics,
      },
    });

    if (this.config?.tracking.analytics?.firebase) {
      await this.stopFirebaseTrace(trace.name, metrics);
    }
  }

  async syncOfflineQueue(): Promise<{ synced: number; remaining: number }> {
    if (!this.networkInfo?.isOnline) {
      return { synced: 0, remaining: this.offlineQueue.length };
    }

    let synced = 0;
    const failedEvents = [];

    for (const event of this.offlineQueue) {
      try {
        await this.sendEvent(event);
        synced++;
      } catch (error) {
        failedEvents.push(event);
      }
    }

    this.offlineQueue = failedEvents;
    await this.saveOfflineQueue();

    this.notifyListeners('queueSynced', { synced, failed: failedEvents.length });

    return { synced, remaining: failedEvents.length };
  }

  async getOfflineQueueStatus(): Promise<OfflineQueueStatus> {
    const queueSizeBytes = new Blob([JSON.stringify(this.offlineQueue)]).size;

    return {
      queueSize: this.offlineQueue.length,
      oldestEventTime: this.offlineQueue[0]?.timestamp,
      lastSyncAttempt: await this.getLastSyncAttempt(),
      lastSyncSuccess: await this.getLastSyncSuccess(),
      isSyncing: false,
      queueSizeBytes,
    };
  }

  // Private methods

  private async initializeListeners(): Promise<void> {
    // Network status listener
    Network.addListener('networkStatusChange', async (status) => {
      this.networkInfo = await this.getNetworkInfo();
      this.notifyListeners('offlineStatusChanged', { isOnline: status.connected });

      // Auto-sync when coming online
      if (status.connected && this.offlineQueue.length > 0) {
        this.syncOfflineQueue();
      }
    });

    // App state listener
    App.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        // App went to background, save state
        this.saveSessionState();
      }
    });

    // Page visibility for web
    if (this.isWeb()) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.saveSessionState();
        }
      });
    }
  }

  private async enrichEvent(event: TrackingEvent): Promise<any> {
    const platformInfo = await this.getPlatformInfo();

    return {
      ...event,
      eventName: this.config?.tracking.eventPrefix
        ? `${this.config.tracking.eventPrefix}_${event.eventName}`
        : event.eventName,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId,
      platform: event.platform || platformInfo.platform,
      platformVersion: platformInfo.platformVersion,
      appVersion: platformInfo.appVersion,
      buildNumber: platformInfo.buildNumber,
      device: platformInfo.device,
      network: platformInfo.network,
      userProperties: { ...this.userProperties, ...event.userProperties },
      userJourney: this.userJourney.slice(-5),
    };
  }

  private async updateDeviceInfo(): Promise<void> {
    this.deviceInfo = await this.getDeviceInfo();
  }

  private async updateNetworkInfo(): Promise<void> {
    this.networkInfo = await this.getNetworkInfo();
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    const info = await Device.getInfo();
    const id = await Device.getId();

    const deviceInfo: DeviceInfo = {
      deviceId: id.identifier || 'unknown',
      model: info.model || 'unknown',
      manufacturer: info.manufacturer,
      operatingSystem: info.operatingSystem,
      osVersion: info.osVersion || 'unknown',
      isSimulator: info.isVirtual,
      memorySize: (info as any).memUsed,
      diskFree: (info as any).diskFree,
      batteryLevel: (info as any).batteryLevel,
    };

    // Add web-specific info
    if (this.isWeb()) {
      deviceInfo.screen = {
        width: window.screen.width,
        height: window.screen.height,
        scale: window.devicePixelRatio || 1,
      };
    }

    return deviceInfo;
  }

  private async getNetworkInfo(): Promise<NetworkInfo> {
    const status = await Network.getStatus();

    const networkInfo: NetworkInfo = {
      isOnline: status.connected,
      connectionType: status.connectionType as any,
    };

    // Add web-specific network info
    if (this.isWeb() && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        networkInfo.downloadSpeed = connection.downlink;
        networkInfo.effectiveType = connection.effectiveType;
      }
    }

    return networkInfo;
  }

  private setupGlobalErrorHandler(): void {
    // Browser error handler
    if (this.isWeb()) {
      window.addEventListener('error', (event) => {
        this.trackError({
          message: event.message,
          stack: event.error?.stack,
          severity: 'error',
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          severity: 'error',
        });
      });
    }
  }

  private async initializeAnalytics(): Promise<void> {
    // Initialize Firebase Analytics
    if (this.config?.tracking.analytics?.firebase && this.config.firebase) {
      try {
        // Firebase would be initialized here
        // Firebase initialization with config
      } catch (error) {
        console.warn('Firebase initialization failed:', error);
      }
    }

    // Initialize Amplitude
    if (this.config?.tracking.analytics?.amplitude) {
      try {
        const amplitude = await import('@amplitude/analytics-browser');
        amplitude.init(this.config.tracking.analytics.amplitude.apiKey);
      } catch (error) {
        console.warn('Amplitude initialization failed:', error);
      }
    }

    // Initialize Microsoft Clarity
    if (this.config?.tracking.analytics?.clarity) {
      try {
        const Clarity = (await import('@microsoft/clarity')).default;
        Clarity.init(this.config.tracking.analytics.clarity.projectId);
      } catch (error) {
        console.warn('Clarity initialization failed:', error);
      }
    }
  }

  private async initializeErrorTracking(): Promise<void> {
    // Initialize Sentry
    if (this.config?.tracking.errorTracking?.sentry) {
      try {
        const Sentry = await import('@sentry/react');
        Sentry.init(this.config.tracking.errorTracking.sentry);
      } catch (error) {
        console.warn('Sentry initialization failed:', error);
      }
    }
  }

  // Analytics provider methods
  private async sendToFirebaseAnalytics(event: any): Promise<void> {
    try {
      // Firebase would be initialized here
      // Firebase log event: event.eventName with parameters
    } catch (error) {
      console.warn('Firebase Analytics error:', error);
    }
  }

  private async sendToAmplitude(event: any): Promise<void> {
    try {
      const amplitude = await import('@amplitude/analytics-browser');
      amplitude.track(event.eventName, event.parameters);
    } catch (error) {
      console.warn('Amplitude error:', error);
    }
  }

  private async sendToClarity(event: any): Promise<void> {
    try {
      const Clarity = (await import('@microsoft/clarity')).default;
      Clarity.event(event.eventName);
    } catch (error) {
      console.warn('Clarity error:', error);
    }
  }

  private async sendToCustomAnalytics(event: any): Promise<void> {
    const config = this.config?.tracking.analytics?.custom;
    if (!config) return;

    try {
      const transformedEvent = config.transformEvent
        ? config.transformEvent(event)
        : event;

      await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify(transformedEvent),
      });
    } catch (error) {
      console.warn('Custom analytics error:', error);
    }
  }

  // Error tracking provider methods
  private async sendToSentry(error: any): Promise<void> {
    try {
      const Sentry = await import('@sentry/react');
      Sentry.captureException(new Error(error.message), {
        contexts: {
          device: error.deviceInfo,
          network: error.networkInfo,
        },
        extra: error.context,
        level: error.severity,
      });
    } catch (err) {
      console.warn('Sentry error:', err);
    }
  }

  private async sendToCrashlytics(error: any): Promise<void> {
    try {
      // Firebase would be initialized here
      // FirebaseKit.recordException would be called with error details
    } catch (err) {
      console.warn('Crashlytics error:', err);
    }
  }

  private async sendToCustomError(error: any): Promise<void> {
    const config = this.config?.tracking.errorTracking?.custom;
    if (!config) return;

    try {
      const transformedError = config.transformError
        ? config.transformError(error)
        : error;

      await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify(transformedError),
      });
    } catch (err) {
      console.warn('Custom error tracking error:', err);
    }
  }

  // Firebase user properties
  private async setFirebaseUserProperties(properties: UserProperties): Promise<void> {
    try {
      // Firebase would be initialized here
      // FirebaseKit.setUserProperties would be called with properties
    } catch (error) {
      console.warn('Firebase user properties error:', error);
    }
  }

  private async setAmplitudeUserProperties(properties: UserProperties): Promise<void> {
    try {
      const amplitude = await import('@amplitude/analytics-browser');
      const identify = new amplitude.Identify();
      
      Object.entries(properties).forEach(([key, value]) => {
        if (value !== undefined) {
          identify.set(key, value);
        }
      });

      amplitude.identify(identify);
    } catch (error) {
      console.warn('Amplitude user properties error:', error);
    }
  }

  // Performance tracing
  private async startFirebaseTrace(name: string): Promise<void> {
    try {
      // Firebase would be initialized here
      // FirebaseKit.startTrace would be called with name
    } catch (error) {
      console.warn('Firebase trace start error:', error);
    }
  }

  private async stopFirebaseTrace(name: string, metrics?: Record<string, number>): Promise<void> {
    try {
      // Firebase would be initialized here
      // FirebaseKit.stopTrace would be called with name and metrics
    } catch (error) {
      console.warn('Firebase trace stop error:', error);
    }
  }

  // Offline queue management
  private async loadOfflineQueue(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'buildkit_offline_queue' });
      if (value) {
        this.offlineQueue = JSON.parse(value);
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await Preferences.set({
        key: 'buildkit_offline_queue',
        value: JSON.stringify(this.offlineQueue),
      });
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }

  private async addToOfflineQueue(event: any): Promise<void> {
    this.offlineQueue.push(event);

    // Limit queue size
    if (this.config?.offline?.queueSize && this.offlineQueue.length > this.config.offline.queueSize) {
      this.offlineQueue = this.offlineQueue.slice(-this.config.offline.queueSize);
    }

    await this.saveOfflineQueue();
  }

  private startOfflineSync(interval: number): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.networkInfo?.isOnline && this.offlineQueue.length > 0) {
        this.syncOfflineQueue();
      }
    }, interval);
  }

  private async sendEvent(event: any): Promise<void> {
    // Send to all configured analytics providers
    const promises = [];

    if (this.config?.tracking.analytics?.firebase) {
      promises.push(this.sendToFirebaseAnalytics(event));
    }

    if (this.config?.tracking.analytics?.amplitude) {
      promises.push(this.sendToAmplitude(event));
    }

    if (this.config?.tracking.analytics?.clarity) {
      promises.push(this.sendToClarity(event));
    }

    if (this.config?.tracking.analytics?.custom) {
      promises.push(this.sendToCustomAnalytics(event));
    }

    await Promise.all(promises);
  }

  // Session management
  private async saveSessionState(): Promise<void> {
    try {
      await Preferences.set({
        key: 'buildkit_session_state',
        value: JSON.stringify({
          sessionId: this.sessionId,
          sessionStartTime: this.sessionStartTime,
          userJourney: this.userJourney,
        }),
      });
    } catch (error) {
      console.warn('Failed to save session state:', error);
    }
  }

  private async getLastSyncAttempt(): Promise<number | undefined> {
    try {
      const { value } = await Preferences.get({ key: 'buildkit_last_sync_attempt' });
      return value ? parseInt(value) : undefined;
    } catch {
      return undefined;
    }
  }

  private async getLastSyncSuccess(): Promise<number | undefined> {
    try {
      const { value } = await Preferences.get({ key: 'buildkit_last_sync_success' });
      return value ? parseInt(value) : undefined;
    } catch {
      return undefined;
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isWeb(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private async getPlatformType(): Promise<'ios' | 'android' | 'web'> {
    const info = await Device.getInfo();
    return info.platform as 'ios' | 'android' | 'web';
  }

  private addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push(breadcrumb);
    
    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs = this.breadcrumbs.slice(-100);
    }
  }
}