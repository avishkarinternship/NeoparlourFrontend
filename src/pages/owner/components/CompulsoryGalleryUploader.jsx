import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, X, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '../../../utils/imageCompressor';

const CompulsoryGalleryUploader = ({
  logoBase64,
  setLogoBase64,
  galleryImagesBase64 = [],
  setGalleryImagesBase64,
  isCompressing,
  setIsCompressing,
  isDarkMode = false
}) => {
  const [logoPreview, setLogoPreview] = useState(logoBase64 || '');
  const [galleryPreviews, setGalleryPreviews] = useState(galleryImagesBase64 || []);

  // Calculate approximate payload size in KB
  const calculateTotalKb = () => {
    const totalChars = (logoBase64 ? logoBase64.length : 0) + galleryImagesBase64.join('').length;
    // Base64 chars * 0.75 / 1024 = KB
    return Math.round((totalChars * 0.75) / 1024);
  };

  // 1. Handle Compulsory Salon Logo Upload
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      toast.loading("Optimizing salon logo...", { id: "compress-logo" });
      const compressed = await compressImage(file, 800, 800, 0.8, false);
      setLogoBase64(compressed);
      setLogoPreview(compressed);
      toast.success("Salon logo optimized (~80 KB)", { id: "compress-logo" });
    } catch (err) {
      console.error("Logo compression failed:", err);
      toast.error("Failed to process salon logo image", { id: "compress-logo" });
    } finally {
      setIsCompressing(false);
    }
  };

  // 2. Handle Compulsory Salon Gallery Images Upload (1 to 5 photos)
  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (galleryImagesBase64.length + files.length > 5) {
      toast.error("Maximum 5 gallery photos allowed for salon listing.");
      return;
    }

    try {
      setIsCompressing(true);
      toast.loading(`Optimizing ${files.length} salon photos...`, { id: "compress-gallery" });

      const compressedImages = await Promise.all(
        files.map(file => compressImage(file, 1200, 1200, 0.75, false))
      );

      const updatedImages = [...galleryImagesBase64, ...compressedImages].slice(0, 5);
      setGalleryImagesBase64(updatedImages);
      setGalleryPreviews(updatedImages);

      toast.success(`${compressedImages.length} photos optimized & ready!`, { id: "compress-gallery" });
    } catch (err) {
      console.error("Gallery compression failed:", err);
      toast.error("Failed to process gallery photos", { id: "compress-gallery" });
    } finally {
      setIsCompressing(false);
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    const updated = galleryImagesBase64.filter((_, idx) => idx !== indexToRemove);
    setGalleryImagesBase64(updated);
    setGalleryPreviews(updated);
  };

  const totalKb = calculateTotalKb();

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50/70 border-slate-200'
    }`}>
      
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#FF2A14]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Compulsory Salon Media Listing Photos
          </h4>
        </div>

        {totalKb > 0 && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
            ✓ Optimized Payload: ~{totalKb} KB
          </span>
        )}
      </div>

      {/* 1. Compulsory Logo Uploader */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Salon Brand Logo <span className="text-[#FF2A14]">* (Compulsory)</span></span>
          {logoBase64 && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>}
        </label>

        <div className="flex items-center gap-3">
          {logoPreview ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0">
              <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setLogoBase64(''); setLogoPreview(''); }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className={`w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition shrink-0 ${
              isDarkMode ? 'border-zinc-700 hover:border-[#FF2A14] bg-zinc-800' : 'border-slate-300 hover:border-[#FF2A14] bg-white'
            }`}>
              <Upload className="w-5 h-5 text-slate-400" />
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
          )}

          <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-0.5">
            <p className="font-semibold text-slate-700 dark:text-zinc-300">Upload high-res salon logo</p>
            <p>Automatically compressed to max 800px (~80 KB)</p>
          </div>
        </div>
      </div>

      {/* 2. Compulsory Gallery Images Uploader (1 to 5 photos) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Salon Interior & Exterior Photos <span className="text-[#FF2A14]">* (Compulsory - Upload 1 to 5 photos)</span></span>
          <span className="text-[10px] font-bold text-slate-400">{galleryImagesBase64.length}/5 Uploaded</span>
        </label>

        {/* Thumbnail Previews Grid */}
        <div className="grid grid-cols-5 gap-2">
          {galleryPreviews.map((imgSrc, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group">
              <img src={imgSrc} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {galleryImagesBase64.length < 5 && (
            <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${
              isDarkMode ? 'border-zinc-700 hover:border-[#FF2A14] bg-zinc-800' : 'border-slate-300 hover:border-[#FF2A14] bg-white'
            }`}>
              {isCompressing ? (
                <Loader2 className="w-4 h-4 text-[#FF2A14] animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 mt-1">+ Photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                disabled={isCompressing}
                className="hidden"
              />
            </label>
          )}
        </div>

        {galleryImagesBase64.length > 0 ? (
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {galleryImagesBase64.length} photos compressed & web-optimized (~{Math.round((galleryImagesBase64.join('').length * 0.75) / 1024)} KB)
          </p>
        ) : (
          <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            At least 1 compulsory gallery photo is required for client app listing.
          </p>
        )}
      </div>

    </div>
  );
};

export default CompulsoryGalleryUploader;
