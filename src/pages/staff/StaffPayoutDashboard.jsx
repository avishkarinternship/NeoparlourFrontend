import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, Wallet, ArrowUpRight, History, RefreshCw, ShieldCheck, ChevronLeft } from 'lucide-react';
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

const StaffPayoutDashboard = ({ isDarkMode: isDarkModeProp, staffId: propStaffId }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => getIsDarkMode(isDarkModeProp));
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const activeStaffId = propStaffId || (() => {
    try {
      const u = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
      if (u.staffId) return u.staffId;
      if (u.id) return u.id;
    } catch (e) {
      console.warn("Failed to parse user for staffId:", e);
    }
    return localStorage.getItem('staff_id') || localStorage.getItem('staff_user_id') || localStorage.getItem('user_id') || null;
  })();

  const {
    payouts,
    walletBalance,
    loading,
    submitPayoutRequest,
    refresh
  } = useMyStaffPayouts(activeStaffId);

  const availablePoints = walletBalance?.availablePoints || 0;
  const totalEarnedPoints = walletBalance?.totalEarnedPoints || availablePoints;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans transition-colors duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
    }`}>
      
      {/* Back to dashboard button if accessed standalone */}
      {location.pathname === '/staff/payouts' && (
        <button
          type="button"
          onClick={() => navigate('/staff/dashboard')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-card-interactive text-xs font-bold text-slate-700 dark:text-zinc-300 transition cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--brand-primary,#7C3AED)]" />
          Back to Staff Dashboard
        </button>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-2xl glass-card shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
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
            className="p-2.5 rounded-xl glass-card-interactive transition cursor-pointer"
            title="Refresh Wallet Balance & History"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Balance Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/20 dark:border-white/10">
          
          <div className="p-4 rounded-xl glass-card border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase block">Available Balance</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{availablePoints} Points</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">Equivalent to ₹{availablePoints} INR</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              disabled={availablePoints <= 0}
              className="px-4 py-2.5 rounded-xl bg-[var(--brand-primary,#7C3AED)] hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition"
              style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff' }}
            >
              <ArrowUpRight className="w-4 h-4" />
              Redeem Payout
            </button>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/20 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Total Lifetime Earnings</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalEarnedPoints} Points</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block">Total Rewards Accumulated</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* Payout Request Status History Timeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--brand-primary,#7C3AED)]" />
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
