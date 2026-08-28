import React, { useState } from 'react';
import { CheckCircle2, XCircle, CreditCard, Building2, ChevronLeft, ChevronRight, FileText, User, Calendar } from 'lucide-react';
import AdminPayoutProcessModal from './AdminPayoutProcessModal';

const STATUS_BADGES = {
  PENDING: { label: '🟡 Pending Review', class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  COMPLETED: { label: '🟢 Paid & Completed', class: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  REJECTED: { label: '🔴 Rejected (Refunded)', class: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800' }
};

const AdminPayoutTable = ({
  data = { content: [], totalPages: 1, totalElements: 0, number: 0 },
  loading = false,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  onProcessPayout,
  isDarkMode = false
}) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [targetStatus, setTargetStatus] = useState('COMPLETED');

  const requests = Array.isArray(data) ? data : data.content || [];
  const actualTotalPages = data.totalPages || totalPages || 1;
  const actualTotalElements = data.totalElements || totalElements || requests.length;
  const currentPage = data.number !== undefined ? data.number : page;

  const handleOpenProcess = (req, status) => {
    setSelectedRequest(req);
    setTargetStatus(status);
  };

  return (
    <div className="space-y-4">
      
      <div className={`rounded-2xl border shadow-2xs overflow-hidden transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        
        {loading ? (
          <div className="p-10 text-center text-xs font-bold text-slate-400">
            <div className="w-8 h-8 border-3 border-[#FF2A14] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading payout requests queue...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-xs font-bold text-slate-400 space-y-1">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-zinc-300">
              No Payout Requests Found
            </h3>
            <p className="text-[11px] font-normal text-slate-400">There are no staff payout requests matching your active specification filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                  isDarkMode ? 'bg-zinc-850 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <th className="py-3.5 px-4">Req #</th>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Redemption Payout</th>
                  <th className="py-3.5 px-4">Payout Method Details</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status & Details</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className={`divide-y text-xs font-semibold ${
                isDarkMode ? 'divide-zinc-800 text-zinc-200' : 'divide-slate-100 text-slate-800'
              }`}>
                {requests.map((item, idx) => {
                  const reqId = item.id || item.requestId || idx;
                  const statusKey = (item.status || 'PENDING').toUpperCase();
                  const badge = STATUS_BADGES[statusKey] || STATUS_BADGES.PENDING;
                  const staffName = item.staffName || item.staff?.name || 'Staff Member';
                  const staffPhone = item.staffPhone || item.staff?.mobile || item.staff?.phone || '';
                  const pts = item.pointsToRedeem || item.points || item.amount || 0;
                  const inr = item.amountInr || item.amount || pts;

                  const dateStr = item.createdAt || item.requestDate || item.submittedAt
                    ? new Date(item.createdAt || item.requestDate || item.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })
                    : 'N/A';

                  const isUpi = (item.payoutMethod || '').toUpperCase() === 'UPI';

                  return (
                    <tr key={reqId} className={`transition-colors ${
                      statusKey === 'PENDING'
                        ? isDarkMode ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'bg-amber-50/40 hover:bg-amber-50/70'
                        : isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50/70'
                    }`}>

                      {/* Request ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF2A14]">
                        #{reqId}
                      </td>

                      {/* Staff Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{staffName}</span>
                            {staffPhone && <span className="text-[10px] font-mono text-slate-400 block">{staffPhone}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Points / Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{pts} Points</div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          ₹{inr} INR Transfer
                        </span>
                      </td>

                      {/* Payout Method Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          {isUpi ? <CreditCard className="w-3.5 h-3.5 text-slate-400" /> : <Building2 className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="text-slate-900 dark:text-white text-[11px]">
                            {isUpi ? 'UPI' : 'Bank Transfer'}
                          </span>
                        </div>

                        {isUpi ? (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block mt-0.5">
                            {item.upiId || 'N/A'}
                          </span>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 space-y-0.5 mt-0.5">
                            <div>Acc: {item.accountNumber || 'N/A'}</div>
                            <div>IFSC: {item.ifscCode || 'N/A'} {item.accountHolderName && `• ${item.accountHolderName}`}</div>
                          </div>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-[11px] font-mono font-medium text-slate-500 dark:text-zinc-400">
                        {dateStr}
                      </td>

                      {/* Status & Reasons / UTR */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badge.class}`}>
                          {badge.label}
                        </span>

                        {statusKey === 'COMPLETED' && item.utrNumber && (
                          <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                            UTR: {item.utrNumber}
                          </div>
                        )}

                        {statusKey === 'REJECTED' && item.rejectionReason && (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-[160px] truncate" title={item.rejectionReason}>
                            Reason: {item.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {statusKey === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenProcess(item, 'COMPLETED')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-2xs active:scale-95"
                              title="Approve Payout & Record Bank UTR"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenProcess(item, 'REJECTED')}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-2xs active:scale-95"
                              title="Reject Payout & Refund Wallet Points"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">
                            Processed
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Pagination Footer */}
      {actualTotalPages > 1 && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
        }`}>
          <div>
            Showing Page {currentPage + 1} of {actualTotalPages} ({actualTotalElements} total requests)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(actualTotalPages - 1, currentPage + 1))}
              disabled={currentPage >= actualTotalPages - 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <AdminPayoutProcessModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        payoutRequest={selectedRequest}
        targetStatus={targetStatus}
        onConfirm={onProcessPayout}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default AdminPayoutTable;
