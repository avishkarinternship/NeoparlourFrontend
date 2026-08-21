import React from 'react';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';

const SalonBanBanner = ({ salon, isDarkMode = false }) => {
  if (!salon || (!salon.banned && !salon.isBanned)) {
    return null;
  }

  const banReason = salon.banReason || salon.reason || "Violation of Terms of Service";
  const bannedDate = salon.bannedAt
    ? new Date(salon.bannedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently';

  return (
    <div className={`p-4 sm:p-5 mb-6 rounded-3xl border-l-4 border-l-amber-500 shadow-sm transition-all ${
      isDarkMode
        ? 'bg-amber-950/30 border-t border-r border-b border-amber-900/50 text-amber-200'
        : 'bg-amber-50/90 border-t border-r border-b border-amber-200/80 text-amber-900'
    }`}>
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
          <AlertTriangle className="w-5.5 h-5.5" />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-tight text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" /> Salon Account Banned by Admin
            </h3>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[10px] rounded-md uppercase">
              Banned on {bannedDate}
            </span>
          </div>

          <p className="font-bold text-amber-900 dark:text-amber-200 text-xs mt-1">
            <span className="font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Ban Reason:</span> {banReason}
          </p>

          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400/90 mt-1 leading-relaxed">
            * You can still view reports, staff data, and salon settings, but walk-in and online appointment bookings are currently disabled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalonBanBanner;
