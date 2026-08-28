import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, ShieldAlert, FileText, Clock, RefreshCw, AlertTriangle, CheckCircle2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import kycService from '../../../services/kycService';
import KycDocumentCard from './KycDocumentCard';
import KycUploadModal from './KycUploadModal';

const DEFAULT_DOCUMENTS = [
  { documentType: 'AADHAAR_OR_GOVERNMENT_ID', label: 'Aadhaar / Government ID Proof', status: 'NOT_SUBMITTED' },
  { documentType: 'PAN_CARD', label: 'Owner PAN Card', status: 'NOT_SUBMITTED' },
  { documentType: 'SHOP_ESTABLISHMENT_LICENSE', label: 'Shop Act / Establishment License', status: 'NOT_SUBMITTED' },
  { documentType: 'BANK_ACCOUNT_PROOF', label: 'Bank Account / Cancelled Cheque Proof', status: 'NOT_SUBMITTED' }
];

const OwnerKyc = ({ isDarkMode: isDarkModeProp }) => {
  const reduxSalonId = useSelector((state) => 
    state.ownerStaff?.user?.salonId || 
    state.ownerStaff?.user?.tenantId || 
    state.customer?.user?.salonId || ''
  );

  const activeSalonId = reduxSalonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDocType, setActiveDocType] = useState(null);
  const [activeDocLabel, setActiveDocLabel] = useState('');

  const isDarkMode = isDarkModeProp !== undefined ? isDarkModeProp : document.documentElement.classList.contains('dark');

  const fetchDocuments = useCallback(async () => {
    if (!activeSalonId) {
      setLoading(false);
      setDocuments(DEFAULT_DOCUMENTS);
      return;
    }

    try {
      setLoading(true);
      const res = await kycService.getKycDocuments(activeSalonId);
      const rawData = res.data?.content || res.data || [];
      let extractedDocs = [];

      if (Array.isArray(rawData) && rawData.length > 0) {
        if (Array.isArray(rawData[0].kycDocuments)) {
          extractedDocs = rawData[0].kycDocuments;
        } else if (rawData[0].documentType) {
          extractedDocs = rawData;
        }
      } else if (Array.isArray(res.data?.kycDocuments)) {
        extractedDocs = res.data.kycDocuments;
      }

      const docMap = {};
      extractedDocs.forEach(d => {
        if (d.documentType) {
          docMap[d.documentType] = d;
        }
      });

      const merged = DEFAULT_DOCUMENTS.map(def => {
        if (docMap[def.documentType]) {
          return {
            ...def,
            ...docMap[def.documentType]
          };
        }
        return def;
      });

      setDocuments(merged);
    } catch (err) {
      console.warn("Using default KYC documents layout:", err.message);
      setDocuments(DEFAULT_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  }, [activeSalonId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleOpenUploadModal = (docType, label) => {
    setActiveDocType(docType);
    setActiveDocLabel(label);
    setModalOpen(true);
  };

  const approvedCount = documents.filter(d => (d.status || '').toUpperCase() === 'APPROVED').length;
  const pendingCount = documents.filter(d => {
    const status = (d.status || '').toUpperCase();
    const hasFile = !!(d.fileName || d.uploadedAt || d.filePath);
    return status === 'PENDING' && hasFile;
  }).length;
  const rejectedCount = documents.filter(d => (d.status || '').toUpperCase() === 'REJECTED').length;
  const actionRequiredCount = documents.filter(d => {
    const status = (d.status || '').toUpperCase();
    const hasFile = !!(d.fileName || d.uploadedAt || d.filePath);
    return status === 'REJECTED' || status === 'NOT_SUBMITTED' || (!hasFile && status !== 'APPROVED');
  }).length;

  return (
    <div className={`space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
    }`}>

      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                Verification Center
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Salon KYC & Compliance Verification
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium max-w-xl">
            Upload and manage your salon business licenses, tax certificates, and identity verification documents.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Documents
        </button>
      </div>

      {/* Rejection Alert Header Banner */}
      {rejectedCount > 0 && (
        <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/40 border-l-4 border-l-red-500 border border-red-200 dark:border-red-900/50 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="text-sm font-black uppercase tracking-tight text-red-800 dark:text-red-300">
              Action Required: {rejectedCount} KYC {rejectedCount === 1 ? 'Document' : 'Documents'} Rejected
            </h3>
            <p className="text-red-700 dark:text-red-400 font-medium">
              One or more documents require your attention. Please review the admin feedback below and re-upload clear files to reactivate full verification.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Approved Documents</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{approvedCount} Verified</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-black">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Under Admin Review</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingCount} Pending</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 font-black">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Action Required</span>
            <span className="text-xl font-black text-red-600 dark:text-red-400">{actionRequiredCount} Action Required</span>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Submitted Verification Documents
        </h3>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            <div className="w-8 h-8 border-4 border-[#FF0B01] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading KYC document statuses...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {documents.map((doc, idx) => (
              <KycDocumentCard
                key={doc.id || doc.documentType || idx}
                document={doc}
                onOpenUploadModal={handleOpenUploadModal}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Re-upload Modal */}
      <KycUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        documentType={activeDocType}
        documentLabel={activeDocLabel}
        salonId={activeSalonId}
        onSuccess={fetchDocuments}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default OwnerKyc;
