import React, { useState, useEffect } from 'react';
import { Eye, FileText, ChevronLeft, ChevronRight, MapPin, Phone, User, Store, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import KycPreviewModal from './KycPreviewModal';

const STATUS_BADGES = {
  PENDING: { label: '🟡 Pending Review', class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  APPROVED: { label: '🟢 Approved', class: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  REJECTED: { label: '🔴 Rejected', class: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800' }
};

const DOCUMENT_TYPE_LABELS = {
  AADHAAR_OR_GOVERNMENT_ID: 'Aadhaar / Government ID Proof',
  PAN_CARD: 'Owner PAN Card',
  SHOP_ESTABLISHMENT_LICENSE: 'Shop Act / Establishment License',
  BANK_ACCOUNT_PROOF: 'Bank Account / Cancelled Cheque Proof'
};

// Priority sorting helper: PENDING (1) > REJECTED (2) > APPROVED (3)
const getStatusPriority = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'PENDING') return 1;
  if (s === 'REJECTED') return 2;
  if (s === 'APPROVED') return 3;
  return 4;
};

const getIsDarkMode = (prop) => {
  if (prop !== undefined) return prop;
  if (typeof document === 'undefined' || !document || !document.documentElement) return false;
  try {
    return document.documentElement.classList.contains('dark') || (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  } catch (e) {
    return false;
  }
};

const KycSubmissionsTable = ({
  submissions = [],
  loading = false,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  onVerifyDocument,
  isDarkMode: isDarkModeProp
}) => {
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

  const [previewDoc, setPreviewDoc] = useState(null);
  const [expandedSalons, setExpandedSalons] = useState({});

  const toggleExpand = (salonKey) => {
    setExpandedSalons(prev => ({
      ...prev,
      [salonKey]: !prev[salonKey]
    }));
  };

  const salonOwners = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="space-y-3">
      
      {loading ? (
        <div className={`p-10 text-center rounded-2xl border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
        }`}>
          <div className="w-8 h-8 border-3 border-[#FF2A14] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold">Loading KYC verification queue...</p>
        </div>
      ) : salonOwners.length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
        }`}>
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
          <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-zinc-300">
            No KYC Document Submissions Found
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">There are no salon compliance documents matching your active filter criteria.</p>
        </div>
      ) : (
        salonOwners.map((item, salonIdx) => {
          const salonKey = item.ownerId || item.salonId || item.id || salonIdx;
          const isExpanded = !!expandedSalons[salonKey];

          const isOwnerContainer = Array.isArray(item.kycDocuments);
          const rawDocsList = isOwnerContainer ? item.kycDocuments : [item];

          // FILTER ONLY UPLOADED DOCUMENTS (EXCLUDE NOT UPLOADED)
          const uploadedDocs = rawDocsList.filter(d => d.fileName || d.uploadedAt || d.filePath || d.id);

          // SORT DOCUMENTS: PENDING STATUS ON TOP!
          uploadedDocs.sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));

          const ownerName = item.ownerName || item.salonName || 'Salon Owner';
          const ownerMobile = item.ownerMobile || item.ownerPhone || 'N/A';
          const salonName = item.salonName || 'Salon #' + (item.salonId || 'N/A');
          const locationStr = [item.cityName, item.areaName].filter(Boolean).join(', ') || 'Location Unspecified';
          
          const pendingCount = uploadedDocs.filter(d => (d.status || '').toUpperCase() === 'PENDING').length;
          const approvedCount = uploadedDocs.filter(d => (d.status || '').toUpperCase() === 'APPROVED').length;
          const rejectedCount = uploadedDocs.filter(d => (d.status || '').toUpperCase() === 'REJECTED').length;

          // Top prioritized document (Pending on top!) for the 1-row summary
          const topDoc = uploadedDocs[0];
          const extraDocsCount = Math.max(0, uploadedDocs.length - 1);

          return (
            <div
              key={salonKey}
              className={`rounded-2xl border shadow-2xs transition-all duration-200 overflow-hidden ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              
              {/* COMPACT SINGLE SALON ROW */}
              <div className={`p-3.5 sm:p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 transition-colors ${
                isDarkMode ? 'hover:bg-zinc-850' : 'hover:bg-slate-50/70'
              }`}>
                
                {/* 1. Salon & Owner Identity Column */}
                <div className="flex items-center gap-3 min-w-[270px] shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#FF2A14] flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/30 font-bold">
                    <Store className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {salonName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700">
                        <MapPin className="w-2.5 h-2.5 text-[#FF2A14]" />
                        {locationStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <strong className="text-slate-700 dark:text-zinc-200 font-semibold">{ownerName}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        {ownerMobile}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Top Priority Document Preview Container */}
                <div className="flex-1 w-full min-w-[300px]">
                  {topDoc ? (
                    <div className={`p-2.5 px-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      (topDoc.status || '').toUpperCase() === 'PENDING'
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
                        : (topDoc.status || '').toUpperCase() === 'APPROVED'
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40'
                    }`}>
                      
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className={`w-4 h-4 shrink-0 ${
                          (topDoc.status || '').toUpperCase() === 'PENDING' ? 'text-amber-600' : (topDoc.status || '').toUpperCase() === 'APPROVED' ? 'text-emerald-600' : 'text-rose-500'
                        }`} />
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {DOCUMENT_TYPE_LABELS[topDoc.documentType] || topDoc.label || topDoc.documentType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 truncate block font-medium">
                            {topDoc.fileName || 'Uploaded File'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          STATUS_BADGES[(topDoc.status || 'PENDING').toUpperCase()]?.class || STATUS_BADGES.PENDING.class
                        }`}>
                          {STATUS_BADGES[(topDoc.status || 'PENDING').toUpperCase()]?.label || '🟡 Pending Review'}
                        </span>

                        {/* View Document & Verify Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(topDoc)}
                          className="bg-[#FF2A14] hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Document & Verify
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="p-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 text-xs font-semibold text-slate-400 italic text-center">
                      No documents uploaded yet by this salon.
                    </div>
                  )}
                </div>

                {/* 3. Status Summary Counters & Expand Drawer Button */}
                <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    {pendingCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {pendingCount} Pending
                      </span>
                    )}
                    {approvedCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {approvedCount} Approved
                      </span>
                    )}
                    {rejectedCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        {rejectedCount} Rejected
                      </span>
                    )}
                  </div>

                  {uploadedDocs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(salonKey)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                        isExpanded
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70'
                      }`}
                    >
                      <span>{isExpanded ? 'Collapse' : 'View All (' + uploadedDocs.length + ')'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

              </div>

              {/* EXPANDED DRAWER LIST (WHEN VIEW ALL IS CLICKED) */}
              {isExpanded && uploadedDocs.length > 0 && (
                <div className={`border-t p-4 sm:p-5 space-y-2.5 transition-all ${
                  isDarkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-50/60 border-slate-150'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF2A14]" />
                      All Uploaded Documents ({uploadedDocs.length} Files • Pending First)
                    </span>
                  </div>

                  {uploadedDocs.map((doc, docIdx) => {
                    const statusKey = (doc.status || 'PENDING').toUpperCase();
                    const badge = STATUS_BADGES[statusKey] || STATUS_BADGES.PENDING;
                    const docLabel = DOCUMENT_TYPE_LABELS[doc.documentType] || doc.label || doc.documentType;
                    const submittedDate = doc.uploadedAt || doc.createdAt
                      ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                      : null;

                    return (
                      <div
                        key={doc.id || doc.documentType || docIdx}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                          statusKey === 'PENDING'
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                            : statusKey === 'APPROVED'
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                              : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            statusKey === 'PENDING' ? 'bg-amber-100 text-amber-700' : statusKey === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>

                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {docLabel}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                              <span className="truncate max-w-[180px] font-semibold">{doc.fileName || 'KYC_Document.png'}</span>
                              {submittedDate && <span>• {submittedDate}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badge.class}`}>
                            {badge.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="bg-[#FF2A14] hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Document & Verify
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500 shadow-2xs'
        }`}>
          <div>
            Showing Page {page + 1} of {totalPages} ({totalElements} registered salons)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Authenticated Preview & Verification Popup Modal */}
      <KycPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onConfirm={onVerifyDocument}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default KycSubmissionsTable;
