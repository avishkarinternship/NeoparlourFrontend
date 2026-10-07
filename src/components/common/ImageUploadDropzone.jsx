import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import supportService from '../../services/supportService';

const ImageUploadDropzone = ({ 
  imageUrls = [], 
  selectedFiles = [],
  onImagesChange, 
  onFilesChange,
  maxFiles = 5, 
  disabled = false,
  isDarkMode = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0 || disabled) return;

    const validFiles = [];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image format. (PNG, JPG, WEBP only)`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`"${file.name}" exceeds maximum size limit of 10MB.`);
        continue;
      }
      validFiles.push(file);
    }

    const currentCount = Math.max(imageUrls.length, selectedFiles.length);
    if (currentCount + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} screenshot images allowed.`);
      return;
    }

    if (validFiles.length === 0) return;

    // Local object preview URLs for instant zero-latency UI rendering
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    const updatedFilesList = [...selectedFiles, ...validFiles];
    const updatedPreviewsList = [...imageUrls, ...newPreviewUrls];

    if (onFilesChange) {
      onFilesChange(updatedFilesList);
    }

    if (onImagesChange) {
      // Pass both updated previews and updated files if callback handles both
      onImagesChange(updatedPreviewsList, updatedFilesList);
    }

    toast.success(`Attached ${validFiles.length} image(s) for submission!`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedPreviews = imageUrls.filter((_, idx) => idx !== indexToRemove);
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);

    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
    if (onImagesChange) {
      onImagesChange(updatedPreviews, updatedFiles);
    }
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-[#FF2A14] bg-red-500/10 scale-[1.01]'
            : isDarkMode
              ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900'
              : 'border-slate-200 hover:border-red-200 bg-slate-50/80 hover:bg-slate-50'
        } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
            isDragging ? 'scale-110 bg-[#FF2A14] text-white' : 'bg-red-500/10 text-[#FF2A14]'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
              Click to Upload or Drag & Drop Screenshots
            </p>
            <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
              PNG, JPG, WEBP up to 10MB (Max {maxFiles} images)
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Thumbnail Grid */}
      {imageUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
              Attached Screenshots ({imageUrls.length}/{maxFiles})
            </span>
            {imageUrls.length > 0 && (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for submission
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                className={`relative group rounded-xl overflow-hidden border shadow-xs aspect-video ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'
                }`}
              >
                <img
                  src={url}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />

                {/* Hover overlay with Remove button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer"
                    title="Remove Screenshot 🗑️"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Thumbnail Trigger if below limit */}
            {imageUrls.length < maxFiles && !disabled && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed aspect-video transition cursor-pointer ${
                  isDarkMode
                    ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-white'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-400 hover:text-slate-700'
                }`}
              >
                <Plus className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold uppercase">Add More</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
