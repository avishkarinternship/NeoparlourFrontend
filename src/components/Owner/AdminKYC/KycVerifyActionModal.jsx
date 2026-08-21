import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PREDEFINED_REASONS = [
  "Document scan is blurry or unreadable",
  "GST certificate number does not match registered details",
  "PAN card name mismatch",
  "Business license is expired",
  "Address proof does not match salon address",
  "Other reason (specify below)"
];

const KycVerifyActionModal = ({
  isOpen,
  onClose,
  document,
  targetStatus = 'APPROVED', // 'APPROVED' or 'REJECTED'
  onConfirm,
  isDarkMode = false
}) => {
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(PREDEFINED_REASONS[0]);
      setCustomReason('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const isRejecting = targetStatus === 'REJECTED';

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalReason = null;
    if (isRejecting) {
      finalReason = selectedReason === "Other reason (specify below)"
        ? customReason.trim()
        : customReason.trim()
          ? `${selectedReason}: ${customReason.trim()}`
          : selectedReason;

      if (!finalReason) {
        toast.error("Please provide a reason for rejecting the document.");
        return;
      }
    }

    try {
      setSubmitting(true);
      await onConfirm(document.id || document.documentId, targetStatus, finalReason);
      toast.success(
        isRejecting
          ? 'KYC document rejected with feedback.'
          : 'KYC document approved successfully!'
      );
      onClose();
    } catch (err) {
      console.error("Verification update failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update document verification status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isRejecting
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}>
              {isRejecting ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest block ${
                isRejecting ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {isRejecting ? 'Reject Submission' : 'Approve Submission'}
              </span>
              <h3 className="text-lg font-black tracking-tight">
                {isRejecting ? 'Reject KYC Document' : 'Approve KYC Document'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {document.salonName || document.ownerName || 'Salon Owner Document'}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              Document: <span className="font-mono text-slate-700 dark:text-zinc-300">{document.documentType || 'KYC File'}</span>
            </p>
          </div>

          {/* Rejection Input */}
          {isRejecting ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  Select Rejection Category *
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-bold border focus:outline-none focus:border-red-500 transition ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {PREDEFINED_REASONS.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  Custom Rejection Feedback Note
                </label>
                <textarea
                  rows="3"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Explain why this document was rejected so the Salon Owner can fix it..."
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-medium border focus:outline-none focus:border-red-500 transition ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
              Are you sure you want to approve this document? Mark as verified and mark the salon owner's compliance status as active.
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md ${
                isRejecting
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : isRejecting ? (
                'Confirm Rejection'
              ) : (
                'Confirm Approval'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default KycVerifyActionModal;
