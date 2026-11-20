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
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border animate-pulse ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-gray-200 shadow-2xs'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="h-24 bg-gray-100 dark:bg-zinc-800/50 rounded-xl sm:rounded-2xl"></div>
          <div className="h-24 bg-gray-100 dark:bg-zinc-800/50 rounded-xl sm:rounded-2xl"></div>
          <div className="h-24 bg-gray-100 dark:bg-zinc-800/50 rounded-xl sm:rounded-2xl"></div>
          <div className="h-24 bg-gray-100 dark:bg-zinc-800/50 rounded-xl sm:rounded-2xl"></div>
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
    <div className={`rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
      isDarkMode 
        ? 'bg-zinc-900/90 border-zinc-800 shadow-xl' 
        : 'bg-white border-gray-200 shadow-xs'
    }`}>
      {/* Top Header */}
      <div className={`p-3 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5 ${
        isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-100 bg-gray-50/60'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`text-[11px] sm:text-sm font-black tracking-tight uppercase truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Way2Smart Messaging Gateway
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {wa.status || 'CONNECTED'}
              </span>
            </div>
            <p className={`text-[10px] sm:text-[11px] mt-0.5 truncate flex items-center gap-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              <span>Sender: <strong className="font-semibold text-gray-700 dark:text-zinc-200">{sms.senderId || 'NEOPCE'}</strong></span>
              <span>•</span>
              <span className="truncate">WABA: <strong className="font-semibold text-gray-700 dark:text-zinc-200">{wa.verifiedName || 'Neopace Infotech'}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border ${
              isDarkMode 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-2xs'
            } ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Refresh Live Balances"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <a
            href={rechargeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-xs hover:scale-[1.02] active:scale-95"
          >
            <span>Buy Credits</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Grid: EXACTLY 2 CARDS PER ROW ON MOBILE (grid-cols-2 lg:grid-cols-4)! */}
      <div className="p-3 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: WhatsApp Reminders Balance */}
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/80'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1 truncate">
                <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </span>
              <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                {wa.qualityRating || 'GREEN'}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className={`text-lg sm:text-2xl font-black ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {(wa.creditsRemaining || 3450).toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">credits</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200/70 dark:border-zinc-700/60 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 dark:text-zinc-400">
            <span className="truncate">Templates: <strong className="text-gray-700 dark:text-zinc-200">{wa.approvedTemplatesCount || 15}</strong></span>
            <span className="shrink-0 uppercase font-bold text-emerald-600 dark:text-emerald-400">{wa.throughput || 'STANDARD'}</span>
          </div>
        </div>

        {/* Card 2: SMS OTP Gateway Balance */}
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/80'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1 truncate">
                <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">SMS / DLT</span>
              </span>
              <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                {sms.status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className={`text-lg sm:text-2xl font-black ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {(sms.creditsRemaining || 1200).toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">credits</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200/70 dark:border-zinc-700/60 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 dark:text-zinc-400">
            <span className="truncate">Header: <strong className="font-mono text-gray-700 dark:text-zinc-200">{sms.senderId || 'NEOPCE'}</strong></span>
            <span className="shrink-0 font-bold text-blue-600 dark:text-blue-400">Priority</span>
          </div>
        </div>

        {/* Card 3: Estimated Runway */}
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
          isCritical
            ? 'bg-red-500/10 border-red-500/30'
            : isWarning
              ? 'bg-amber-500/10 border-amber-500/30'
              : isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/80'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Runway</span>
              </span>
              <span className={`px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider shrink-0 ${
                isCritical
                  ? 'bg-red-500 text-white'
                  : isWarning
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}>
                {daysRemaining}d Left
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className={`text-lg sm:text-2xl font-black ${
                isCritical
                  ? 'text-red-500'
                  : isWarning
                    ? 'text-amber-500'
                    : isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ~{daysRemaining}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">days</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200/70 dark:border-zinc-700/60 flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="text-gray-500 dark:text-zinc-400">Health:</span>
            <strong className={`truncate ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
              {isCritical ? '🚨 Low' : isWarning ? '⚠️ Low' : '🟢 Healthy'}
            </strong>
          </div>
        </div>

        {/* Card 4: Daily Burn Rate */}
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
          isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/80'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1 truncate">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Burn Rate</span>
              </span>
              <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                DAILY
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className={`text-lg sm:text-2xl font-black ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ~{burnRate}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">msgs/day</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200/70 dark:border-zinc-700/60 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 dark:text-zinc-400">
            <span className="truncate">Traffic:</span>
            <strong className="text-gray-700 dark:text-zinc-200 font-mono text-[9px] sm:text-[10px]">Standard</strong>
          </div>
        </div>

      </div>

      {/* Slim Smart Recommendation Bar */}
      <div className={`mx-3 sm:mx-5 mb-3 sm:mb-4 px-3 py-2 sm:py-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
        isDarkMode ? 'bg-purple-950/20 border-purple-800/40 text-purple-200' : 'bg-purple-50/80 border-purple-200 text-purple-950'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-purple-500/20 text-purple-500 shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <p className="text-[10px] sm:text-[11px] leading-tight">
            <span className="font-bold">Smart Recommendation:</span> Purchase {recommendedCount.toLocaleString('en-IN')} Credits (~₹{recommendedBudget.toLocaleString('en-IN')}) for uninterrupted 30-day runway.
          </p>
        </div>

        <a
          href={rechargeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline shrink-0 flex items-center gap-1 self-end sm:self-auto"
        >
          <span>Top Up</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default Way2SmartGatewayWidget;
