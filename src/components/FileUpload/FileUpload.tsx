import React, { useCallback, useRef, useState } from 'react';
import { FileUpload as PrimeFileUpload, FileUploadProps as PrimeFileUploadProps } from 'primereact/fileupload';
import { TrackedWrapper } from '../base/TrackedWrapper';
import { trackEvent, trackErrorEvent } from '../../tracking';
import { clsx } from 'clsx';

export interface FileUploadProps extends Omit<PrimeFileUploadProps, 'customUpload' | 'uploadHandler' | 'onError' | 'onUpload'> {
  className?: string;
  onUpload?: (files: File[]) => void | Promise<void>;
  onError?: (error: Error) => void;
  maxFileSize?: number;
  accept?: string;
  multiple?: boolean;
  auto?: boolean;
  trackingMetadata?: Record<string, any>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  className,
  onUpload,
  onError,
  maxFileSize = 10485760, // 10MB default
  accept,
  multiple = false,
  auto = false,
  trackingMetadata,
  ...props
}) => {
  const fileUploadRef = useRef<PrimeFileUpload>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (event: any) => {
    const files = event.files as File[];
    
    if (!files || files.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      
      // Track upload attempt
      await trackEvent({
        eventName: 'file_upload_attempt',
        componentType: 'FileUpload',
        parameters: {
          fileCount: files.length,
          totalSize: files.reduce((sum, file) => sum + file.size, 0),
          fileTypes: files.map(f => f.type),
          ...trackingMetadata,
        },
      });

      // Call custom upload handler if provided
      if (onUpload) {
        await onUpload(files);
      }

      // Track successful upload
      await trackEvent({
        eventName: 'file_upload_success',
        componentType: 'FileUpload',
        parameters: {
          fileCount: files.length,
          fileNames: files.map(f => f.name),
          ...trackingMetadata,
        },
      });

      // Clear the file upload component
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }

      setUploadProgress(100);
    } catch (error: any) {
      await trackErrorEvent(
        error,
        'FileUpload',
        { 
          action: 'upload',
          fileCount: files.length,
          ...trackingMetadata,
        }
      );

      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onUpload, onError, trackingMetadata]);

  const handleSelect = useCallback(async (event: any) => {
    const files = event.files as File[];
    
    await trackEvent({
      eventName: 'file_select',
      componentType: 'FileUpload',
      parameters: {
        fileCount: files.length,
        fileNames: files.map(f => f.name),
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        ...trackingMetadata,
      },
    });
  }, [trackingMetadata]);

  const handleRemove = useCallback(async (event: any) => {
    const file = event.file as File;
    
    await trackEvent({
      eventName: 'file_remove',
      componentType: 'FileUpload',
      parameters: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ...trackingMetadata,
      },
    });
  }, [trackingMetadata]);

  const handleError = useCallback(async (event: any) => {
    const error = new Error(event.error || 'File upload failed');
    
    await trackErrorEvent(
      error,
      'FileUpload',
      {
        action: 'validation',
        ...trackingMetadata,
      }
    );

    if (onError) {
      onError(error);
    }
  }, [onError, trackingMetadata]);

  const handleProgress = useCallback((event: any) => {
    if (event.originalEvent && event.originalEvent.loaded && event.originalEvent.total) {
      const progress = Math.round((event.originalEvent.loaded / event.originalEvent.total) * 100);
      setUploadProgress(progress);
    }
  }, []);

  return (
    <TrackedWrapper 
      componentType="FileUpload" 
      className={clsx('buildkit-file-upload', className)}
    >
      <PrimeFileUpload
        ref={fileUploadRef}
        customUpload
        uploadHandler={handleUpload}
        onSelect={handleSelect}
        onRemove={handleRemove}
        onError={handleError}
        onProgress={handleProgress}
        maxFileSize={maxFileSize}
        accept={accept}
        multiple={multiple}
        auto={auto}
        disabled={isUploading}
        progressBarTemplate={
          uploadProgress > 0 ? (
            <div className="p-progressbar p-component">
              <div 
                className="p-progressbar-value p-progressbar-value-animate"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          ) : undefined
        }
        {...props}
      />
    </TrackedWrapper>
  );
};