import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import kycService from '../../../services/kycService';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.jpeg', '.jpg', '.png', '.webp'];

const KYC_DOCUMENT_TYPES = [
  { value: 'AADHAAR_OR_GOVERNMENT_ID', label: 'Aadhaar / Government ID Proof' },
  { value: 'PAN_CARD', label: 'Owner PAN Card' },
  { value: 'SHOP_ESTABLISHMENT_LICENSE', label: 'Shop Act / Establishment License' },
  { value: 'BANK_ACCOUNT_PROOF', label: 'Bank Account / Cancelled Cheque Proof' }
];

const KycUploadModal = ({
  isOpen,
  onClose,
  documentType,
  documentLabel,
  salonId,
  onSuccess,
  isDarkMode = false
}) => {
  const fileInputRef = useRef(null);
  const [selectedType, setSelectedType] = useState('AADHAAR_OR_GOVERNMENT_ID');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (documentType) {
        setSelectedType(documentType);
      } else {
        setSelectedType('AADHAAR_OR_GOVERNMENT_ID');
      }
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [isOpen, documentType]);

  if (!isOpen) return null;

  const validateFile = (file) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext));

    if (!isExtensionValid) {
      toast.error(`Invalid file format. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!selectedType) {
      toast.error("Please select a valid Document Type.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      await kycService.resubmitKycDocument(
        {
          file: selectedFile,
          documentType: selectedType,
          salonId
        },
        (percent) => setUploadProgress(percent)
      );

      const activeLabel = KYC_DOCUMENT_TYPES.find(t => t.value === selectedType)?.label || 'Document';
      toast.success(`${activeLabel} resubmitted for Admin review.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("KYC resubmission failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to resubmit document");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
              Document Resubmission
            </span>
            <h3 className="text-lg font-black tracking-tight">
              Upload KYC Document
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">

          {/* Document Type Dropdown Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
              Document Category / Type *
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs font-bold border focus:outline-none focus:border-red-500 transition cursor-pointer ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {KYC_DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
              Upload Document File (.pdf, .jpg, .png, .webp) *
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-red-500 bg-red-50/20'
                  : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : isDarkMode
                      ? 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpeg,.jpg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Click to change file
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                      Drag and drop file here, or <span className="text-red-500 underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                      Supports PDF, JPEG, PNG, WEBP (Max {MAX_FILE_SIZE_MB} MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                  Uploading file...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-red-500/20"
            >
              {uploading ? 'Uploading...' : 'Submit for Admin Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default KycUploadModal;
