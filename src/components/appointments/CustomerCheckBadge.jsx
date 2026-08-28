import React from 'react';
import { Gift, Info, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

const CustomerCheckBadge = ({ phoneCheckResult, isDarkMode = false }) => {
  if (!phoneCheckResult) return null;

  const isRegistered = !!phoneCheckResult.exists;

  return (
    <div
      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all animate-in fade-in duration-200 ${
        isRegistered
          ? isDarkMode
            ? 'bg-amber-950/40 text-amber-300 border-amber-800'
            : 'bg-amber-50 text-amber-900 border-amber-300'
          : isDarkMode
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
            : 'bg-emerald-50 text-emerald-900 border-emerald-300'
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
        isRegistered ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
      }`}>
        {isRegistered ? <UserCheck className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
      </div>

      <div className="space-y-0.5 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-black text-xs tracking-tight">
            {isRegistered ? 'Registered Customer' : 'New Customer (3 Referral Points)'}
          </p>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
            isRegistered
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
          }`}>
            {isRegistered ? '0 Points' : '+3 Points Bonus'}
          </span>
        </div>

        <p className="text-[11px] leading-snug opacity-90">
          {phoneCheckResult.message || (
            isRegistered
              ? 'Customer is already registered on NeoParlour. No referral reward points will be claimed.'
              : 'New Customer! Staff will receive 3 referral reward points upon booking completion.'
          )}
        </p>
      </div>
    </div>
  );
};

export default CustomerCheckBadge;
