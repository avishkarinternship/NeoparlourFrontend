import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../services/supportService';

const ImageGalleryModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  imageUrl = null, 
  title = "Screenshot Attachment Lightbox" 
}) => {
  // Normalize and format image URLs with backend base URL
  const rawList = Array.isArray(images) && images.length > 0 
    ? images 
    : imageUrl 
      ? [imageUrl] 
      : [];

  const imageList = rawList.map(img => getImageUrl(img));

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [isOpen, images, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && imageList.length > 1) {
        setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight' && imageList.length > 1) {
        setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, imageList.length, onClose]);

  if (!isOpen || imageList.length === 0) return null;

  const currentUrl = imageList[currentIndex];

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Top Controls Header */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 text-white">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base tracking-tight truncate max-w-xs sm:max-w-md">
              {title}
            </h4>
            {imageList.length > 1 && (
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                Image {currentIndex + 1} of {imageList.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Open Original Image in New Tab"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-red-600 text-white transition cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {imageList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm z-20 cursor-pointer hover:scale-110 active:scale-95"
            title="Previous Image (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm z-20 cursor-pointer hover:scale-110 active:scale-95"
            title="Next Image (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Display Area */}
      <div className="relative z-10 max-w-5xl max-h-[80vh] flex flex-col items-center justify-center">
        <img
          src={currentUrl}
          alt={`Screenshot ${currentIndex + 1}`}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none"
        />

        {/* Thumbnail Selector Strip (if multiple) */}
        {imageList.length > 1 && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md overflow-x-auto max-w-full">
            {imageList.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                  currentIndex === idx ? 'border-[#FF2A14] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageGalleryModal;
