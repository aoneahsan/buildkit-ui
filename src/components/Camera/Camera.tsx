import React, { useCallback, useState } from 'react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { TrackedWrapper } from '../base/TrackedWrapper';
import { trackEvent, trackErrorEvent } from '../../tracking';
import { clsx } from 'clsx';

export interface CameraProps {
  className?: string;
  resultType?: CameraResultType;
  source?: CameraSource;
  quality?: number;
  allowEditing?: boolean;
  width?: number;
  height?: number;
  onPhotoCapture?: (photo: Photo) => void;
  onError?: (error: Error) => void;
  buttonLabel?: string;
  showPreview?: boolean;
  previewClassName?: string;
  disabled?: boolean;
}

export const Camera: React.FC<CameraProps> = ({
  className,
  resultType = CameraResultType.Uri,
  source = CameraSource.Camera,
  quality = 90,
  allowEditing = false,
  width,
  height,
  onPhotoCapture,
  onError,
  buttonLabel = 'Take Photo',
  showPreview = true,
  previewClassName,
  disabled = false,
}) => {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Track capture attempt
      await trackEvent({
        eventName: 'camera_capture_attempt',
        componentType: 'Camera',
        parameters: {
          source,
          resultType,
          quality,
          allowEditing,
        },
      });

      const options: ImageOptions = {
        resultType,
        source,
        quality,
        allowEditing,
        width,
        height,
      };

      const capturedPhoto = await CapacitorCamera.getPhoto(options);
      
      setPhoto(capturedPhoto);
      
      // Track successful capture
      await trackEvent({
        eventName: 'camera_capture_success',
        componentType: 'Camera',
        parameters: {
          format: capturedPhoto.format,
          saved: capturedPhoto.saved,
          source,
        },
      });

      if (onPhotoCapture) {
        onPhotoCapture(capturedPhoto);
      }
    } catch (error: any) {
      // Handle permission errors
      if (error.message?.includes('permission')) {
        setShowPermissionDialog(true);
        
        await trackEvent({
          eventName: 'camera_permission_denied',
          componentType: 'Camera',
        });
      } else {
        await trackErrorEvent(
          error,
          'Camera',
          { action: 'capture', source }
        );
      }

      if (onError) {
        onError(error);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [source, resultType, quality, allowEditing, width, height, onPhotoCapture, onError]);

  const handlePermissionRequest = useCallback(async () => {
    try {
      const permissions = await CapacitorCamera.requestPermissions();
      
      await trackEvent({
        eventName: 'camera_permission_request',
        componentType: 'Camera',
        parameters: {
          camera: permissions.camera,
          photos: permissions.photos,
        },
      });

      setShowPermissionDialog(false);
      
      if (permissions.camera === 'granted') {
        await handleCapture();
      }
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
    }
  }, [handleCapture]);

  const handleClearPhoto = useCallback(() => {
    setPhoto(null);
    
    void trackEvent({
      eventName: 'camera_photo_cleared',
      componentType: 'Camera',
    });
  }, []);

  return (
    <TrackedWrapper componentType="Camera" className={clsx('buildkit-camera', className)}>
      <div className="camera-container">
        {showPreview && photo && (
          <div className={clsx('camera-preview', previewClassName)}>
            <img 
              src={photo.webPath || photo.base64String} 
              alt="Captured" 
              className="camera-preview-image"
            />
            <Button
              label="Clear"
              icon="pi pi-times"
              className="p-button-sm p-button-text camera-clear-btn"
              onClick={handleClearPhoto}
              aria-label="Clear captured photo"
            />
          </div>
        )}
        
        <Button
          label={buttonLabel}
          icon="pi pi-camera"
          onClick={handleCapture}
          loading={isCapturing}
          disabled={disabled || isCapturing}
          className="camera-capture-btn"
          aria-label={buttonLabel}
        />
      </div>

      <Dialog
        header="Camera Permission Required"
        visible={showPermissionDialog}
        onHide={() => setShowPermissionDialog(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setShowPermissionDialog(false)}
            />
            <Button
              label="Grant Permission"
              onClick={handlePermissionRequest}
            />
          </div>
        }
      >
        <p>This app needs camera permission to take photos. Please grant permission to continue.</p>
      </Dialog>
    </TrackedWrapper>
  );
};