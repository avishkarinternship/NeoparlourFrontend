import React, { useState } from 'react';
import maintenanceGif from '../../assets/Server/server_under_maintenance.gif';
import { RefreshCw, Wrench, ArrowLeft, Headphones, WifiOff, Clock, ShieldAlert } from 'lucide-react';
import { getMaintenanceErrorDetails } from '../../utils/errorFeedbackHelper';

const ServerMaintenance = ({
  status = 503,
  code = '',
  message = '',
  onRetry,
  isOverlay = false,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const errorDetails = getMaintenanceErrorDetails(status, code, message);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    } else {
      window.location.reload();
    }
    setTimeout(() => {
      setIsRetrying(false);
    }, 1200);
  };

  // Select dynamic status icon
  const getBadgeIcon = () => {
    if (status === 504 || (code && code.includes('TIMEOUT'))) {
      return <Clock className="w-3.5 h-3.5" />;
    }
    if (code && (code.includes('NAME_NOT_RESOLVED') || code.includes('NETWORK'))) {
      return <WifiOff className="w-3.5 h-3.5" />;
    }
    if (status === 502) {
      return <ShieldAlert className="w-3.5 h-3.5" />;
    }
    return <Wrench className="w-3.5 h-3.5" />;
  };

  return (
    <div
      className={`${
        isOverlay ? 'fixed inset-0 z-[999999]' : 'min-h-screen'
      } bg-white flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto`}
    >
      <div className="max-w-lg w-full flex flex-col items-center">
        {/* Maintenance GIF */}
        <div className="relative mb-6 w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center">
          <img
            src={maintenanceGif}
            alt="Server Status"
            className="w-full h-full object-contain pointer-events-none drop-shadow-md"
          />
        </div>

        {/* Dynamic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#FF0B01] border border-red-100 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
          {getBadgeIcon()}
          <span>{errorDetails.badge}</span>
        </div>

        {/* Dynamic Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          {errorDetails.title}
        </h1>

        {/* Dynamic Description */}
        <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed mb-3 max-w-md">
          {errorDetails.message}
        </p>

        {/* Friendly Reassurance / Hint */}
        {errorDetails.hint && (
          <p className="text-xs sm:text-sm text-gray-400 font-normal mb-8 max-w-sm">
            {errorDetails.hint}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF0B01] to-[#D00600] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking Connection...' : 'Try Again'}</span>
          </button>

          {!isOverlay && (
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm tracking-wide active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>

        {/* Assistance / Support Footer */}
        <div className="mt-10 pt-6 border-t border-gray-100 w-full flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-gray-400" />
            <span>Need immediate assistance?</span>
          </div>
          <a
            href="mailto:support@neoparlour.com"
            className="text-gray-700 hover:text-[#FF0B01] font-semibold underline underline-offset-2 transition-colors"
          >
            support@neoparlour.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServerMaintenance;
