import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle2, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';
import useAdminPayoutQueue from '../../hooks/useAdminPayoutQueue';
import AdminPayoutFilterBar from './components/AdminPayoutFilterBar';
import AdminPayoutTable from './components/AdminPayoutTable';

const getIsDarkMode = (prop) => {
  if (prop !== undefined) return prop;
  if (typeof document === 'undefined' || !document || !document.documentElement) return false;
  try {
    return document.documentElement.classList.contains('dark') || (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  } catch (e) {
    return false;
  }
};

const AdminPayoutQueueDashboard = ({ isDarkMode: isDarkModeProp }) => {
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
    processPayout,
    refresh
  } = useAdminPayoutQueue('PENDING');

  const requests = data.content || [];
  const totalElements = data.totalElements || requests.length;
  const totalPages = data.totalPages || 1;

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans transition-colors duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
    }`}>
      
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border shadow-2xs transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#FF2A14] flex items-center justify-center font-bold border border-red-100 dark:border-red-900/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#FF2A14] uppercase tracking-wider block">
                  System Administration
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Staff Payout Request Queue
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xl pt-1">
              Review, approve, and record bank UTR reference numbers for staff reward points redemption payout requests.
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
          
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase block">Pending Payouts</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{totalElements} Requests</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase block">Active Status Filter</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{filters.status || 'ALL'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#FF2A14] flex items-center justify-center shrink-0 font-bold">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase block">Method Filter</span>
              <span className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[140px] block">
                {filters.payoutMethod || 'All Methods'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Specification Filter Bar */}
      <AdminPayoutFilterBar
        filters={filters}
        setFilters={setFilters}
        isDarkMode={isDarkMode}
      />

      {/* Payout Requests Data Table */}
      <AdminPayoutTable
        data={data}
        loading={loading}
        page={filters.page || 0}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onProcessPayout={processPayout}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default AdminPayoutQueueDashboard;
