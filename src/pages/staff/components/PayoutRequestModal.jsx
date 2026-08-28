import React, { useState } from 'react';
import { X, Award, CreditCard, Building2, Send, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PayoutRequestModal = ({ isOpen, onClose, availablePoints = 0, onSubmit, isDarkMode = false }) => {
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI'); // 'UPI' | 'BANK_TRANSFER'

  // Form Fields
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const pointsVal = parseInt(pointsToRedeem, 10) || 0;
  const inrAmount = pointsVal; // 1 Point = ₹1

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pointsVal <= 0) {
      toast.error("Please enter a valid number of reward points to redeem.");
      return;
    }

    if (pointsVal > availablePoints) {
      toast.error(`Requested ${pointsVal} points exceeds your available balance of ${availablePoints} points.`);
      return;
    }

    if (payoutMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error("Please provide a valid UPI ID (e.g. staffname@upi).");
        return;
      }
    } else {
      if (!accountNumber.trim()) {
        toast.error("Bank account number is required.");
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 4) {
        toast.error("Valid IFSC code is required.");
        return;
      }
      if (!accountHolderName.trim()) {
        toast.error("Account holder name is required.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        pointsToRedeem: pointsVal,
        payoutMethod,
        upiId: payoutMethod === 'UPI' ? upiId.trim() : null,
        accountNumber: payoutMethod === 'BANK_TRANSFER' ? accountNumber.trim() : null,
        ifscCode: payoutMethod === 'BANK_TRANSFER' ? ifscCode.trim().toUpperCase() : null,
        accountHolderName: payoutMethod === 'BANK_TRANSFER' ? accountHolderName.trim() : null
      };

      await onSubmit(payload);
      onClose();
      // Reset form
      setPointsToRedeem('');
      setUpiId('');
      setAccountNumber('');
      setIfscCode('');
      setAccountHolderName('');
    } catch (err) {
      // Error already toasted in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Staff Reward Redemption
              </span>
              <h3 className="text-base font-black tracking-tight">
                Request Reward Payout
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Balance Overview Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Available Points Balance</span>
            </div>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">{availablePoints} Pts (₹{availablePoints})</span>
          </div>

          {/* Points to Redeem Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Points to Redeem (1 Point = ₹1) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={availablePoints}
                required
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(e.target.value)}
                placeholder="e.g. 50"
                className={`w-full p-3 rounded-2xl text-sm font-bold border focus:outline-none focus:border-[#FF2A14] transition ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              {pointsVal > 0 && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  = ₹{inrAmount} Payout
                </span>
              )}
            </div>
          </div>

          {/* Payout Method Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Select Payout Method *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayoutMethod('UPI')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  payoutMethod === 'UPI'
                    ? 'bg-[#FF2A14] text-white border-[#FF2A14] shadow-md shadow-red-500/20'
                    : isDarkMode
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                UPI Transfer
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('BANK_TRANSFER')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  payoutMethod === 'BANK_TRANSFER'
                    ? 'bg-[#FF2A14] text-white border-[#FF2A14] shadow-md shadow-red-500/20'
                    : isDarkMode
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Bank Transfer
              </button>
            </div>
          </div>

          {/* Method Specific Inputs */}
          {payoutMethod === 'UPI' ? (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                UPI ID *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. staffname@upi"
                className={`w-full p-3 rounded-2xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Avishkar Mandlik"
                  className={`w-full p-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="918237465012"
                    className={`w-full p-2.5 rounded-xl text-xs font-mono font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="HDFC0001234"
                    className={`w-full p-2.5 rounded-xl text-xs font-mono uppercase font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Footer Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || pointsVal <= 0 || pointsVal > availablePoints}
              className="px-5 py-2.5 rounded-xl bg-[#FF2A14] hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 transition"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Payout Request
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default PayoutRequestModal;
