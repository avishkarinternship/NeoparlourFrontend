import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle2, RefreshCw, Building2 } from 'lucide-react';
import useAdminKycQueue from '../../hooks/useAdminKycQueue';
import KycFilterBar from './AdminKYC/KycFilterBar';
import KycSubmissionsTable from './AdminKYC/KycSubmissionsTable';

const getIsDarkMode = (prop) => {
  if (prop !== undefined) return prop;
  if (typeof document === 'undefined' || !document || !document.documentElement) return false;
  try {
    return document.documentElement.classList.contains('dark') || (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  } catch (e) {
    return false;
  }
};

const AdminKycDashboard = ({ isDarkMode: isDarkModeProp }) => {
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
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans transition-colors duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
    }`}>
      
      {/* Clean Flat Header Banner */}
      <div className={`p-6 sm:p-7 rounded-2xl border shadow-2xs transition-all duration-300 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#FF2A14] flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#FF2A14] uppercase tracking-wider block">
                  Admin Verification Center
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Salon KYC Verification Queue
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xl">
              Review and inspect compliance media documents uploaded by registered salon owners across the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="bg-[#FF2A14] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Integrated Metric Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
          
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase block">Active Queue</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{totalElements} Registered Salons</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase block">Status Filter</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{filters.status || 'ALL'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#FF2A14] flex items-center justify-center shrink-0 font-bold">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase block">Category Scope</span>
              <span className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[140px] block">
                {filters.documentType ? filters.documentType.replace(/_/g, ' ') : 'All Document Types'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <KycFilterBar
        filters={filters}
        setFilters={setFilters}
        isDarkMode={isDarkMode}
      />

      {/* Clean Salon Cards Queue */}
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
