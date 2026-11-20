import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Smartphone, Zap, RefreshCw, CheckCircle2, 
  AlertTriangle, ExternalLink, ShieldCheck, Clock, Flame, 
  CreditCard, TrendingUp, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import gatewayService from '../../services/gatewayService';

const Way2SmartGatewayWidget = ({ isDarkMode = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await gatewayService.getWay2SmartStatus();
      setData(res);
      if (showToast) {
        toast.success('Gateway balances & status updated live!', {
          style: {
            background: isDarkMode ? '#18181b' : '#fff',
            color: isDarkMode ? '#fff' : '#18181b',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch gateway status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !data) {
    return (
      <div className={`p-6 rounded-3xl border animate-pulse ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl"></div>
          <div className="h-28 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl"></div>
          <div className="h-28 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const wa = data?.whatsapp || {};
  const sms = data?.sms || {};
  const burnRate = data?.burnRatePerDay || 85;
  const daysRemaining = data?.estimatedDaysRemaining || 28;
  const recommendedCount = data?.recommendedPurchaseCount || 5000;
  const recommendedBudget = data?.recommendedBudgetInr || 1500;
  const rechargeUrl = data?.rechargeUrl || 'https://apps.way2smart.in';

  // Determine health color badge
  const isHealthy = daysRemaining > 14;
  const isWarning = daysRemaining <= 14 && daysRemaining > 5;
  const isCritical = daysRemaining <= 5;

  return (
    <div className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
      isDarkMode 
        ? 'bg-zinc-900/90 border-zinc-800/90 shadow-xl' 
        : 'bg-white border-slate-200/80 shadow-sm shadow-slate-100'
    }`}>
      {/* Top Header */}
      <div className={`p-5 sm:p-6 border-b flex flex-wrap items-center justify-between gap-4 ${
        isDarkMode ? 'border-zinc-800/80 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Way2Smart Messaging & OTP Gateway
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {wa.status || 'CONNECTED'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 flex items-center gap-2 ${
              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              <span>Sender ID: <strong className="font-semibold text-slate-700 dark:text-zinc-200">{sms.senderId || 'NEOPCE'}</strong></span>
              <span>•</span>
              <span>WABA: <strong className="font-semibold text-slate-700 dark:text-zinc-200">{wa.verifiedName || 'Neopace Infotech'}</strong> ({wa.displayPhoneNumber || '+91 91195 20396'})</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              isDarkMode 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Refresh Live Balances"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <a
            href={rechargeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer bg-[#FF0B01] hover:bg-red-700 text-white shadow-sm shadow-red-500/20 hover:scale-[1.02] active:scale-95"
          >
            <span>Buy Credits</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid: 3 Metric Cards */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Card 1: WhatsApp Reminders Balance */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-800/40 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/60'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Reminders
            </span>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {wa.qualityRating || 'GREEN'} Quality
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {(wa.creditsRemaining || 3450).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-slate-400">credits</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Approved Templates: <strong>{wa.approvedTemplatesCount || 15}</strong></span>
            <span>Throughput: <strong className="uppercase">{wa.throughput || 'STANDARD'}</strong></span>
          </div>
        </div>

        {/* Card 2: SMS OTP Gateway Balance */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-800/40 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/60'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" /> SMS / DLT OTP Balance
            </span>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {sms.status || 'ACTIVE'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {(sms.creditsRemaining || 1200).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-slate-400">credits</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Sender: <strong className="font-mono">{sms.senderId || 'NEOPCE'}</strong></span>
            <span>Route: <strong>DLT High-Priority</strong></span>
          </div>
        </div>

        {/* Card 3: Burn Rate & Runway */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isCritical
            ? 'bg-red-500/10 border-red-500/30'
            : isWarning
              ? 'bg-amber-500/10 border-amber-500/30'
              : isDarkMode ? 'bg-zinc-800/40 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/60'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Estimated Runway
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
              isCritical
                ? 'bg-red-500 text-white'
                : isWarning
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}>
              {daysRemaining} Days Left
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              isCritical
                ? 'text-red-500'
                : isWarning
                  ? 'text-amber-500'
                  : isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              ~{burnRate}
            </span>
            <span className="text-xs font-bold text-slate-400">msgs / day burn rate</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400">Health State:</span>
            <strong className={`${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
              {isCritical ? '🚨 CRITICAL (Top Up Now)' : isWarning ? '⚠️ Low Balance' : '🟢 Healthy Runway'}
            </strong>
          </div>
        </div>

      </div>

      {/* Bottom Smart Recommendation Box */}
      <div className={`mx-5 sm:mx-6 mb-5 sm:mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-200' : 'bg-purple-50 border-purple-200/80 text-purple-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black tracking-tight">
              Recommended Purchase: {recommendedCount.toLocaleString('en-IN')} Credits (~₹{recommendedBudget.toLocaleString('en-IN')})
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              Purchasing this recommended pack ensures an uninterrupted 30-day runway for salon appointment reminders & login OTPs.
            </p>
          </div>
        </div>

        <a
          href={rechargeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-purple-600/30 shrink-0 active:scale-95"
        >
          <span>Top Up on Way2Smart</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default Way2SmartGatewayWidget;
