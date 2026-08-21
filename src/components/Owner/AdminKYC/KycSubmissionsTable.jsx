import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import KycPreviewModal from './KycPreviewModal';
import KycVerifyActionModal from './KycVerifyActionModal';

const STATUS_BADGES = {
  PENDING: { label: '🟡 Pending Review', class: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300' },
  APPROVED: { label: '🟢 Approved', class: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300' },
  REJECTED: { label: '🔴 Rejected', class: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300' }
};

const KycSubmissionsTable = ({
  submissions = [],
  loading = false,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  onVerifyDocument,
  isDarkMode = false
}) => {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('APPROVED');

  const handleOpenVerify = (doc, status) => {
    setVerifyDoc(doc);
    setVerifyStatus(status);
  };

  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-150'
    }`}>
      
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${
              isDarkMode ? 'bg-zinc-800/50 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>
              <th className="py-4 px-5">Salon & Owner</th>
              <th className="py-4 px-4">Document Type</th>
              <th className="py-4 px-4">Uploaded File</th>
              <th className="py-4 px-4">Submitted At</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y text-xs font-semibold ${
            isDarkMode ? 'divide-zinc-800 text-zinc-200' : 'divide-slate-100 text-slate-800'
          }`}>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400">
                  <div className="w-7 h-7 border-3 border-[#FF2A14] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading KYC submission queue...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                  No KYC document submissions match your filter.
                </td>
              </tr>
            ) : (
              submissions.map((doc, idx) => {
                const statusKey = (doc.status || 'PENDING').toUpperCase();
                const badge = STATUS_BADGES[statusKey] || STATUS_BADGES.PENDING;
                const submittedDate = doc.uploadedAt || doc.createdAt
                  ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'N/A';

                return (
                  <tr key={doc.id || idx} className={`transition-colors ${
                    isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50/60'
                  }`}>
                    
                    {/* Salon & Owner */}
                    <td className="py-4 px-5">
                      <div className="font-black text-slate-900 dark:text-white">
                        {doc.salonName || 'Salon #' + (doc.salonId || 'N/A')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {doc.ownerName || 'Owner'} {doc.ownerPhone ? `• ${doc.ownerPhone}` : ''}
                      </div>
                    </td>

                    {/* Document Type */}
                    <td className="py-4 px-4 font-mono font-bold text-[11px] text-[#FF2A14]">
                      {doc.documentType || 'KYC_FILE'}
                    </td>

                    {/* File Name */}
                    <td className="py-4 px-4">
                      <div className="truncate max-w-[180px] font-medium" title={doc.fileName}>
                        {doc.fileName || 'document.pdf'}
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="py-4 px-4 text-slate-500 dark:text-zinc-400 text-[11px] font-mono">
                      {submittedDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${badge.class}`}>
                        {badge.label}
                      </span>

                      {statusKey === 'REJECTED' && doc.rejectionReason && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 truncate max-w-[160px]" title={doc.rejectionReason}>
                          Reason: {doc.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
                          title="Preview Document File"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => handleOpenVerify(doc, 'APPROVED')}
                          disabled={statusKey === 'APPROVED'}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => handleOpenVerify(doc, 'REJECTED')}
                          disabled={statusKey === 'REJECTED'}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className={`p-4 border-t flex items-center justify-between text-xs font-bold ${
          isDarkMode ? 'border-zinc-800 text-zinc-400' : 'border-slate-100 text-slate-500'
        }`}>
          <div>
            Showing Page {page + 1} of {totalPages} ({totalElements} submissions)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <KycPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        isDarkMode={isDarkMode}
      />

      {/* Approve / Reject Verification Modal */}
      <KycVerifyActionModal
        isOpen={!!verifyDoc}
        onClose={() => setVerifyDoc(null)}
        document={verifyDoc}
        targetStatus={verifyStatus}
        onConfirm={onVerifyDocument}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default KycSubmissionsTable;
