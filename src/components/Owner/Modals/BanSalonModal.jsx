import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminSalonService from '../../../services/adminSalonService';

const PREDEFINED_REASONS = [
  "Violation of Terms of Service",
  "Fraudulent Activity / Fake Appointments",
  "Unresolved Customer Complaints",
  "Non-payment of Platform Fees",
  "Other (Specify below)"
];

const BanSalonModal = ({
  isOpen,
  onClose,
  salon,
  onSuccess,
  isDarkMode = false
}) => {
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !salon) return null;

  const isOther = selectedReason === "Other (Specify below)";
  const isValid = !isOther || customNote.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please specify a custom reason note.");
      return;
    }

    const fullReason = isOther
      ? customNote.trim()
      : customNote.trim()
        ? `${selectedReason}: ${customNote.trim()}`
        : selectedReason;

    try {
      setSubmitting(true);
      await adminSalonService.banSalon(salon.id, fullReason);
      toast.success(`Salon "${salon.salonName || salon.name}" banned successfully`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to ban salon:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Failed to ban salon");
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
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                Administrative Action
              </span>
              <h3 className="text-lg font-black tracking-tight">
                Ban Salon: {salon.salonName || salon.name || `ID ${salon.id}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Notice:</span> Banning will disable walk-in and online appointment bookings for this salon. Owner reports and staff settings will remain accessible.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Reason Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Select Ban Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-white focus:border-red-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500'
              }`}
            >
              {PREDEFINED_REASONS.map((r, i) => (
                <option key={i} value={r} className="dark:bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Explanation Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Additional Details / Explanation {isOther && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={3}
              placeholder={isOther ? "Please specify the exact reason for banning this salon..." : "Optional notes to be displayed to the salon owner..."}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none transition ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-red-500'
              }`}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-red-500/20"
            >
              {submitting ? 'Banning...' : 'Confirm & Ban Salon'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default BanSalonModal;
