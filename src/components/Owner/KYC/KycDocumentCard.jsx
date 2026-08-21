import React from 'react';
import { FileText, AlertCircle, Clock, CheckCircle2, UploadCloud, Eye, FileMinus } from 'lucide-react';

const STATUS_CONFIG = {
  NOT_SUBMITTED: {
    label: 'Not Uploaded Yet',
    badgeClass: 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    icon: FileMinus
  },
  REJECTED: {
    label: 'Document Rejected by Admin',
    badgeClass: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
    icon: AlertCircle
  },
  PENDING: {
    label: 'Pending Admin Verification',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    icon: Clock
  },
  APPROVED: {
    label: 'Verified Document',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    icon: CheckCircle2
  }
};

const DOCUMENT_TYPE_LABELS = {
  AADHAAR_OR_GOVERNMENT_ID: 'Aadhaar / Government ID Proof',
  PAN_CARD: 'Owner PAN Card',
  SHOP_ESTABLISHMENT_LICENSE: 'Shop Act / Establishment License',
  BANK_ACCOUNT_PROOF: 'Bank Account / Cancelled Cheque Proof'
};

const KycDocumentCard = ({
  document = {},
  onOpenUploadModal,
  isDarkMode = false
}) => {
  const docType = document.documentType || 'DOCUMENT';
  const label = DOCUMENT_TYPE_LABELS[docType] || document.label || docType;
  
  const hasFile = !!(document.fileName || document.uploadedAt || document.filePath);
  const rawStatus = (document.status || '').toUpperCase();
  const effectiveStatus = (!hasFile && rawStatus !== 'APPROVED' && rawStatus !== 'REJECTED')
    ? 'NOT_SUBMITTED'
    : (rawStatus || 'NOT_SUBMITTED');

  const config = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.NOT_SUBMITTED;
  const StatusIcon = config.icon;

  const uploadedDateStr = document.uploadedAt || document.createdAt
    ? new Date(document.uploadedAt || document.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 shadow-xs ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-150'
    }`}>
      
      {/* Document Card Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            effectiveStatus === 'REJECTED'
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : effectiveStatus === 'APPROVED'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : effectiveStatus === 'PENDING'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'
          }`}>
            <FileText className="w-5.5 h-5.5" />
          </div>

          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {label}
            </h4>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400 mt-0.5">
              {hasFile ? (
                <>
                  <span className="font-bold text-slate-700 dark:text-zinc-200">{document.fileName}</span>
                  {uploadedDateStr && <> • <span className="font-mono">{uploadedDateStr}</span></>}
                </>
              ) : (
                <span className="italic text-slate-400">File Not Uploaded Yet</span>
              )}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${config.badgeClass}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>

      {/* NOT SUBMITTED BANNER */}
      {effectiveStatus === 'NOT_SUBMITTED' && (
        <div className="mt-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-dashed border-slate-300 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
            <span>Please upload your <strong className="text-slate-900 dark:text-white">{label}</strong> file to complete your salon KYC verification.</span>
          </div>
          <button
            onClick={() => onOpenUploadModal(docType, label)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      )}

      {/* REJECTED ALERT BANNER */}
      {effectiveStatus === 'REJECTED' && (
        <div className="mt-3.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-l-4 border-l-red-500 border border-red-200 dark:border-red-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-tight">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Document Rejected by Admin</span>
          </div>

          {document.rejectionReason && (
            <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed pl-6">
              <strong>Reason:</strong> {document.rejectionReason}
            </p>
          )}

          <div className="pt-1 pl-6">
            <button
              onClick={() => onOpenUploadModal(docType, label)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Re-upload {label}
            </button>
          </div>
        </div>
      )}

      {/* PENDING INFO */}
      {effectiveStatus === 'PENDING' && (
        <div className="mt-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center justify-between">
          <span>Your resubmitted document is undergoing Admin review.</span>
          <button
            onClick={() => onOpenUploadModal(docType, label)}
            className="text-[11px] font-bold text-amber-800 dark:text-amber-300 underline hover:text-amber-900 cursor-pointer ml-2"
          >
            Replace File
          </button>
        </div>
      )}

      {/* APPROVED INFO */}
      {effectiveStatus === 'APPROVED' && (
        <div className="mt-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
          <span>Document verified and approved by System Administrator.</span>
          {document.filePath && (
            <a
              href={document.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View File
            </a>
          )}
        </div>
      )}

    </div>
  );
};

export default KycDocumentCard;
