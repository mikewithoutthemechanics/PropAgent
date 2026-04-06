'use client';

/**
 * ImageGallery Component
 * 
 * Property image gallery with lightbox view, thumbnail navigation,
 * fullscreen mode, and touch/swipe support
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Download,
  Star,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ImageGalleryProps,
  PropertyImage,
} from '@/types/images';

interface GalleryImage extends PropertyImage {
  loaded?: boolean;
}

export function ImageGallery({
  images,
  mainImageUrl,
  propertyId,
  editable = false,
  onImageDelete,
  onImageSetMain,
  onImagesReorder,
  className,
  showThumbnails = true,
  enableLightbox = true,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(images);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const lightboxRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Sort images by order
  useEffect(() => {
    const sorted = [...images].sort((a, b) => a.order - b.order);
    setGalleryImages(sorted);
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentIndex, galleryImages.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    resetZoom();
  }, [galleryImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    resetZoom();
  }, [galleryImages.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    resetZoom();
  }, []);

  const openLightbox = useCallback((index: number) => {
    if (!enableLightbox) return;
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    resetZoom();
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setIsFullscreen(false);
    resetZoom();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await lightboxRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * 1.25, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev / 1.25, 1);
      if (newScale === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  // Touch/Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [goToNext, goToPrevious]);

  // Pan handlers for zoomed image
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [scale, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleImageLoad = useCallback((imageId: string) => {
    setImagesLoaded((prev) => new Set(prev).add(imageId));
  }, []);

  // Drag and drop for thumbnail reordering
  const handleThumbnailDragStart = useCallback((index: number) => {
    if (!editable) return;
    setDraggedIndex(index);
  }, [editable]);

  const handleThumbnailDrop = useCallback((dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...galleryImages];
    const [movedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, movedImage);

    // Update order
    const reordered = newImages.map((img, idx) => ({
      ...img,
      order: idx + 1,
    }));

    setGalleryImages(reordered);
    onImagesReorder?.(reordered);
    setDraggedIndex(null);
  }, [draggedIndex, galleryImages, onImagesReorder]);

  const currentImage = galleryImages[currentIndex];
  const hasMultipleImages = galleryImages.length > 1;

  if (galleryImages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-100 rounded-lg dark:bg-gray-800', className)}>
        <div className="text-center text-muted-foreground">
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image Display */}
      <div className="relative aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-800">
        <img
          src={currentImage?.url || galleryImages[0]?.url}
          alt={`Property image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => openLightbox(currentIndex)}
        />

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-white text-sm font-medium">
            {currentIndex + 1} / {galleryImages.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* View Gallery Button */}
        {enableLightbox && (
          <button
            onClick={() => openLightbox(currentIndex)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 hover:bg-black/80 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            View Gallery
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && hasMultipleImages && (
        <div
          ref={thumbnailContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        >
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              draggable={editable}
              onDragStart={() => handleThumbnailDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleThumbnailDrop(index);
              }}
              onClick={() => goToIndex(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all',
                index === currentIndex
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={image.thumbnail_url || image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Drag Handle */}
              {editable && (
                <div className="absolute top-1 left-1 p-1 bg-black/50 rounded text-white">
                  <GripVertical className="w-3 h-3" />
                </div>
              )}

              {/* Main Image Indicator */}
              {index === 0 && (
                <div className="absolute top-1 right-1 p-1 bg-yellow-400 rounded">
                  <Star className="w-2.5 h-2.5 text-yellow-900 fill-current" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && currentImage && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {currentIndex + 1} / {galleryImages.length}
              </span>
              {currentImage.original_name && (
                <span className="text-gray-400 text-sm truncate max-w-xs">
                  {currentImage.original_name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Download */}
              <a
                href={currentImage.url}
                download
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image Area */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={currentImage.url}
              alt={`Property image ${currentIndex + 1}`}
              className={cn(
                'max-w-full max-h-full object-contain transition-transform duration-200',
                isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
              )}
              style={{
                transform: `scale(${scale}) translate(${panPosition.x / scale}px, ${panPosition.y / scale}px)`,
              }}
              draggable={false}
            />
          </div>

          {/* Footer Controls */}
          <div className="px-4 py-3 bg-black/80 flex items-center justify-between">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={scale <= 1}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                title="Zoom out (-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white text-sm w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= 5}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                title="Zoom in (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={resetZoom}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset zoom (0)"
              >
                Reset
              </button>
            </div>

            {/* Editable Actions */}
            {editable && (
              <div className="flex items-center gap-2">
                {currentIndex !== 0 && (
                  <button
                    onClick={() => onImageSetMain?.(currentImage.id)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-colors"
                    title="Set as main image"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this image?')) {
                      onImageDelete?.(currentImage.id);
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="px-4 py-3 bg-black/80 border-t border-white/10">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all',
                    index === currentIndex
                      ? 'ring-2 ring-white'
                      : 'opacity-50 hover:opacity-100'
                  )}
                >
                  <img
                    src={image.thumbnail_url || image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
