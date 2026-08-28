import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Send, Loader2, AlertCircle, CreditCard, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPayoutProcessModal = ({
  isOpen,
  onClose,
  payoutRequest,
  targetStatus = 'COMPLETED', // 'COMPLETED' | 'REJECTED'
  onConfirm,
  isDarkMode = false
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUtrNumber('');
      setRejectionReason('');
    }
  }, [isOpen, payoutRequest, targetStatus]);

  if (!isOpen || !payoutRequest) return null;

  const isApprove = targetStatus === 'COMPLETED';
  const requestId = payoutRequest.id || payoutRequest.requestId;
  const staffName = payoutRequest.staffName || payoutRequest.staff?.name || 'Staff Member';
  const points = payoutRequest.pointsToRedeem || payoutRequest.points || payoutRequest.amount || 0;
  const amountInr = payoutRequest.amountInr || payoutRequest.amount || points;
  const isUpi = (payoutRequest.payoutMethod || '').toUpperCase() === 'UPI';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isApprove) {
      if (!utrNumber.trim()) {
        toast.error("Please enter a valid Bank UTR / Reference Number.");
        return;
      }
    } else {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a mandatory reason for rejecting this payout request.");
        return;
      }
    }

    try {
      setSubmitting(true);
      await onConfirm(
        requestId,
        targetStatus,
        isApprove ? utrNumber.trim() : null,
        !isApprove ? rejectionReason.trim() : null
      );
      onClose();
    } catch (err) {
      // Error toasted in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${
          isApprove ? 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isApprove ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            }`}>
              {isApprove ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">
                Admin Payout Decision
              </span>
              <h3 className="text-base font-black tracking-tight">
                {isApprove ? `Approve Transfer & Record UTR` : `Reject Request & Refund Points`}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Details Overview Card */}
        <div className="p-5 space-y-4">
          
          <div className={`p-3.5 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-850 border-zinc-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">{staffName}</span>
              </div>
              <span className="text-xs font-black text-[#FF2A14] font-mono">Request #{requestId}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Requested Redemption</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {points} Points (₹{amountInr} INR)
                </span>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Payout Method</span>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-end gap-1">
                  {isUpi ? <CreditCard className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                  {isUpi ? `UPI: ${payoutRequest.upiId || 'N/A'}` : `Bank: ${payoutRequest.accountNumber || 'N/A'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Form Decision Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isApprove ? (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Bank UTR / Reference Transaction Number *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. UTR9876543210 or UPI/3234567890/NEFT"
                  className={`w-full p-3 rounded-2xl text-xs font-mono font-bold border focus:outline-none focus:border-emerald-500 transition ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                  Enter the transaction UTR number generated by your bank or UPI app after transferring ₹{amountInr}.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Mandatory Rejection Feedback Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid IFSC Code or incorrect account holder name. Please update your details."
                  className={`w-full p-3 rounded-2xl text-xs font-medium border focus:outline-none focus:border-rose-500 transition ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <p className="text-[10px] text-rose-500 font-medium">
                  Upon rejection, {points} points will be automatically refunded back to {staffName}'s reward wallet.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || (isApprove ? !utrNumber.trim() : !rejectionReason.trim())}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95 ${
                  isApprove
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isApprove ? 'Confirm & Mark Paid' : 'Confirm & Refund Points'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

export default AdminPayoutProcessModal;
