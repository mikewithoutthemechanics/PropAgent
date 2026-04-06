/**
 * TypeScript Types for Image Upload System
 */

// =============================================================================
// Image Metadata
// =============================================================================

export interface ImageMetadata {
  width: number;
  height: number;
  original_width?: number;
  original_height?: number;
  format: string;
  size_bytes?: number;
}

// =============================================================================
// Property Image
// =============================================================================

export interface PropertyImage {
  id: string;
  url: string;
  thumbnail_url: string;
  storage_key: string;
  thumbnail_storage_key: string;
  order: number;
  uploaded_at: string;
  original_name?: string;
  metadata?: ImageMetadata;
}

// =============================================================================
// Upload Response
// =============================================================================

export interface UploadResult {
  originalName: string;
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  order?: number;
  error?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    uploaded: number;
    failed: number;
    results: UploadResult[];
    propertyImages: PropertyImage[];
  };
  error?: string;
  details?: string;
}

// =============================================================================
// Reorder Request/Response
// =============================================================================

export interface ImageOrderItem {
  imageId: string;
  order: number;
}

export interface ReorderResponse {
  success: boolean;
  data?: {
    reordered: boolean;
    images: PropertyImage[];
    mainImageUrl: string | null;
  };
  error?: string;
  details?: string;
}

// =============================================================================
// Delete Response
// =============================================================================

export interface DeleteImageResponse {
  success: boolean;
  data?: {
    deleted: boolean;
    imageId: string;
    remainingImages: number;
  };
  error?: string;
  details?: string;
}

// =============================================================================
// Set Main Image Response
// =============================================================================

export interface SetMainImageResponse {
  success: boolean;
  data?: {
    mainImageUrl: string;
    imageId: string;
  };
  error?: string;
  details?: string;
}

// =============================================================================
// Upload Hook State
// =============================================================================

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: UploadResult;
}

export interface UseImageUploadOptions {
  propertyId: string;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  onSuccess?: (response: ImageUploadResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseImageUploadReturn {
  files: UploadFile[];
  isUploading: boolean;
  overallProgress: number;
  addFiles: (newFiles: FileList | null) => void;
  removeFile: (fileId: string) => void;
  upload: () => Promise<ImageUploadResponse | undefined>;
  reorderFiles: (oldIndex: number, newIndex: number) => void;
  clearFiles: () => void;
  setMainImage: (imageId: string) => Promise<SetMainImageResponse | undefined>;
  deleteImage: (imageId: string) => Promise<DeleteImageResponse | undefined>;
  reorderImages: (imageOrders: ImageOrderItem[]) => Promise<ReorderResponse | undefined>;
}

// =============================================================================
// Gallery Props
// =============================================================================

export interface ImageGalleryProps {
  images: PropertyImage[];
  mainImageUrl?: string | null;
  propertyId: string;
  editable?: boolean;
  onImageDelete?: (imageId: string) => void;
  onImageSetMain?: (imageId: string) => void;
  onImagesReorder?: (images: PropertyImage[]) => void;
  className?: string;
  showThumbnails?: boolean;
  enableLightbox?: boolean;
}

// =============================================================================
// Image Uploader Props
// =============================================================================

export interface ImageUploaderProps {
  propertyId: string;
  existingImages?: PropertyImage[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onUploadComplete?: (images: PropertyImage[]) => void;
  onUploadError?: (error: Error) => void;
  onImagesChange?: (images: PropertyImage[]) => void;
  className?: string;
}

// =============================================================================
// Gallery State
// =============================================================================

export interface GalleryState {
  currentIndex: number;
  isLightboxOpen: boolean;
  isFullscreen: boolean;
  scale: number;
  panPosition: { x: number; y: number };
}

// =============================================================================
// Drag and Drop Types
// =============================================================================

export interface DraggableImageItem {
  id: string;
  index: number;
}

export interface DropResult {
  source: DraggableImageItem;
  destination: DraggableImageItem | null;
}

// =============================================================================
// API Error
// =============================================================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
