/**
 * useImageUpload Hook
 * 
 * Custom React hook for managing image uploads, reordering, and deletion
 * for property listings in agent-loop
 */

import { useState, useCallback, useMemo } from 'react';
import {
  UploadFile,
  UseImageUploadOptions,
  UseImageUploadReturn,
  ImageUploadResponse,
  UploadResult,
  PropertyImage,
  ImageOrderItem,
  ReorderResponse,
  DeleteImageResponse,
  SetMainImageResponse,
} from '@/types/images';

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Generate a unique ID for upload files
 */
function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file before adding to upload queue
 */
function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" not allowed. Allowed types: ${allowedTypes.map(t => t.replace('image/', '')).join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Create a preview URL for an image file
 */
function createPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useImageUpload({
  propertyId,
  maxFiles = 20,
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  onSuccess,
  onError,
}: UseImageUploadOptions): UseImageUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  /**
   * Add files to the upload queue
   */
  const addFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      onError?.(new Error(`Maximum number of files (${maxFiles}) reached`));
      return;
    }

    const filesToProcess = Array.from(newFiles).slice(0, remainingSlots);
    const newUploadFiles: UploadFile[] = [];

    for (const file of filesToProcess) {
      // Check for duplicates
      const isDuplicate = files.some(
        f => f.name === file.name && f.size === file.size
      );
      if (isDuplicate) continue;

      // Validate file
      const validation = validateFile(file, maxSize, allowedTypes);
      
      const uploadFile: UploadFile = {
        id: generateFileId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.valid ? undefined : validation.error,
      };

      // Create preview for valid image files
      if (validation.valid) {
        try {
          uploadFile.preview = await createPreview(file);
        } catch {
          // Preview creation failed, continue without preview
        }
      }

      newUploadFiles.push(uploadFile);
    }

    setFiles(prev => [...prev, ...newUploadFiles]);
  }, [files, maxFiles, maxSize, allowedTypes, onError]);

  /**
   * Remove a file from the upload queue
   */
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  /**
   * Clear all files from the upload queue
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
    setOverallProgress(0);
  }, []);

  /**
   * Reorder files in the upload queue
   */
  const reorderFiles = useCallback((oldIndex: number, newIndex: number) => {
    setFiles(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  /**
   * Upload files to the server
   */
  const upload = useCallback(async (): Promise<ImageUploadResponse | undefined> => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      onError?.(new Error('No pending files to upload'));
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);

    const formData = new FormData();
    formData.append('propertyId', propertyId);
    
    pendingFiles.forEach(uploadFile => {
      formData.append('images', uploadFile.file);
    });

    try {
      // Update status to uploading
      setFiles(prev =>
        prev.map(f =>
          f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
        )
      );

      const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });

      const result: ImageUploadResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update file statuses based on results
      setFiles(prev =>
        prev.map(f => {
          const uploadResult = result.data?.results.find(
            r => r.originalName === f.name
          );
          
          if (uploadResult) {
            return {
              ...f,
              status: uploadResult.success ? 'success' : 'error',
              error: uploadResult.error,
              result: uploadResult.success ? uploadResult : undefined,
              progress: uploadResult.success ? 100 : 0,
            };
          }
          return f;
        })
      );

      setOverallProgress(100);
      onSuccess?.(result);
      
      // Clear successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
      }, 3000);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev =>
        prev.map(f =>
          f.status === 'uploading'
            ? { ...f, status: 'error', error: errorMessage }
            : f
        )
      );
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsUploading(false);
    }
  }, [files, propertyId, onSuccess, onError]);

  /**
   * Delete an image from the property
   */
  const deleteImage = useCallback(async (
    imageId: string
  ): Promise<DeleteImageResponse | undefined> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/images/${propertyId}/${imageId}`,
        { method: 'DELETE' }
      );

      const result: DeleteImageResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      onError?.(new Error(errorMessage));
      return undefined;
    }
  }, [propertyId, onError]);

  /**
   * Set an image as the main/cover image
   */
  const setMainImage = useCallback(async (
    imageId: string
  ): Promise<SetMainImageResponse | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/set-main`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, imageId }),
      });

      const result: SetMainImageResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to set main image');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set main image';
      onError?.(new Error(errorMessage));
      return undefined;
    }
  }, [propertyId, onError]);

  /**
   * Reorder images for a property
   */
  const reorderImages = useCallback(async (
    imageOrders: ImageOrderItem[]
  ): Promise<ReorderResponse | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, imageOrders }),
      });

      const result: ReorderResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Reorder failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reorder failed';
      onError?.(new Error(errorMessage));
      return undefined;
    }
  }, [propertyId, onError]);

  return useMemo(
    () => ({
      files,
      isUploading,
      overallProgress,
      addFiles,
      removeFile,
      upload,
      reorderFiles,
      clearFiles,
      setMainImage,
      deleteImage,
      reorderImages,
    }),
    [
      files,
      isUploading,
      overallProgress,
      addFiles,
      removeFile,
      upload,
      reorderFiles,
      clearFiles,
      setMainImage,
      deleteImage,
      reorderImages,
    ]
  );
}
