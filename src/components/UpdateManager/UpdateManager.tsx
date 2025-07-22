import React, { useCallback, useEffect, useState } from 'react';
import { Dialog } from '../Dialog';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';
import { TrackedWrapper } from '../base/TrackedWrapper';
import { 
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  getCurrentVersion,
  type UpdateInfo,
  type UpdateProgress
} from '../../integrations/native-update';
import { trackEvent } from '../../tracking';
import { clsx } from 'clsx';

export interface UpdateManagerProps {
  className?: string;
  autoCheck?: boolean;
  checkInterval?: number; // in milliseconds
  showCurrentVersion?: boolean;
  customTitle?: string;
  customMessage?: string;
  mandatoryMessage?: string;
  showProgressBar?: boolean;
  onUpdateAvailable?: (updateInfo: UpdateInfo) => void;
  onUpdateComplete?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

export const UpdateManager: React.FC<UpdateManagerProps> = ({
  className,
  autoCheck = true,
  checkInterval = 3600000, // 1 hour default
  showCurrentVersion = true,
  customTitle = 'Update Available',
  customMessage = 'A new version of the app is available. Would you like to update now?',
  mandatoryMessage = 'This update is required to continue using the app.',
  showProgressBar = true,
  onUpdateAvailable,
  onUpdateComplete,
  onError,
  children,
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Get current version on mount
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await getCurrentVersion();
        setCurrentVersion(version);
      } catch (error) {
        console.error('Failed to get current version:', error);
      }
    };

    if (showCurrentVersion) {
      void fetchVersion();
    }
  }, [showCurrentVersion]);

  // Check for updates
  const handleCheckForUpdate = useCallback(async () => {
    try {
      const info = await checkForUpdate();
      
      if (info && info.updateAvailable) {
        setUpdateInfo(info);
        setShowDialog(true);
        
        if (onUpdateAvailable) {
          onUpdateAvailable(info);
        }

        await trackEvent({
          eventName: 'update_manager_update_available',
          componentType: 'UpdateManager',
          parameters: {
            currentVersion,
            newVersion: info.version,
            mandatory: info.mandatory,
          },
        });
      }
    } catch (error: any) {
      console.error('Failed to check for update:', error);
      setError(error.message);
      
      if (onError) {
        onError(error);
      }
    }
  }, [currentVersion, onUpdateAvailable, onError]);

  // Auto check for updates
  useEffect(() => {
    if (!autoCheck) {
      return undefined;
    }

    // Initial check
    void handleCheckForUpdate();

    // Set up interval
    const interval = setInterval(() => {
      void handleCheckForUpdate();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [autoCheck, checkInterval, handleCheckForUpdate]);

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!updateInfo) return;

    try {
      setError(null);
      
      // Download update
      setIsDownloading(true);
      await downloadUpdate((progress: UpdateProgress) => {
        setDownloadProgress(progress.percent);
      });
      setIsDownloading(false);

      // Install update
      setIsInstalling(true);
      const result = await installUpdate();
      
      if (result.success) {
        await trackEvent({
          eventName: 'update_manager_update_complete',
          componentType: 'UpdateManager',
          parameters: {
            fromVersion: currentVersion,
            toVersion: updateInfo.version,
            requiresRestart: result.requiresRestart,
          },
        });

        if (onUpdateComplete) {
          onUpdateComplete();
        }

        setShowDialog(false);
        
        if (result.requiresRestart) {
          // App will restart automatically
        }
      } else {
        throw new Error('Update installation failed');
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      setError(error.message);
      
      await trackEvent({
        eventName: 'update_manager_update_failed',
        componentType: 'UpdateManager',
        parameters: {
          error: error.message,
          stage: isDownloading ? 'download' : 'install',
        },
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setIsDownloading(false);
      setIsInstalling(false);
      setDownloadProgress(0);
    }
  }, [updateInfo, currentVersion, onUpdateComplete, onError, isDownloading]);

  const handleCancel = useCallback(() => {
    if (updateInfo?.mandatory) {
      // Can't cancel mandatory updates
      return;
    }

    setShowDialog(false);
    setError(null);
    
    void trackEvent({
      eventName: 'update_manager_update_cancelled',
      componentType: 'UpdateManager',
      parameters: {
        version: updateInfo?.version,
      },
    });
  }, [updateInfo]);

  const isUpdating = isDownloading || isInstalling;
  const message = updateInfo?.mandatory ? mandatoryMessage : customMessage;

  return (
    <TrackedWrapper 
      componentType="UpdateManager" 
      className={clsx('buildkit-update-manager', className)}
    >
      {children || (
        <div className="update-manager-content">
          {showCurrentVersion && currentVersion && (
            <div className="current-version">
              Current Version: {currentVersion}
            </div>
          )}
          <Button
            label="Check for Updates"
            icon="pi pi-refresh"
            onClick={handleCheckForUpdate}
            className="check-update-btn"
          />
        </div>
      )}

      <Dialog
        header={customTitle}
        visible={showDialog}
        onHide={handleCancel}
        modal
        closable={!updateInfo?.mandatory && !isUpdating}
        className="update-manager-dialog"
        footer={
          !isUpdating && (
            <div className="update-manager-footer">
              {!updateInfo?.mandatory && (
                <Button
                  label="Later"
                  className="p-button-text"
                  onClick={handleCancel}
                />
              )}
              <Button
                label="Update Now"
                icon="pi pi-download"
                onClick={handleUpdate}
                disabled={!!error}
              />
            </div>
          )
        }
      >
        <div className="update-manager-dialog-content">
          <p className="update-message">{message}</p>
          
          {updateInfo && (
            <div className="update-info">
              <div className="version-info">
                <span className="label">New Version:</span>
                <span className="value">{updateInfo.version}</span>
              </div>
              {updateInfo.releaseNotes && (
                <div className="release-notes">
                  <h4>What's New:</h4>
                  <p>{updateInfo.releaseNotes}</p>
                </div>
              )}
            </div>
          )}

          {isUpdating && (
            <div className="update-progress">
              <div className="progress-status">
                {isDownloading && 'Downloading update...'}
                {isInstalling && 'Installing update...'}
              </div>
              {showProgressBar && isDownloading && (
                <ProgressBar value={downloadProgress} showValue />
              )}
            </div>
          )}

          {error && (
            <div className="update-error p-error">
              <i className="pi pi-exclamation-triangle" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </Dialog>
    </TrackedWrapper>
  );
};