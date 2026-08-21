import React from 'react';
import { ShieldAlert, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import useAdminKycQueue from '../../hooks/useAdminKycQueue';
import KycFilterBar from './AdminKYC/KycFilterBar';
import KycSubmissionsTable from './AdminKYC/KycSubmissionsTable';

const AdminKycDashboard = ({ isDarkMode: isDarkModeProp }) => {
  const isDarkMode = isDarkModeProp !== undefined ? isDarkModeProp : document.documentElement.classList.contains('dark');

  const {
    data,
    filters,
    setFilters,
    loading,
    verifyDocument,
    refresh
  } = useAdminKycQueue('PENDING');

  const submissions = data.content || [];
  const totalElements = data.totalElements || submissions.length;
  const totalPages = data.totalPages || 1;

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className={`space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
    }`}>
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-[#FF2A14]/10 text-[#FF2A14] border border-[#FF2A14]/20">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[10px] font-black text-[#FF2A14] uppercase tracking-widest block">
                System Administration
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Admin KYC Verification Queue
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium max-w-xl">
            Review, verify, approve, or reject salon owner compliance document submissions and resubmissions across all registered salons.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-black">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Review</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{totalElements} Submissions</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Status Filter</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{filters.status || 'ALL'}</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 font-black">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Document Filter</span>
            <span className="text-xl font-black text-red-600 dark:text-red-400 truncate max-w-[140px] block">
              {filters.documentType || 'All Types'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <KycFilterBar
        filters={filters}
        setFilters={setFilters}
        isDarkMode={isDarkMode}
      />

      {/* Queue Table */}
      <KycSubmissionsTable
        submissions={submissions}
        loading={loading}
        page={filters.page || 0}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onVerifyDocument={verifyDocument}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default AdminKycDashboard;
