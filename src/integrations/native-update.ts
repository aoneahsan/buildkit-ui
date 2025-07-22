import { CapacitorNativeUpdate, InstallStatus } from 'capacitor-native-update';
import type { 
  AppUpdateInfo,
  LatestVersion,
  SyncResult,
  DownloadProgressEvent
} from 'capacitor-native-update';
import { trackEvent, trackErrorEvent } from '../tracking/tracker';

export interface NativeUpdateConfig {
  trackingEnabled?: boolean;
  autoCheckOnAppStart?: boolean;
  autoDownload?: boolean;
  mandatoryUpdateMessage?: string;
  optionalUpdateMessage?: string;
}

let updateConfig: NativeUpdateConfig = {
  trackingEnabled: true,
  autoCheckOnAppStart: true,
  autoDownload: false,
  mandatoryUpdateMessage: 'A mandatory update is available. Please update to continue using the app.',
  optionalUpdateMessage: 'An update is available. Would you like to update now?',
};

/**
 * Initialize Native Update integration
 */
export async function initializeNativeUpdate(config: NativeUpdateConfig = {}): Promise<void> {
  updateConfig = { ...updateConfig, ...config };
  
  if (config.autoCheckOnAppStart) {
    try {
      await checkForUpdate();
    } catch (error) {
      console.error('Failed to check for update on app start:', error);
    }
  }
}

/**
 * Check for app update
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    // Track update check
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_check_start',
      });
    }

    const appUpdateInfo = await CapacitorNativeUpdate.getAppUpdateInfo();
    const liveUpdate = await CapacitorNativeUpdate.getLatest();
    
    // Convert to our UpdateInfo format
    const updateInfo: UpdateInfo = {
      updateAvailable: appUpdateInfo.updateAvailable || liveUpdate.available,
      version: liveUpdate.version || appUpdateInfo.availableVersion || '',
      mandatory: liveUpdate.mandatory || false,
      storeUrl: liveUpdate.url,
      releaseNotes: liveUpdate.notes,
    };

    // Track update check result
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_check_complete',
        parameters: {
          updateAvailable: updateInfo.updateAvailable,
          version: updateInfo.version,
          mandatory: updateInfo.mandatory,
          storeUrl: updateInfo.storeUrl,
        },
      });
    }

    // Auto download if enabled and update is available
    if (updateConfig.autoDownload && updateInfo.updateAvailable) {
      await downloadUpdate();
    }

    return updateInfo;
  } catch (error) {
    if (updateConfig.trackingEnabled) {
      await trackErrorEvent(
        error as Error,
        'native_update',
        { action: 'check_for_update' }
      );
    }
    throw error;
  }
}

/**
 * Prompt user for update (simulated - actual prompting is done in UI)
 */
export async function promptForUpdate(customMessage?: string): Promise<boolean> {
  try {
    const updateInfo = await checkForUpdate();
    
    if (!updateInfo || !updateInfo.updateAvailable) {
      return false;
    }

    const message = customMessage || 
      (updateInfo.mandatory ? updateConfig.mandatoryUpdateMessage : updateConfig.optionalUpdateMessage);

    // Track prompt display
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_prompt_shown',
        parameters: {
          mandatory: updateInfo.mandatory,
          version: updateInfo.version,
        },
      });
    }

    // Since the actual UI prompt is handled by the UpdateManager component,
    // we just return true if it's mandatory, false otherwise
    const result = { accepted: updateInfo.mandatory };

    // Track user response
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_prompt_response',
        parameters: {
          accepted: result.accepted,
          mandatory: updateInfo.mandatory,
        },
      });
    }

    return result.accepted;
  } catch (error) {
    if (updateConfig.trackingEnabled) {
      await trackErrorEvent(
        error as Error,
        'native_update',
        { action: 'prompt_for_update' }
      );
    }
    return false;
  }
}

/**
 * Download update
 */
export async function downloadUpdate(onProgress?: (progress: UpdateProgress) => void): Promise<void> {
  try {
    // Track download start
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_download_start',
      });
    }

    // Set up progress listener
    const progressListener = await CapacitorNativeUpdate.addListener('downloadProgress', (event: DownloadProgressEvent) => {
      if (onProgress) {
        onProgress({
          percent: event.percent,
          bytesDownloaded: event.bytesDownloaded,
          totalBytes: event.totalBytes,
        });
      }

      // Track download progress milestones
      if (updateConfig.trackingEnabled && event.percent % 25 === 0) {
        void trackEvent({
          eventName: 'app_update_download_progress',
          parameters: {
            percent: event.percent,
            bytesDownloaded: event.bytesDownloaded,
            totalBytes: event.totalBytes,
          },
        });
      }
    });

    // For app store updates, open the store
    const appUpdateInfo = await CapacitorNativeUpdate.getAppUpdateInfo();
    if (appUpdateInfo.updateAvailable) {
      if (appUpdateInfo.immediateUpdateAllowed) {
        await CapacitorNativeUpdate.performImmediateUpdate();
      } else if (appUpdateInfo.flexibleUpdateAllowed) {
        await CapacitorNativeUpdate.startFlexibleUpdate();
      }
    } else {
      // For live updates, use sync
      await CapacitorNativeUpdate.sync();
    }

    // Track download complete
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_download_complete',
      });
    }

    // Remove progress listener
    progressListener.remove();
  } catch (error) {
    if (updateConfig.trackingEnabled) {
      await trackErrorEvent(
        error as Error,
        'native_update',
        { action: 'download_update' }
      );
    }
    throw error;
  }
}

/**
 * Install update
 */
export async function installUpdate(): Promise<UpdateResult> {
  try {
    // Track install start
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_install_start',
      });
    }

    // For app store updates, complete the flexible update if needed
    const appUpdateInfo = await CapacitorNativeUpdate.getAppUpdateInfo();
    if (appUpdateInfo.installStatus === InstallStatus.DOWNLOADED) {
      await CapacitorNativeUpdate.completeFlexibleUpdate();
    }
    
    const result: UpdateResult = {
      success: true,
      requiresRestart: false,
    };

    // Track install result
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_update_install_complete',
        parameters: {
          success: result.success,
          requiresRestart: result.requiresRestart,
        },
      });
    }

    return result;
  } catch (error) {
    if (updateConfig.trackingEnabled) {
      await trackErrorEvent(
        error as Error,
        'native_update',
        { action: 'install_update' }
      );
    }
    throw error;
  }
}

/**
 * Open app store
 */
export async function openAppStore(): Promise<void> {
  try {
    await CapacitorNativeUpdate.openAppStore();
    
    if (updateConfig.trackingEnabled) {
      await trackEvent({
        eventName: 'app_store_opened',
      });
    }
  } catch (error) {
    console.error('Failed to open app store:', error);
    throw error;
  }
}

/**
 * Get current app version
 */
export async function getCurrentVersion(): Promise<string> {
  try {
    const appUpdateInfo = await CapacitorNativeUpdate.getAppUpdateInfo();
    return appUpdateInfo.currentVersion;
  } catch (error) {
    console.error('Failed to get current version:', error);
    return 'Unknown';
  }
}

/**
 * Complete update flow
 */
export async function performUpdate(): Promise<boolean> {
  try {
    // Check for update
    const updateInfo = await checkForUpdate();
    if (!updateInfo || !updateInfo.updateAvailable) {
      return false;
    }

    // Prompt user
    const accepted = await promptForUpdate();
    if (!accepted && !updateInfo.mandatory) {
      return false;
    }

    // Download update
    await downloadUpdate();

    // Install update
    const result = await installUpdate();
    
    return result.success;
  } catch (error) {
    console.error('Update flow failed:', error);
    return false;
  }
}

/**
 * Listen to update events
 */
export async function onUpdateAvailable(callback: (updateInfo: UpdateInfo) => void): Promise<() => void> {
  const handle = await CapacitorNativeUpdate.addListener('updateStateChanged', (event) => {
    // Convert event to UpdateInfo format
    const updateInfo: UpdateInfo = {
      updateAvailable: true,
      version: event.version,
      mandatory: false,
    };
    callback(updateInfo);
  });
  
  return () => {
    handle.remove();
  };
}

// Define our own types since the plugin uses different ones
export interface UpdateInfo {
  updateAvailable: boolean;
  version: string;
  mandatory?: boolean;
  storeUrl?: string;
  releaseNotes?: string;
}

export interface UpdateProgress {
  percent: number;
  bytesDownloaded: number;
  totalBytes: number;
}

export interface UpdateOptions {
  message?: string;
  mandatory?: boolean;
}

export interface UpdateResult {
  success: boolean;
  requiresRestart?: boolean;
}

/**
 * Check for native update (alias for checkForUpdate)
 */
export async function checkForNativeUpdate(): Promise<UpdateInfo | null> {
  return checkForUpdate();
}

/**
 * Download native update (alias for downloadUpdate)
 */
export async function downloadNativeUpdate(onProgress?: (progress: UpdateProgress) => void): Promise<void> {
  return downloadUpdate(onProgress);
}

/**
 * Install native update (alias for installUpdate)
 */
export async function installNativeUpdate(): Promise<UpdateResult> {
  return installUpdate();
}