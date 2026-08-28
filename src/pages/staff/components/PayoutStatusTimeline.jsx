import React from 'react';
import { Clock, CheckCircle2, XCircle, CreditCard, Building2, Calendar, FileText, ArrowRightLeft } from 'lucide-react';

const STATUS_BADGES = {
  PENDING: { label: '🟡 Pending Review', class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  COMPLETED: { label: '🟢 Paid & Completed', class: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  REJECTED: { label: '🔴 Rejected (Refunded)', class: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800' }
};

const PayoutStatusTimeline = ({ payouts = [], loading = false, isDarkMode = false }) => {
  if (loading) {
    return (
      <div className={`p-8 text-center rounded-2xl border ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
      }`}>
        <div className="w-7 h-7 border-3 border-[#FF2A14] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold">Loading payout history timeline...</p>
      </div>
    );
  }

  if (!Array.isArray(payouts) || payouts.length === 0) {
    return (
      <div className={`p-8 text-center rounded-2xl border ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
      }`}>
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
        <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-zinc-300">
          No Payout Requests Found
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">You have not submitted any reward points payout requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((item, idx) => {
        const statusKey = (item.status || 'PENDING').toUpperCase();
        const badge = STATUS_BADGES[statusKey] || STATUS_BADGES.PENDING;
        const pts = item.pointsToRedeem || item.points || item.amount || 0;
        const inr = item.amountInr || item.amount || pts;

        const dateStr = item.createdAt || item.requestDate || item.submittedAt
          ? new Date(item.createdAt || item.requestDate || item.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })
          : 'N/A';

        const completedDateStr = item.processedAt || item.completedAt
          ? new Date(item.processedAt || item.completedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })
          : null;

        const isUpi = (item.payoutMethod || '').toUpperCase() === 'UPI';

        return (
          <div
            key={item.id || idx}
            className={`p-4 rounded-2xl border shadow-2xs transition-all ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              
              {/* Left Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {pts} Points Redemption
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ₹{inr} Payout
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badge.class}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap pt-0.5">
                  <span className="flex items-center gap-1 font-semibold">
                    {isUpi ? <CreditCard className="w-3.5 h-3.5 text-slate-400" /> : <Building2 className="w-3.5 h-3.5 text-slate-400" />}
                    {isUpi ? `UPI: ${item.upiId || 'N/A'}` : `Bank Acc: ${item.accountNumber || 'N/A'} (${item.ifscCode || ''})`}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Submitted: {dateStr}
                  </span>
                </div>
              </div>

              {/* Right Status Note Details */}
              <div className="text-left sm:text-right shrink-0">
                {statusKey === 'PENDING' && (
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Awaiting Admin Transfer
                  </p>
                )}

                {statusKey === 'COMPLETED' && (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 sm:justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid {completedDateStr ? `on ${completedDateStr}` : ''}
                    </p>
                    {item.utrNumber && (
                      <p className="text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-300">
                        Bank UTR: {item.utrNumber}
                      </p>
                    )}
                  </div>
                )}

                {statusKey === 'REJECTED' && (
                  <div className="space-y-0.5 max-w-xs">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 sm:justify-end">
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected Request
                    </p>
                    {item.rejectionReason && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium truncate" title={item.rejectionReason}>
                        Reason: {item.rejectionReason}
                      </p>
                    )}
                    <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      {pts} Points Refunded to Wallet
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PayoutStatusTimeline;
