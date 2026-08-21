import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight, AlertCircle, Clock, MapPin, Phone, Mail, User, Store, Calendar, FileMinus, Info, CheckCircle2 } from 'lucide-react';
import KycPreviewModal from './KycPreviewModal';
import KycVerifyActionModal from './KycVerifyActionModal';

const STATUS_BADGES = {
  PENDING: { label: '🟡 Pending Review', class: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300' },
  APPROVED: { label: '🟢 Approved', class: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300' },
  REJECTED: { label: '🔴 Rejected', class: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300' }
};

const ALL_REQUIRED_DOCUMENT_TYPES = [
  { key: 'AADHAAR_OR_GOVERNMENT_ID', label: 'Aadhaar / Government ID Proof' },
  { key: 'PAN_CARD', label: 'Owner PAN Card' },
  { key: 'SHOP_ESTABLISHMENT_LICENSE', label: 'Shop Act / Establishment License' },
  { key: 'BANK_ACCOUNT_PROOF', label: 'Bank Account / Cancelled Cheque Proof' }
];

const DOCUMENT_TYPE_LABELS = {
  AADHAAR_OR_GOVERNMENT_ID: 'Aadhaar / Government ID Proof',
  PAN_CARD: 'Owner PAN Card',
  SHOP_ESTABLISHMENT_LICENSE: 'Shop Act / Establishment License',
  BANK_ACCOUNT_PROOF: 'Bank Account / Cancelled Cheque Proof'
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

  const handleOpenVerify = (doc, status, salonInfo = {}) => {
    setVerifyDoc({
      ...doc,
      salonName: salonInfo.salonName || doc.salonName,
      ownerName: salonInfo.ownerName || doc.ownerName
    });
    setVerifyStatus(status);
  };

  const salonOwners = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="space-y-6">
      
      {loading ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-150 text-slate-500'
        }`}>
          <div className="w-8 h-8 border-4 border-[#FF2A14] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold">Loading KYC verification submissions...</p>
        </div>
      ) : salonOwners.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-150 text-slate-500'
        }`}>
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-zinc-600" />
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-zinc-300">
            No KYC Document Submissions Found
          </h3>
          <p className="text-xs mt-1">There are no salon compliance documents matching your active filter criteria.</p>
        </div>
      ) : (
        salonOwners.map((item, salonIdx) => {
          const isOwnerContainer = Array.isArray(item.kycDocuments);
          const uploadedDocsList = isOwnerContainer ? item.kycDocuments : [item];

          // Map uploaded documents by documentType
          const uploadedMap = {};
          uploadedDocsList.forEach(d => {
            if (d.documentType) {
              uploadedMap[d.documentType] = d;
            }
          });

          const ownerName = item.ownerName || item.salonName || 'Salon Owner';
          const ownerMobile = item.ownerMobile || item.ownerPhone || 'N/A';
          const ownerEmail = item.ownerEmail || 'N/A';
          const salonName = item.salonName || 'Salon #' + (item.salonId || 'N/A');
          const locationStr = [item.cityName, item.areaName].filter(Boolean).join(', ') || 'Location Unspecified';
          const registeredAt = item.ownerCreatedAt
            ? new Date(item.ownerCreatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
            : null;

          const presentCount = Object.keys(uploadedMap).length;
          const missingCount = Math.max(0, ALL_REQUIRED_DOCUMENT_TYPES.length - presentCount);

          return (
            <div
              key={item.ownerId || item.salonId || item.id || salonIdx}
              className={`rounded-3xl border overflow-hidden shadow-sm transition-all duration-200 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-150'
              }`}
            >
              
              {/* Salon & Owner Identity Header */}
              <div className={`p-5 sm:p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50/80 border-slate-100'
              }`}>
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF2A14]/10 text-[#FF2A14] flex items-center justify-center shrink-0 border border-[#FF2A14]/20">
                    <Store className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        {salonName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-200/60 dark:bg-zinc-700 px-2.5 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3 text-[#FF2A14]" />
                        {locationStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700 dark:text-zinc-200">{ownerName}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {ownerMobile}
                      </span>
                      {ownerEmail !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {ownerEmail}
                        </span>
                      )}
                      {registeredAt && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          Joined {registeredAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submissions Badge Counter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                    {presentCount} Submitted
                  </span>
                  {missingCount > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-zinc-700">
                      {missingCount} Missing
                    </span>
                  )}
                </div>
              </div>

              {/* Nested KYC Documents Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-100 text-slate-400'
                    }`}>
                      <th className="py-3.5 px-5">Document Type</th>
                      <th className="py-3.5 px-4">Uploaded File</th>
                      <th className="py-3.5 px-4">File Format</th>
                      <th className="py-3.5 px-4">Submitted At</th>
                      <th className="py-3.5 px-4">Status & Reason</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className={`divide-y text-xs font-semibold ${
                    isDarkMode ? 'divide-zinc-800/60 text-zinc-200' : 'divide-slate-100 text-slate-800'
                  }`}>
                    
                    {/* Render All 4 Required Types: Present Uploads first, then Missing Placeholders */}
                    {ALL_REQUIRED_DOCUMENT_TYPES.map((reqType) => {
                      const doc = uploadedMap[reqType.key];
                      const isPresent = !!doc;

                      if (isPresent) {
                        const statusKey = (doc.status || 'PENDING').toUpperCase();
                        const badge = STATUS_BADGES[statusKey] || STATUS_BADGES.PENDING;
                        const uploadedDate = doc.uploadedAt || doc.createdAt
                          ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })
                          : 'N/A';

                        const formatBadge = doc.contentType
                          ? doc.contentType.includes('pdf') ? 'PDF Document' : doc.contentType.includes('png') ? 'PNG Image' : 'JPEG Image'
                          : doc.fileName?.endsWith('.pdf') ? 'PDF Document' : 'Image File';

                        return (
                          <tr key={doc.id || reqType.key} className={`transition-colors ${
                            isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800/40' : 'bg-white hover:bg-slate-50/70'
                          }`}>

                            {/* Document Type */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {reqType.label}
                                </div>
                              </div>
                              <div className="text-[10px] font-mono text-[#FF2A14] mt-0.5 pl-4">
                                {reqType.key} <span className="text-slate-400 font-normal">• Doc ID #{doc.id}</span>
                              </div>
                            </td>

                            {/* Uploaded File */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="truncate max-w-[200px] font-bold text-slate-900 dark:text-white" title={doc.fileName}>
                                  {doc.fileName || 'KYC_Document.png'}
                                </span>
                              </div>
                            </td>

                            {/* Format */}
                            <td className="py-4 px-4">
                              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                                {formatBadge}
                              </span>
                            </td>

                            {/* Submitted At */}
                            <td className="py-4 px-4 text-slate-600 dark:text-zinc-300 text-[11px] font-mono font-bold">
                              {uploadedDate}
                            </td>

                            {/* Status Badge & Rejection Reason */}
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${badge.class}`}>
                                {badge.label}
                              </span>

                              {statusKey === 'REJECTED' && doc.rejectionReason && (
                                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold max-w-[180px]" title={doc.rejectionReason}>
                                  Reason: {doc.rejectionReason}
                                </p>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                
                                {/* Preview File */}
                                <button
                                  onClick={() => setPreviewDoc(doc)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                                  title="Preview Document File"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  Preview
                                </button>

                                {/* Approve */}
                                <button
                                  onClick={() => handleOpenVerify(doc, 'APPROVED', { salonName, ownerName })}
                                  disabled={statusKey === 'APPROVED'}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approve
                                </button>

                                {/* Reject */}
                                <button
                                  onClick={() => handleOpenVerify(doc, 'REJECTED', { salonName, ownerName })}
                                  disabled={statusKey === 'REJECTED'}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      }

                      {/* MISSING DOCUMENT PLACEHOLDER ROW */}
                      return (
                        <tr key={reqType.key} className={`opacity-60 transition-colors ${
                          isDarkMode ? 'bg-zinc-950/40 hover:bg-zinc-900/60' : 'bg-slate-50/40 hover:bg-slate-100/50'
                        }`}>
                          
                          {/* Document Type */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                              <div className="font-semibold text-slate-400 dark:text-zinc-500 line-through decoration-slate-300">
                                {reqType.label}
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-600 mt-0.5 pl-4">
                              {reqType.key}
                            </div>
                          </td>

                          {/* Uploaded File */}
                          <td className="py-4 px-4 text-slate-400 dark:text-zinc-600 italic text-[11px]">
                            Not uploaded yet
                          </td>

                          {/* Format */}
                          <td className="py-4 px-4 text-slate-400 dark:text-zinc-600 font-mono text-[11px]">
                            —
                          </td>

                          {/* Submitted At */}
                          <td className="py-4 px-4 text-slate-400 dark:text-zinc-600 font-mono text-[11px]">
                            —
                          </td>

                          {/* Missing Status */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                              <FileMinus className="w-3 h-3 text-slate-400" />
                              Not Submitted
                            </span>
                          </td>

                          {/* Actions Disabled */}
                          <td className="py-4 px-5 text-right">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
                              Awaiting Upload
                            </span>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>

            </div>
          );
        })
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className={`p-4 rounded-3xl border flex items-center justify-between text-xs font-bold ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-150 text-slate-500'
        }`}>
          <div>
            Showing Page {page + 1} of {totalPages} ({totalElements} registered salons)
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
