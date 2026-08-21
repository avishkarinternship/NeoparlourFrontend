import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

const KycPreviewModal = ({ isOpen, onClose, document, isDarkMode = false }) => {
  if (!isOpen || !document) return null;

  const fileUrl = document.filePath || document.fileUrl || document.url || '';
  const fileName = document.fileName || 'KYC Document';
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || document.contentType?.includes('pdf');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2A14]/10 text-[#FF2A14] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Document Preview
              </span>
              <h3 className="text-base font-black truncate max-w-md">
                {fileName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Open in New Tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center min-h-[400px]">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title={fileName}
                className="w-full h-[600px] rounded-xl border-0"
              />
            ) : (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-[600px] object-contain rounded-xl shadow-lg"
              />
            )
          ) : (
            <div className="text-center text-slate-400 space-y-2 p-8">
              <FileText className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">No direct preview URL available for this file.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default KycPreviewModal;
