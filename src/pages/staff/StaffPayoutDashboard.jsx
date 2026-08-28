import React, { useState, useEffect } from 'react';
import { Award, Wallet, ArrowUpRight, History, RefreshCw, ShieldCheck } from 'lucide-react';
import useMyStaffPayouts from '../../hooks/useMyStaffPayouts';
import PayoutRequestModal from './components/PayoutRequestModal';
import PayoutStatusTimeline from './components/PayoutStatusTimeline';

const getIsDarkMode = (prop) => {
  if (prop !== undefined) return prop;
  if (typeof document === 'undefined' || !document || !document.documentElement) return false;
  try {
    return document.documentElement.classList.contains('dark') || (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  } catch (e) {
    return false;
  }
};

const StaffPayoutDashboard = ({ isDarkMode: isDarkModeProp }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => getIsDarkMode(isDarkModeProp));
  const [showRequestModal, setShowRequestModal] = useState(false);

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
    payouts,
    walletBalance,
    loading,
    submitPayoutRequest,
    refresh
  } = useMyStaffPayouts();

  const availablePoints = walletBalance?.availablePoints || 0;
  const totalEarnedPoints = walletBalance?.totalEarnedPoints || availablePoints;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans transition-colors duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
    }`}>
      
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border shadow-2xs transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Staff Portal
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Reward Points & Payouts
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md pt-1">
              Redeem your accumulated appointment referral points for direct UPI or Bank account transfers.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Refresh Wallet Balance & History"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Balance Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
          
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase block">Available Balance</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{availablePoints} Points</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">Equivalent to ₹{availablePoints} INR</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              disabled={availablePoints <= 0}
              className="px-4 py-2.5 rounded-xl bg-[#FF2A14] hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              Redeem Payout
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Total Lifetime Earnings</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalEarnedPoints} Points</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block">Total Rewards Accumulated</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* Payout Request Status History Timeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF2A14]" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Payout Request History & Status Timeline
          </h3>
        </div>

        <PayoutStatusTimeline
          payouts={payouts}
          loading={loading}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Redeem Payout Request Modal */}
      <PayoutRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        availablePoints={availablePoints}
        onSubmit={submitPayoutRequest}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default StaffPayoutDashboard;
