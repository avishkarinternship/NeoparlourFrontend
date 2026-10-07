import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { getImageUrl } from '../../services/supportService';

const ImageLightboxModal = ({ isOpen, imageUrl: rawImageUrl, title = 'Screenshot Attachment', onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const imageUrl = getImageUrl(rawImageUrl);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="text-white">
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          <p className="text-[11px] text-zinc-400">Click & Drag or use controls to inspect</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 rounded-full px-3 py-1.5 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition cursor-pointer"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition cursor-pointer"
          >
            Reset
          </button>

          <a
            href={imageUrl}
            download="support_screenshot.png"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition cursor-pointer ml-1 border-l border-zinc-700/60 pl-2"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-full transition cursor-pointer ml-1"
            title="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container Image Display */}
      <div className="relative w-full h-full flex items-center justify-center overflow-auto p-8">
        <img
          src={imageUrl}
          alt={title}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing select-none"
        />
      </div>
    </div>,
    document.body
  );
};

export default ImageLightboxModal;
