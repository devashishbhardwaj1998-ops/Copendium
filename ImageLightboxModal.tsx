import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCcw, Calendar, HardDrive } from 'lucide-react';
import { AssetAttachmentImage } from '../types';
import { formatFileSize } from '../utils/imageUtils';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: AssetAttachmentImage[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  subtitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
    setZoomLevel(1);
  }, [initialIndex, isOpen, images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    if (!currentImage.dataUrl) return;
    const a = document.createElement('a');
    a.href = currentImage.dataUrl;
    a.download = currentImage.name || `image-${currentIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 text-white z-20">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate text-slate-100">
              {currentImage.caption || currentImage.name || 'Attached Image'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {title && <span className="text-indigo-400 font-medium truncate">{title}</span>}
              {subtitle && <span>• {subtitle}</span>}
              {currentImage.sizeBytes && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(currentImage.sizeBytes)}
                </span>
              )}
              {currentImage.uploadedAt && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {currentImage.uploadedAt.split('T')[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-800 rounded border border-slate-700/60">
            {currentIndex + 1} / {images.length}
          </span>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              title="Zoom out"
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset zoom"
              className="px-2 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              title="Zoom in"
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            title="Download full image"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/60 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            title="Close viewer (Esc)"
            className="p-2 text-slate-300 hover:text-white bg-rose-600/80 hover:bg-rose-600 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image View Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              title="Previous image (Left arrow)"
              className="absolute left-6 z-20 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 shadow-xl backdrop-blur-xs transition-all hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              title="Next image (Right arrow)"
              className="absolute right-6 z-20 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 shadow-xl backdrop-blur-xs transition-all hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Displayed Image */}
        <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-4 transition-transform duration-150 ease-out">
          <img
            src={currentImage.dataUrl}
            alt={currentImage.caption || currentImage.name}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-h-[75vh] max-w-[85vw] object-contain rounded shadow-2xl transition-transform duration-150"
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-center gap-2 overflow-x-auto z-20">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              className={`relative rounded-md overflow-hidden border-2 transition-all shrink-0 w-16 h-12 bg-slate-800 ${
                idx === currentIndex
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                  : 'border-slate-700/80 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.dataUrl}
                alt={img.caption || img.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
