import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2, AlertCircle, CheckCircle2, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import kycAdminService from '../../../services/kycAdminService';

const getIsDarkMode = (prop) => {
  if (prop !== undefined) return prop;
  if (typeof document === 'undefined' || !document || !document.documentElement) return false;
  try {
    return document.documentElement.classList.contains('dark') || (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  } catch (e) {
    return false;
  }
};

const KycPreviewModal = ({ isOpen, onClose, document, onConfirm, isDarkMode: isDarkModeProp }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => getIsDarkMode(isDarkModeProp));

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(getIsDarkMode(isDarkModeProp));
    };

    checkDark();

    let observer = null;
    if (typeof document !== 'undefined' && document && document.documentElement && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => checkDark());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkDark);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof window !== 'undefined') window.removeEventListener('storage', checkDark);
    };
  }, [isDarkModeProp]);

  const [mediaUrl, setMediaUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState(null);

  // Verification decision state inside popup
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const loadKycMedia = async () => {
      if (!isOpen || !document) return;

      const docId = document.id || document.documentId;
      const fileName = document.fileName || '';

      try {
        setLoading(true);
        setError(null);
        setShowRejectInput(false);
        setRejectionReason('');

        // If direct base64/blob/data URI is provided
        if (document.filePath && (document.filePath.startsWith('data:') || document.filePath.startsWith('blob:'))) {
          setMediaUrl(document.filePath);
          setIsPdf(document.filePath.includes('pdf') || fileName.toLowerCase().endsWith('.pdf'));
          setLoading(false);
          return;
        }

        if (!docId) {
          throw new Error("Document ID missing for media preview");
        }

        // Fetch protected file stream via axiosInstance with Bearer JWT token & responseType: 'blob'
        const response = await kycAdminService.fetchDocumentFileBlob(docId);
        const contentType = response.headers['content-type'] || document.contentType || '';

        const isPdfFile = contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
        setIsPdf(isPdfFile);

        objectUrl = URL.createObjectURL(response.data);
        setMediaUrl(objectUrl);
      } catch (err) {
        console.error('Failed to load KYC media file:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load document file preview.');
      } finally {
        setLoading(false);
      }
    };

    loadKycMedia();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const docId = document.id || document.documentId;
  const fileName = document.fileName || 'KYC Document File';
  const statusKey = (document.status || 'PENDING').toUpperCase();

  const handleApprove = async () => {
    if (!docId || !onConfirm) return;
    try {
      setSubmitting(true);
      await onConfirm(docId, 'APPROVED');
      toast.success(`Document #${docId} verified & APPROVED successfully!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!docId || !onConfirm) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a mandatory reason for rejecting this document.");
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(docId, 'REJECTED', rejectionReason.trim());
      toast.success(`Document #${docId} REJECTED with feedback.`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 ${
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
                KYC Document Verification Preview
              </span>
              <h3 className="text-base font-black truncate max-w-md">
                {fileName} {docId && <span className="text-slate-400 font-mono text-xs">• Doc ID #{docId}</span>}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mediaUrl && (
              <a
                href={mediaUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Download File"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Download
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center min-h-[380px] max-h-[60vh]">
          {loading ? (
            <div className="text-center text-slate-300 space-y-3 p-8">
              <Loader2 className="w-10 h-10 animate-spin text-[#FF2A14] mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider">Streaming document photo media file...</p>
            </div>
          ) : error ? (
            <div className="text-center text-rose-400 space-y-2 p-8 max-w-md">
              <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
              <h4 className="text-sm font-black uppercase">Failed to Stream Document</h4>
              <p className="text-xs font-medium text-slate-400">{error}</p>
            </div>
          ) : mediaUrl ? (
            isPdf ? (
              <iframe
                src={mediaUrl}
                title={fileName}
                className="w-full h-[550px] rounded-xl border-0 bg-white"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={fileName}
                className="max-w-full max-h-[550px] object-contain rounded-xl shadow-2xl border border-slate-800"
              />
            )
          ) : (
            <div className="text-center text-slate-400 space-y-2 p-8">
              <FileText className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">No media file content available.</p>
            </div>
          )}
        </div>

        {/* Verification Action Footer */}
        {onConfirm && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 shrink-0 space-y-3">
            
            {showRejectInput ? (
              <form onSubmit={handleRejectSubmit} className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Mandatory Rejection Feedback Reason *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline"
                  >
                    Cancel
                  </button>
                </div>

                <textarea
                  rows={2}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document image is blurry or expired. Please re-upload a clear copy."
                  className={`w-full p-3 rounded-2xl text-xs font-medium border focus:outline-none focus:border-rose-500 transition ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !rejectionReason.trim()}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/20 active:scale-95"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Confirm Rejection
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold text-center sm:text-left">
                  <span>Review the photo carefully before making an admin verification decision.</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    disabled={submitting || statusKey === 'REJECTED'}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-rose-500/20 active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Document
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={submitting || statusKey === 'APPROVED'}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve Document
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default KycPreviewModal;
