'use client';

/**
 * ImageUploader Component
 * 
 * Drag & drop image upload component for property listings
 * Features:
 * - Multiple file upload
 * - Image preview
 * - Progress indicator
 * - Reorder images (drag & drop)
 * - Set main/cover image
 * - Delete images
 * - File validation
 */

import React, { useCallback, useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Star, 
  GripVertical, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Move
} from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  ImageUploaderProps,
  PropertyImage,
  UploadFile,
} from '@/types/images';
import { cn } from '@/lib/utils';

// Default configuration
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ImageUploader({
  propertyId,
  existingImages = [],
  maxFiles = 20,
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  onUploadComplete,
  onUploadError,
  onImagesChange,
  className,
}: ImageUploaderProps) {
  const [images, setImages] = useState<PropertyImage[]>(existingImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isUploading,
    overallProgress,
    addFiles,
    removeFile,
    upload,
    deleteImage,
    setMainImage,
    reorderImages,
    clearFiles,
  } = useImageUpload({
    propertyId,
    maxFiles,
    maxSize,
    allowedTypes,
    onSuccess: (response) => {
      if (response.data?.propertyImages) {
        setImages(response.data.propertyImages);
        onUploadComplete?.(response.data.propertyImages);
        onImagesChange?.(response.data.propertyImages);
      }
    },
    onError: (error) => {
      onUploadError?.(error);
    },
  });

  // Combine existing images with pending uploads
  const allImages = [...images, ...files.filter(f => f.preview).map(f => ({
    id: f.id,
    url: f.preview!,
    thumbnail_url: f.preview!,
    storage_key: '',
    thumbnail_storage_key: '',
    order: 0,
    uploaded_at: new Date().toISOString(),
    isPending: true,
    uploadStatus: f.status,
    uploadProgress: f.progress,
    uploadError: f.error,
  }))] as (PropertyImage & { 
    isPending?: boolean; 
    uploadStatus?: string;
    uploadProgress?: number;
    uploadError?: string;
  })[];

  // Drag and drop handlers for file upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  // Delete image handler
  const handleDelete = useCallback(async (imageId: string, isPending: boolean) => {
    if (isPending) {
      removeFile(imageId);
      return;
    }

    if (confirm('Are you sure you want to delete this image?')) {
      const result = await deleteImage(imageId);
      if (result?.success) {
        const updatedImages = images.filter(img => img.id !== imageId);
        setImages(updatedImages);
        onImagesChange?.(updatedImages);
      }
    }
  }, [images, deleteImage, removeFile, onImagesChange]);

  // Set main image handler
  const handleSetMain = useCallback(async (imageId: string, isPending: boolean) => {
    if (isPending) return;

    const result = await setMainImage(imageId);
    if (result?.success) {
      // Reorder to put main image first
      const imageIndex = images.findIndex(img => img.id === imageId);
      if (imageIndex > 0) {
        const newImages = [...images];
        const [movedImage] = newImages.splice(imageIndex, 1);
        newImages.unshift(movedImage);
        
        // Update order property
        const reordered = newImages.map((img, idx) => ({
          ...img,
          order: idx + 1,
        }));
        
        setImages(reordered);
        onImagesChange?.(reordered);

        // Sync with server
        reorderImages(reordered.map(img => ({
          imageId: img.id,
          order: img.order,
        })));
      }
    }
  }, [images, setMainImage, reorderImages, onImagesChange]);

  // Drag and drop handlers for reordering
  const handleImageDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleImageDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newImages = [...images];
      const [movedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, movedImage);
      
      // Update order property
      const reordered = newImages.map((img, idx) => ({
        ...img,
        order: idx + 1,
      }));
      
      setImages(reordered);
      onImagesChange?.(reordered);

      // Sync with server
      reorderImages(reordered.map(img => ({
        imageId: img.id,
        order: img.order,
      })));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, images, reorderImages, onImagesChange]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Check if image is main image
  const isMainImage = (image: typeof allImages[0]) => {
    if (image.isPending) return false;
    const firstUploaded = images.find(img => !allImages.some(f => f.id === img.id && f.isPending));
    return image.id === firstUploaded?.id || images[0]?.id === image.id;
  };

  const remainingSlots = maxFiles - images.length - files.filter(f => f.status === 'pending').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Drop Zone */}
      {remainingSlots > 0 && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            'dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-muted-foreground">
              Supports: JPG, PNG, WebP (Max {formatFileSize(maxSize)} each)
            </div>
            <div className="text-xs text-muted-foreground">
              {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Uploading...</span>
            <span className="text-muted-foreground">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Summary */}
      {files.some(f => f.status === 'error') && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {files.filter(f => f.status === 'error').length} upload(s) failed
            </span>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {allImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Images ({images.length} uploaded
              {files.filter(f => f.status === 'pending').length > 0 &&
                `, ${files.filter(f => f.status === 'pending').length} pending`
              })
            </h4>
            {files.length > 0 && (
              <button
                onClick={clearFiles}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear pending
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allImages.map((image, index) => {
              const isMain = index === 0 && !image.isPending;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={image.id}
                  draggable={!image.isPending}
                  onDragStart={() => handleImageDragStart(index)}
                  onDragOver={(e) => handleImageDragOver(e, index)}
                  onDragLeave={handleImageDragLeave}
                  onDrop={(e) => handleImageDrop(e, index)}
                  className={cn(
                    'relative group aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    isMain ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-gray-200 dark:border-gray-700',
                    isDragging && 'opacity-50',
                    isDragOver && 'border-primary border-dashed',
                    !image.isPending && 'cursor-move'
                  )}
                >
                  {/* Image */}
                  <img
                    src={image.thumbnail_url || image.url}
                    alt={image.original_name || 'Property image'}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                    {/* Drag Handle */}
                    {!image.isPending && (
                      <div className="absolute top-2 left-2 p-1.5 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3 h-3" />
                      </div>
                    )}

                    {/* Main Image Badge */}
                    {isMain && (
                      <div className="absolute top-2 right-2 p-1.5 bg-yellow-400 rounded text-yellow-900">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Set as Main */}
                      {!isMain && !image.isPending && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMain(image.id, !!image.isPending);
                          }}
                          className="p-1.5 bg-white/90 hover:bg-white rounded text-gray-700 transition-colors"
                          title="Set as main image"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id, !!image.isPending);
                        }}
                        className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded text-white transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Upload Status Overlay */}
                    {image.isPending && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        {image.uploadStatus === 'uploading' && (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        )}
                        {image.uploadStatus === 'error' && (
                          <div className="text-center p-2">
                            <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                            <span className="text-xs text-white line-clamp-2">
                              {image.uploadError || 'Failed'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Badge */}
                  {!image.isPending && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
                      #{index + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          {files.some(f => f.status === 'pending') && !isUploading && (
            <button
              onClick={upload}
              disabled={isUploading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upload {files.filter(f => f.status === 'pending').length} image(s)
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {allImages.length === 0 && remainingSlots === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Maximum number of images reached</p>
        </div>
      )}

      {/* Instructions */}
      {allImages.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Drag images to reorder them</p>
          <p>• The first image is set as the main/cover image</p>
          <p>• Click the star to set an image as main</p>
        </div>
      )}
    </div>
  );
}
